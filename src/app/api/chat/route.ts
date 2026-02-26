// import { openai } from "@ai-sdk/openai";
import { azure, createAzure } from "@ai-sdk/azure";
import { google } from "@ai-sdk/google";
import type { UIMessage } from "ai";
import { convertToModelMessages, streamText, tool, zodSchema } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  //   const azure = createAzure({
  //     resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME,
  //     apiKey: process.env.AZURE_API_KEY,
  //   });

  const result = streamText({
    // model: openai("gpt-4o"),
    // model: azure(process.env.AZURE_OPENAI_ENDPOINT!),
    model: google("gemini-2.5-flash"),
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
