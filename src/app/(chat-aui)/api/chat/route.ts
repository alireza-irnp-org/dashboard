// import { openai } from "@ai-sdk/openai";
import { fetchWeatherWidgetData } from "@/components/assistant-ui/weatherAdapter";
import { SerializableLinkPreviewSchema } from "@/components/tool-ui/link-preview/schema";
import { azure, createAzure } from "@ai-sdk/azure";
import { google } from "@ai-sdk/google";
import type { UIMessage } from "ai";
import {
  convertToModelMessages,
  jsonSchema,
  streamText,
  tool,
  zodSchema,
} from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const customAzure = createAzure({
    resourceName: process.env.AZURE_GPT5_RESOURCE_NAME,
    // apiVersion: process.env.AZURE_GPT5_API_VERSION,
    apiKey: process.env.AZURE_GPT5_API_KEY!,
    // Connection reuse is handled automatically by the SDK and underlying fetch
  });

  const result = streamText({
    // model: openai("gpt-4o"),
    // model: azure(process.env.AZURE_OPENAI_ENDPOINT!),
    // model: google("gemini-2.5-flash"),
    model: customAzure("gpt-5.2"),
    messages: await convertToModelMessages(messages), // Note: async in v6
    tools: {
      get_weather: tool({
        description: "Get live weather data for a city",
        inputSchema: zodSchema(
          z.object({
            city: z.string(),
          }),
        ),
        execute: async ({ city }) => {
          const data = await fetchWeatherWidgetData(city);
          return data; // returns structured payload (NOT string)
        },
      }),
      // previewLink: tool({
      //   description: "Show a preview card for a URL",
      //   inputSchema: z.object({ url: z.url() }),
      //   // outputSchema tells the AI SDK what shape the result will have
      //   outputSchema: SerializableLinkPreviewSchema,
      //   async execute({ url }) {
      //     // Fetch metadata and return structured data
      //     return {
      //       id: "link-preview-1",
      //       href: url,
      //       title: "Example Site",
      //       description: "A description of the linked content",
      //       image: "https://example.com/image.jpg",
      //     };
      //   },
      // }),
      previewLink: tool({
        description: "Show a preview card for a URL",
        inputSchema: jsonSchema<{ url: string }>({
          type: "object",
          properties: { url: { type: "string", format: "uri" } },
          required: ["url"],
          additionalProperties: false,
        }),
        // execute() runs on the server when the LLM calls the tool.
        // It returns JSON that matches the LinkPreview component's schema.
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
