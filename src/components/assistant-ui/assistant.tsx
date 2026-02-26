"use client";

import { Thread } from "@/components/assistant-ui/thread";
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar";
import { LinkPreview } from "@/components/tool-ui/link-preview";
import { safeParseSerializableLinkPreview } from "@/components/tool-ui/link-preview/schema";
import {
  WeatherWidget,
  type WeatherWidgetProps,
} from "@/components/tool-ui/weather-widget/runtime";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  AssistantRuntimeProvider,
  Tools,
  useAui,
  WebSpeechDictationAdapter,
  type Toolkit,
} from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { DevToolsModal } from "@assistant-ui/react-devtools";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { z } from "zod";

const WeatherWidgetPayloadSchema = z.object({}).passthrough();
function safeParseWeatherWidgetPayload(
  input: unknown,
): WeatherWidgetProps | null {
  if (input == null || typeof input !== "object") return null;
  const result = WeatherWidgetPayloadSchema.safeParse(input);
  if (
    !result.success ||
    typeof result.data !== "object" ||
    result.data === null
  ) {
    return null;
  }
  const data = result.data as Record<string, unknown>;
  const current = data.current as { conditionCode?: string } | undefined;
  const forecast = data.forecast as unknown[];
  if (
    !current ||
    typeof current.conditionCode !== "string" ||
    !Array.isArray(forecast) ||
    forecast.length === 0
  ) {
    return null;
  }
  return {
    version: "3.1",
    ...(data as Omit<WeatherWidgetProps, "version">),
  };
}

const toolkit: Toolkit = {
  previewLink: {
    type: "backend",
    render: ({ result }) => {
      const parsed = safeParseSerializableLinkPreview(result);
      if (!parsed) return null; // Wait for full payload before rendering
      return <LinkPreview {...parsed} />;
    },
  },
  get_weather: {
    description: "Display current weather and forecast for a location",
    parameters: WeatherWidgetPayloadSchema,
    render: ({ result, toolCallId }) => {
      if (result == null) return null;
      const parsed = safeParseWeatherWidgetPayload({
        version: "3.1",
        ...(result as Record<string, unknown>),
        id: (result as { id?: string })?.id ?? `weather-${toolCallId}`,
      });
      if (!parsed) return null;
      return <WeatherWidget effects={{ reducedMotion: true }} {...parsed} />;
    },
  },
};

export const Assistant = () => {
  const runtime = useChatRuntime({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
    adapters: {
      dictation: new WebSpeechDictationAdapter({
        // Optional configuration
        language: "en-US", // Language for recognition (default: browser language)
        continuous: true, // Keep recording after user stops (default: true)
        interimResults: false, // Return interim results (default: true)
      }),
    },
  });

  const aui = useAui({ tools: Tools({ toolkit }) });

  return (
    <AssistantRuntimeProvider runtime={runtime} aui={aui}>
      <DevToolsModal />
      <SidebarProvider>
        <div className="flex h-dvh w-full pr-0.5">
          <ThreadListSidebar />
          <SidebarInset>
            <header className="bg-background/60 flex h-12 shrink-0 items-center gap-2 border-b px-4 backdrop-blur-md">
              <SidebarTrigger />
              {/* <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink
                      href="https://www.assistant-ui.com/docs/getting-started"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Build Your Own ChatGPT UX
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Starter Template</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb> */}
            </header>
            <div className="flex-1 overflow-hidden">
              <Thread />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};
