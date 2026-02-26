// import { openai } from "@ai-sdk/openai";
import { azure, createAzure } from "@ai-sdk/azure";
import { google } from "@ai-sdk/google";
import type { UIMessage } from "ai";
import { convertToModelMessages, streamText, tool, zodSchema } from "ai";
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
      get_current_weather: tool({
        description: "Get the current weather",
        inputSchema: zodSchema(
          z.object({
            city: z.string(),
          }),
        ),
        execute: async ({ city }) => {
          return `The weather in ${city} is sunny`;
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
