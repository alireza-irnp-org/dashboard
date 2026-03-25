import { createAzure } from "@ai-sdk/azure";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { embedMany, generateId } from "ai";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { file, fileChunk } from "@/lib/db/schema";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";
import { extractContent } from "./extract";

const CHUNK_SIZE = 1500; // characters (~375 tokens)
const CHUNK_OVERLAP = 150;
const EMBED_BATCH_SIZE = 100; // Azure OpenAI embedding batch limit

export async function processFile(fileId: string): Promise<void> {
  try {
    // 1. Fetch file record
    const [fileRecord] = await db
      .select()
      .from(file)
      .where(eq(file.id, fileId))
      .limit(1);

    if (!fileRecord) throw new Error(`File record not found: ${fileId}`);
    const { storagePath, mimeType, filename, threadId } = fileRecord;

    // 2. Download from Supabase Storage
    await db.update(file).set({ status: "extracting" }).where(eq(file.id, fileId));

    const { data: blob, error: downloadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(storagePath);

    if (downloadError || !blob) {
      throw new Error(`Storage download failed: ${downloadError?.message}`);
    }

    const buffer = Buffer.from(await blob.arrayBuffer());

    // 3. Extract content blocks
    const blocks = await extractContent(buffer, mimeType, filename);

    if (blocks.length === 0) {
      await db.update(file).set({ status: "ready" }).where(eq(file.id, fileId));
      return;
    }

    // 4. Chunk content
    await db.update(file).set({ status: "chunking" }).where(eq(file.id, fileId));

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
    });

    const chunks: Array<{
      content: string;
      chunkType: string;
      metadata: Record<string, unknown>;
    }> = [];

    for (const block of blocks) {
      // Image descriptions are already concise; don't split them further
      if (block.chunkType === "image_description") {
        chunks.push(block);
      } else {
        const splits = await splitter.splitText(block.content);
        for (const split of splits) {
          chunks.push({
            content: split,
            chunkType: block.chunkType,
            metadata: block.metadata,
          });
        }
      }
    }

    // 5. Embed chunks in batches
    await db.update(file).set({ status: "embedding" }).where(eq(file.id, fileId));

    const embeddingProvider = createAzure({
      resourceName: process.env.AZURE_EMBEDDING_RESOURCE_NAME!,
      apiKey: process.env.AZURE_EMBEDDING_API_KEY!,
    });

    const embeddingModel = embeddingProvider.textEmbeddingModel(
      process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
    );

    const allEmbeddings: number[][] = [];

    for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
      const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
      const { embeddings } = await embedMany({
        model: embeddingModel,
        values: batch.map((c) => c.content),
      });
      allEmbeddings.push(...embeddings);
    }

    // 6. Persist chunks to DB in batches of 50 (pg parameter limit safety)
    const rows = chunks.map((chunk, i) => ({
      id: generateId(),
      fileId,
      threadId,
      chunkIndex: i,
      content: chunk.content,
      chunkType: chunk.chunkType,
      embedding: allEmbeddings[i],
      metadata: chunk.metadata,
    }));

    const DB_INSERT_BATCH = 50;
    for (let i = 0; i < rows.length; i += DB_INSERT_BATCH) {
      await db.insert(fileChunk).values(rows.slice(i, i + DB_INSERT_BATCH));
    }

    // 7. Mark as ready
    await db
      .update(file)
      .set({ status: "ready", error: null })
      .where(eq(file.id, fileId));
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await db
      .update(file)
      .set({ status: "failed", error: errorMsg })
      .where(eq(file.id, fileId))
      .catch(console.error);
    throw err;
  }
}
