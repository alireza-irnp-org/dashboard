import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AssistantIf,
  ThreadListItemMorePrimitive,
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  useThreadListItemRuntime,
} from "@assistant-ui/react";
import { ArchiveIcon, DownloadIcon, MoreHorizontalIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useEffect, useRef, useState } from "react";

export const ThreadList: FC = () => {
  return (
    <ThreadListPrimitive.Root className="aui-root aui-thread-list-root flex flex-col gap-1">
      <ThreadListNew />
      <AssistantIf condition={({ threads }) => threads.isLoading}>
        <ThreadListSkeleton />
      </AssistantIf>
      <AssistantIf condition={({ threads }) => !threads.isLoading}>
        <ThreadListPrimitive.Items components={{ ThreadListItem }} />
      </AssistantIf>
    </ThreadListPrimitive.Root>
  );
};

const ThreadListNew: FC = () => {
  const router = useRouter();
  return (
    <ThreadListPrimitive.New asChild>
      <Button
        variant="outline"
        className="aui-thread-list-new hover:bg-muted data-active:bg-muted h-9 justify-start gap-2 rounded-lg px-3 text-sm"
        onClick={() => router.push("/chat")}
      >
        <PlusIcon className="size-4" />
        New Thread
      </Button>
    </ThreadListPrimitive.New>
  );
};

const ThreadListSkeleton: FC = () => {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          role="status"
          aria-label="Loading threads"
          className="aui-thread-list-skeleton-wrapper flex h-9 items-center px-3"
        >
          <Skeleton className="aui-thread-list-skeleton h-4 w-full" />
        </div>
      ))}
    </div>
  );
};

const ThreadListItem: FC = () => {
  const [isRenaming, setIsRenaming] = useState(false);
  const runtime = useThreadListItemRuntime();
  const router = useRouter();

  const handleThreadClick = () => {
    const remoteId = runtime.getState().remoteId;
    if (remoteId) router.push(`/chat/${remoteId}`);
  };

  if (isRenaming) {
    return <ThreadListItemRenameInput onDone={() => setIsRenaming(false)} />;
  }

  return (
    <ThreadListItemPrimitive.Root className="aui-thread-list-item group hover:bg-muted focus-visible:bg-muted data-active:bg-muted flex h-9 items-center gap-2 rounded-lg transition-colors focus-visible:outline-none">
      <ThreadListItemPrimitive.Trigger
        className="aui-thread-list-item-trigger flex h-full min-w-0 flex-1 items-center truncate px-3 text-start text-sm"
        onClick={handleThreadClick}
      >
        <ThreadListItemPrimitive.Title fallback="New Chat" />
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemMore onRename={() => setIsRenaming(true)} />
    </ThreadListItemPrimitive.Root>
  );
};

const ThreadListItemRenameInput: FC<{ onDone: () => void }> = ({ onDone }) => {
  const runtime = useThreadListItemRuntime();
  const currentTitle = runtime.getState().title ?? "";
  const [value, setValue] = useState(currentTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const commit = async () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== currentTitle) {
      await runtime.rename(trimmed);
    }
    onDone();
  };

  return (
    <div className="flex h-9 items-center px-2">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") onDone();
        }}
        onBlur={commit}
        className="h-7 text-sm"
      />
    </div>
  );
};

const ThreadListItemMore: FC<{ onRename: () => void }> = ({ onRename }) => {
  const runtime = useThreadListItemRuntime();

  const handleExport = async (e: Event) => {
    e.preventDefault();
    const state = runtime.getState();
    const remoteId = state.remoteId;
    if (!remoteId) return;

    const res = await fetch(`/api/threads/${remoteId}/messages`);
    if (!res.ok) return;

    const data: {
      headId: string | null;
      messages: { id: string; parent_id: string | null; format: string; content: unknown }[];
    } = await res.json();

    // Follow the headId → parent_id chain to get only the active branch in order
    const msgMap = new Map(data.messages.map((m) => [m.id, m]));
    const branch: typeof data.messages = [];
    let cursor: string | null = data.headId;
    while (cursor) {
      const msg = msgMap.get(cursor);
      if (!msg) break;
      branch.unshift(msg);
      cursor = msg.parent_id;
    }

    const title = state.title ?? "Chat";
    const lines: string[] = [`# ${title}`, ""];

    for (const msg of branch) {
      // Stored format is Omit<UIMessage, "id">: { role, parts: UIMessagePart[] }
      const content = msg.content as { role?: string; parts?: Array<{ type: string; text?: string }> };
      const role = content.role;
      if (!role) continue;
      const text = (content.parts ?? [])
        .filter((p) => p.type === "text")
        .map((p) => p.text ?? "")
        .join("");
      if (text) lines.push(`[${role.toUpperCase()}]`, text, "");
    }

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ThreadListItemMorePrimitive.Root>
      <ThreadListItemMorePrimitive.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="aui-thread-list-item-more data-[state=open]:bg-accent mr-2 size-7 p-0 opacity-0 transition-opacity group-hover:opacity-100 group-data-active:opacity-100 data-[state=open]:opacity-100"
        >
          <MoreHorizontalIcon className="size-4" />
          <span className="sr-only">More options</span>
        </Button>
      </ThreadListItemMorePrimitive.Trigger>
      <ThreadListItemMorePrimitive.Content
        side="bottom"
        align="start"
        className="aui-thread-list-item-more-content bg-popover text-popover-foreground z-50 min-w-32 overflow-hidden rounded-md border p-1 shadow-md"
      >
        <ThreadListItemMorePrimitive.Item
          className="aui-thread-list-item-more-item hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none"
          onSelect={(e) => {
            e.preventDefault();
            onRename();
          }}
        >
          <PencilIcon className="size-4" />
          Rename
        </ThreadListItemMorePrimitive.Item>
        <ThreadListItemPrimitive.Archive asChild>
          <ThreadListItemMorePrimitive.Item className="aui-thread-list-item-more-item hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none">
            <ArchiveIcon className="size-4" />
            Archive
          </ThreadListItemMorePrimitive.Item>
        </ThreadListItemPrimitive.Archive>
        <ThreadListItemMorePrimitive.Item
          className="aui-thread-list-item-more-item hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none"
          onSelect={handleExport}
        >
          <DownloadIcon className="size-4" />
          Export
        </ThreadListItemMorePrimitive.Item>
        <ThreadListItemPrimitive.Delete asChild>
          <ThreadListItemMorePrimitive.Item className="aui-thread-list-item-more-item hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none">
            <Trash2Icon className="size-4" />
            Delete
          </ThreadListItemMorePrimitive.Item>
        </ThreadListItemPrimitive.Delete>
      </ThreadListItemMorePrimitive.Content>
    </ThreadListItemMorePrimitive.Root>
  );
};
