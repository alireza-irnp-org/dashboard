"use client";

import {
  Badge,
  badgeVariants,
  type BadgeProps,
} from "@/components/assistant-ui/badge";
import { cn } from "@/lib/utils";
import type { SourceMessagePartComponent } from "@assistant-ui/react";
import { memo, useState, type ComponentProps } from "react";

const extractDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const getDomainInitial = (url: string): string => {
  const domain = extractDomain(url);
  return domain.charAt(0).toUpperCase();
};

function SourceIcon({
  url,
  className,
  ...props
}: ComponentProps<"span"> & { url: string }) {
  const [hasError, setHasError] = useState(false);
  const domain = extractDomain(url);

  if (hasError) {
    return (
      <span
        data-slot="source-icon-fallback"
        className={cn(
          "bg-muted flex size-3 shrink-0 items-center justify-center rounded-sm text-[10px] font-medium",
          className,
        )}
        {...props}
      >
        {getDomainInitial(url)}
      </span>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      data-slot="source-icon"
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt=""
      className={cn("size-3 shrink-0 rounded-sm", className)}
      onError={() => setHasError(true)}
      {...(props as ComponentProps<"img">)}
    />
  );
}

function SourceTitle({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="source-title"
      className={cn("max-w-37.5 truncate", className)}
      {...props}
    />
  );
}

export type SourceProps = Omit<BadgeProps, "asChild"> &
  ComponentProps<"a"> & {
    asChild?: boolean;
  };

function Source({
  className,
  variant,
  size,
  asChild = false,
  target = "_blank",
  rel = "noopener noreferrer",
  ...props
}: SourceProps) {
  return (
    <Badge
      asChild
      variant={variant}
      size={size}
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 cursor-pointer outline-none focus-visible:ring-[3px]",
        className,
      )}
    >
      <a
        data-slot="source"
        target={target}
        rel={rel}
        {...(props as ComponentProps<"a">)}
      />
    </Badge>
  );
}

const SourcesImpl: SourceMessagePartComponent = ({
  url,
  title,
  sourceType,
}) => {
  if (sourceType !== "url" || !url) return null;

  const domain = extractDomain(url);
  const displayTitle = title || domain;

  return (
    <Source href={url}>
      <SourceIcon url={url} />
      <SourceTitle>{displayTitle}</SourceTitle>
    </Source>
  );
};

const Sources = memo(SourcesImpl) as unknown as SourceMessagePartComponent & {
  Root: typeof Source;
  Icon: typeof SourceIcon;
  Title: typeof SourceTitle;
};

Sources.displayName = "Sources";
Sources.Root = Source;
Sources.Icon = SourceIcon;
Sources.Title = SourceTitle;

export {
  Source,
  SourceIcon,
  Sources,
  SourceTitle,
  badgeVariants as sourceVariants,
};
