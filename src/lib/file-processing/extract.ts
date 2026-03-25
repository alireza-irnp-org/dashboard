import { createAzure } from "@ai-sdk/azure";
import { generateText } from "ai";
import mammoth from "mammoth";
import officeParser from "officeparser";
import * as XLSX from "xlsx";

export type ExtractedBlock = {
  content: string;
  chunkType: "text" | "table" | "image_description";
  metadata: Record<string, unknown>;
};

export async function extractContent(
  buffer: Buffer,
  mimeType: string,
  filename: string,
): Promise<ExtractedBlock[]> {
  switch (mimeType) {
    case "application/pdf":
      return extractPdf(buffer);

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    case "application/msword":
      return extractDocx(buffer);

    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    case "text/csv":
      return extractSpreadsheet(buffer);

    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return extractPptx(buffer);

    case "text/plain":
    case "text/markdown":
      return [
        { content: buffer.toString("utf-8").trim(), chunkType: "text", metadata: {} },
      ];

    case "image/jpeg":
    case "image/png":
    case "image/webp":
      return extractImage(buffer, mimeType, filename);

    default:
      return [];
  }
}

async function extractPdf(buffer: Buffer): Promise<ExtractedBlock[]> {
  // Import the parser directly to skip pdf-parse's self-test (which reads a local test file)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (buf: Buffer) => Promise<{ text: string; numpages: number }>;
  const data = await pdfParse(buffer);
  if (!data.text?.trim()) return [];
  return [
    {
      content: data.text.trim(),
      chunkType: "text",
      metadata: { pages: data.numpages },
    },
  ];
}

async function extractDocx(buffer: Buffer): Promise<ExtractedBlock[]> {
  const { value } = await mammoth.extractRawText({ buffer });
  if (!value?.trim()) return [];
  return [{ content: value.trim(), chunkType: "text", metadata: {} }];
}

async function extractSpreadsheet(buffer: Buffer): Promise<ExtractedBlock[]> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const blocks: ExtractedBlock[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
    if (csv.trim()) {
      blocks.push({
        content: `Sheet: ${sheetName}\n${csv.trim()}`,
        chunkType: "table",
        metadata: { sheet: sheetName },
      });
    }
  }

  return blocks;
}

async function extractPptx(buffer: Buffer): Promise<ExtractedBlock[]> {
  // officeParser.parseOfficeAsync accepts a Buffer directly
  const text = await (officeParser as unknown as { parseOfficeAsync: (input: Buffer) => Promise<string> })
    .parseOfficeAsync(buffer);
  if (!text?.trim()) return [];
  return [{ content: text.trim(), chunkType: "text", metadata: {} }];
}

async function extractImage(
  buffer: Buffer,
  mimeType: string,
  filename: string,
): Promise<ExtractedBlock[]> {
  // Image description uses the chat resource (gpt-4o has vision)
  const azure = createAzure({
    resourceName: process.env.AZURE_GPT5_RESOURCE_NAME!,
    apiKey: process.env.AZURE_GPT5_API_KEY!,
  });

  const { text } = await generateText({
    model: azure(process.env.AZURE_CHAT_DEPLOYMENT ?? "gpt-4o"),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Describe all visible text, data, charts, tables, and important visual content in this image in full detail. Filename: ${filename}`,
          },
          {
            type: "image",
            image: buffer,
            mediaType: mimeType as "image/jpeg" | "image/png" | "image/webp",
          },
        ],
      },
    ],
  });

  if (!text?.trim()) return [];
  return [
    {
      content: text.trim(),
      chunkType: "image_description",
      metadata: { filename },
    },
  ];
}
