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
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  AssistantRuntimeProvider,
  Tools,
  useAui,
  WebSpeechDictationAdapter,
  type ThreadHistoryAdapter,
  type Toolkit,
} from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { unstable_useRemoteThreadListRuntime as useRemoteThreadListRuntime } from "@assistant-ui/react";
import { DevToolsModal } from "@assistant-ui/react-devtools";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useVoteStore } from "@/lib/vote-store";
import { createAssistantStream } from "assistant-stream";
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
      if (!parsed) return null;
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

function makeHistoryAdapter(remoteId: string | undefined): ThreadHistoryAdapter {
  return {
    load: async () => ({ messages: [] }),
    append: async () => {},
    withFormat: (formatAdapter) => ({
      load: async () => {
        if (!remoteId) return { messages: [] };
        const res = await fetch(`/api/threads/${remoteId}/messages`);
        if (!res.ok) return { messages: [] };
        const data: {
          headId: string | null;
          messages: { id: string; parent_id: string | null; format: string; content: unknown }[];
        } = await res.json();
        return {
          headId: data.headId,
          messages: data.messages.map((entry) =>
            formatAdapter.decode({
              id: entry.id,
              parent_id: entry.parent_id,
              format: entry.format,
              content: entry.content as never,
            }),
          ),
        };
      },
      append: async (item) => {
        if (!remoteId) return;
        const encoded = formatAdapter.encode(item);
        const id = formatAdapter.getId(item.message);
        await fetch(`/api/threads/${remoteId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            parent_id: item.parentId,
            format: formatAdapter.format,
            content: encoded,
          }),
        });
      },
      update: async (item) => {
        if (!remoteId) return;
        const encoded = formatAdapter.encode(item);
        const id = formatAdapter.getId(item.message);
        await fetch(`/api/threads/${remoteId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            parent_id: item.parentId,
            format: formatAdapter.format,
            content: encoded,
          }),
        });
      },
    }),
  };
}

export const Assistant = () => {
  const pathname = usePathname();
  const threadId = pathname.match(/^\/chat\/(.+)/)?.[1];
  const aui = useAui({ tools: Tools({ toolkit }) });

  const runtime = useRemoteThreadListRuntime({
    adapter: {
      list: async () => {
        const res = await fetch("/api/threads");
        if (!res.ok) return { threads: [] };
        return res.json();
      },
      initialize: async () => {
        const res = await fetch("/api/threads", { method: "POST" });
        return res.json();
      },
      fetch: async (remoteId) => {
        const res = await fetch(`/api/threads/${remoteId}`);
        return res.json();
      },
      rename: async (remoteId, newTitle) => {
        await fetch(`/api/threads/${remoteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });
      },
      archive: async (remoteId) => {
        await fetch(`/api/threads/${remoteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isArchived: true }),
        });
      },
      unarchive: async (remoteId) => {
        await fetch(`/api/threads/${remoteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isArchived: false }),
        });
      },
      delete: async (remoteId) => {
        await fetch(`/api/threads/${remoteId}`, { method: "DELETE" });
      },
      generateTitle: async (remoteId, messages) => {
        const firstUserMsg = messages.find((m) => m.role === "user");
        const title =
          firstUserMsg?.content
            .filter((p) => p.type === "text")
            .map((p) => (p as { type: "text"; text: string }).text)
            .join("")
            .slice(0, 60) ?? "New Chat";

        // Persist title in background
        fetch(`/api/threads/${remoteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        }).catch(console.error);

        return createAssistantStream((controller) => {
          controller.appendText(title);
          controller.close();
        });
      },
    },
    runtimeHook: () => {
      // This hook runs inside ThreadListItemRuntimeProvider so useAui() gives per-thread context
      const innerAui = useAui();
      const remoteId = innerAui.threadListItem().getState().remoteId;

      const mergeVotes = useVoteStore((s) => s.mergeVotes);
      useEffect(() => {
        if (!remoteId) return;
        const controller = new AbortController();
        fetch(`/api/threads/${remoteId}/votes`, { signal: controller.signal })
          .then((res) => (res.ok ? res.json() : { votes: {} }))
          .then(({ votes }) => mergeVotes(votes))
          .catch(() => {});
        return () => controller.abort();
      }, [remoteId, mergeVotes]);

      const historyAdapter = useMemo(
        () => makeHistoryAdapter(remoteId),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [remoteId],
      );

      return useChatRuntime({
        sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
        transport: new AssistantChatTransport({ api: "/api/chat" }),
        adapters: {
          history: historyAdapter,
          dictation: new WebSpeechDictationAdapter({
            language: "en-US",
            continuous: true,
            interimResults: false,
          }),
        },
      });
    },
  });

  useEffect(() => {
    if (threadId) {
      runtime.switchToThread(threadId);
    } else {
      runtime.switchToNewThread();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  return (
    <AssistantRuntimeProvider runtime={runtime} aui={aui}>
      <DevToolsModal />
      <SidebarProvider>
        <div className="flex h-dvh w-full pr-0.5">
          <ThreadListSidebar />
          <SidebarInset>
            <header className="bg-background/60 flex h-12 shrink-0 items-center gap-2 border-b px-4 backdrop-blur-md">
              <SidebarTrigger />
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
