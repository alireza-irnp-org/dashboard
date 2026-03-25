import { fetchWeatherWidgetData } from "@/components/assistant-ui/weatherAdapter";
import { auth } from "@/lib/auth/auth";
import { after } from "next/server";
import { db } from "@/lib/db";
import { file, fileChunk } from "@/lib/db/schema";
import { processFile } from "@/lib/file-processing/pipeline";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";
import { createAzure } from "@ai-sdk/azure";
import type { UIMessage } from "ai";
import {
  convertToModelMessages,
  embed,
  generateId,
  jsonSchema,
  streamText,
  tool,
  zodSchema,
} from "ai";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { z } from "zod";

export const maxDuration = 60;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
  "text/markdown",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

// Strip file parts from historical messages to avoid token bloat.
// Only the current (last) user message keeps its files for the model to see directly.
function prepareMessagesForModel(messages: UIMessage[]): UIMessage[] {
  const lastUserIdx = messages.findLastIndex((m) => m.role === "user");
  return messages.map((msg, idx) => {
    if (idx === lastUserIdx) return msg;
    return { ...msg, parts: msg.parts.filter((p) => p.type !== "file") };
  });
}

// Parse a base64 data URL → { mimeType, buffer } or null if it is a hosted URL
function parseDataUrl(url: string): { mimeType: string; buffer: Buffer } | null {
  const match = url.match(/^data:([^;]+);base64,([A-Za-z0-9+/=\n]+)$/);
  if (!match) return null;
  return { mimeType: match[1], buffer: Buffer.from(match[2], "base64") };
}

export async function POST(req: Request) {
  const body = await req.json();
  const messages: UIMessage[] = body.messages;
  const threadId: string | undefined = body.threadId;

  // Chat model (gpt-4o) — satta resource
  const azureProvider = createAzure({
    resourceName: process.env.AZURE_GPT5_RESOURCE_NAME!,
    apiKey: process.env.AZURE_GPT5_API_KEY!,
  });

  // Embedding model (text-embedding-3-small) — foundry resource
  const embeddingProvider = createAzure({
    resourceName: process.env.AZURE_EMBEDDING_RESOURCE_NAME!,
    apiKey: process.env.AZURE_EMBEDDING_API_KEY!,
  });

  // ── 1. Auth — needed for scoped storage paths ──────────────────────────────
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    userId = session?.user?.id;
  } catch {
    // proceed without auth; file upload will be skipped
  }

  // ── 2. Upload any files attached to the current user message ───────────────
  const currentUserMsg = [...messages].reverse().find((m) => m.role === "user");

  if (currentUserMsg && userId && threadId) {
    const fileParts = currentUserMsg.parts.filter(
      (p): p is Extract<(typeof currentUserMsg.parts)[number], { type: "file" }> =>
        p.type === "file",
    );

    for (const part of fileParts) {
      const parsed = parseDataUrl(part.url);
      if (!parsed) continue; // hosted URL — already stored elsewhere

      const { mimeType, buffer } = parsed;
      if (!ALLOWED_MIME_TYPES.has(mimeType)) continue;

      const fileId = generateId();
      const filename = part.filename ?? `file-${fileId}`;
      const storagePath = `${userId}/${threadId}/${fileId}/${filename}`;

      const { error: uploadErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, buffer, { contentType: mimeType, upsert: false });

      if (uploadErr) {
        console.error("Storage upload error:", uploadErr.message);
        continue;
      }

      await db.insert(file).values({
        id: fileId,
        threadId,
        messageId: null, // message not yet persisted; thread-scoped is sufficient
        userId,
        storagePath,
        filename,
        mimeType,
        sizeBytes: buffer.byteLength,
        status: "pending",
      });

      // Run pipeline after the response is sent (Next.js 15+ after()).
      // Works correctly on Vercel and other serverless runtimes.
      after(() =>
        processFile(fileId).catch((err) =>
          console.error(`Pipeline failed for file ${fileId}:`, err),
        ),
      );
    }
  }

  // ── 3. RAG — inject relevant chunks from previously processed files ────────
  let ragSystemPrompt: string | undefined;

  if (threadId && process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT) {
    try {
      const userText = currentUserMsg?.parts
        .filter((p): p is Extract<(typeof currentUserMsg.parts)[number], { type: "text" }> =>
          p.type === "text",
        )
        .map((p) => p.text)
        .join(" ")
        .trim();

      if (userText) {
        const { embedding: queryEmbedding } = await embed({
          model: embeddingProvider.textEmbeddingModel(
            process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT,
          ),
          value: userText,
        });

        // Values are floats from the embedding API — safe to interpolate
        const vectorStr = `[${queryEmbedding.map((n) => +n.toFixed(8)).join(",")}]`;

        const relevantChunks = await db
          .select({
            content: fileChunk.content,
            filename: file.filename,
            chunkType: fileChunk.chunkType,
          })
          .from(fileChunk)
          .leftJoin(file, eq(fileChunk.fileId, file.id))
          .where(
            and(
              eq(fileChunk.threadId, threadId),
              isNotNull(fileChunk.embedding),
              eq(file.status, "ready"),
            ),
          )
          .orderBy(
            sql`${fileChunk.embedding} <=> ${sql.raw(`'${vectorStr}'`)}::vector`,
          )
          .limit(8);

        if (relevantChunks.length > 0) {
          ragSystemPrompt =
            "Relevant excerpts from files previously uploaded in this conversation:\n\n" +
            relevantChunks
              .map((c) => `[${c.filename ?? "file"} — ${c.chunkType}]\n${c.content}`)
              .join("\n\n---\n\n") +
            "\n\nUse the above context to answer the user's question when relevant.";
        }
      }
    } catch (err) {
      // RAG failure must never block the chat response
      console.error("RAG retrieval error:", err);
    }
  }

  // ── 4. Stream AI response ──────────────────────────────────────────────────
  const result = streamText({
    model: azureProvider(process.env.AZURE_CHAT_DEPLOYMENT ?? "gpt-4o"),
    system: ragSystemPrompt,
    messages: await convertToModelMessages(prepareMessagesForModel(messages)),
    tools: {
      get_weather: tool({
        description: "Get live weather data for a city",
        inputSchema: zodSchema(z.object({ city: z.string() })),
        execute: async ({ city }) => fetchWeatherWidgetData(city),
      }),
      previewLink: tool({
        description: "Show a preview card for a URL",
        inputSchema: jsonSchema<{ url: string }>({
          type: "object",
          properties: { url: { type: "string", format: "uri" } },
          required: ["url"],
          additionalProperties: false,
        }),
        async execute({ url }) {
          return {
            id: "link-preview-1",
            href: url,
            title: "Example Site",
            description: "A description of the linked content",
            image: "https://example.com/image.jpg",
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
