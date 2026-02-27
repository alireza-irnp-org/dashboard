"use client";

import { BotIcon, ChevronDownIcon } from "lucide-react";

import {
  AssistantModalPrimitive,
  AssistantRuntimeProvider,
  useAui,
  WebSpeechDictationAdapter,
} from "@assistant-ui/react";
import { type FC, forwardRef } from "react";

import { Assistant } from "@/components/assistant-ui/assistant";
import { Thread } from "@/components/assistant-ui/thread";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";

export const AssistantModal: FC = () => {
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

  // const aui = useAui({ tools: Tools({ toolkit }) });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantModalPrimitive.Root>
        <AssistantModalPrimitive.Anchor className="aui-root aui-modal-anchor fixed right-4 bottom-4 size-11">
          <AssistantModalPrimitive.Trigger asChild>
            <AssistantModalButton />
          </AssistantModalPrimitive.Trigger>
        </AssistantModalPrimitive.Anchor>
        <AssistantModalPrimitive.Content
          sideOffset={16}
          className="aui-root aui-modal-content data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-1/2 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:zoom-out data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-1/2 data-[state=open]:slide-in-from-right-1/2 data-[state=open]:zoom-in bg-popover text-popover-foreground data-[state=closed]:animate-out data-[state=open]:animate-in z-50 h-125 w-100 overflow-clip overscroll-contain rounded-xl border p-0 shadow-md outline-none [&>.aui-thread-root]:bg-inherit [&>.aui-thread-root_.aui-thread-viewport-footer]:bg-inherit"
        >
          <Thread />
        </AssistantModalPrimitive.Content>
      </AssistantModalPrimitive.Root>
    </AssistantRuntimeProvider>
  );
};

type AssistantModalButtonProps = { "data-state"?: "open" | "closed" };

const AssistantModalButton = forwardRef<
  HTMLButtonElement,
  AssistantModalButtonProps
>(({ "data-state": state, ...rest }, ref) => {
  const tooltip = state === "open" ? "Close Assistant" : "Open Assistant";

  return (
    <TooltipIconButton
      variant="default"
      tooltip={tooltip}
      side="left"
      {...rest}
      className="aui-modal-button size-full rounded-full shadow transition-transform hover:scale-110 active:scale-90"
      ref={ref}
    >
      <BotIcon
        data-state={state}
        className="aui-modal-button-closed-icon absolute size-6 transition-all data-[state=closed]:scale-100 data-[state=closed]:rotate-0 data-[state=open]:scale-0 data-[state=open]:rotate-90"
      />

      <ChevronDownIcon
        data-state={state}
        className="aui-modal-button-open-icon absolute size-6 transition-all data-[state=closed]:scale-0 data-[state=closed]:-rotate-90 data-[state=open]:scale-100 data-[state=open]:rotate-0"
      />
      <span className="aui-sr-only sr-only">{tooltip}</span>
    </TooltipIconButton>
  );
});

AssistantModalButton.displayName = "AssistantModalButton";
