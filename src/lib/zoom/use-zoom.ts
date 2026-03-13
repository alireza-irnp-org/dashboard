"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateMeetingParams, ZoomMeeting, ZoomMeetingsListResponse, ZoomUser } from "./zoom-client";

export const zoomKeys = {
  all: ["zoom"] as const,
  status: () => [...zoomKeys.all, "status"] as const,
  profile: () => [...zoomKeys.all, "profile"] as const,
  meetings: (type?: string) => [...zoomKeys.all, "meetings", type] as const,
  meeting: (id: string | number) => [...zoomKeys.all, "meeting", String(id)] as const,
};

export function useZoomProfile(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: zoomKeys.profile(),
    queryFn: async (): Promise<ZoomUser> => {
      const res = await fetch("/api/zoom/profile");
      if (!res.ok) throw new Error("Failed to fetch Zoom profile");
      return res.json();
    },
    enabled: options.enabled ?? true,
  });
}

export function useZoomStatus() {
  return useQuery({
    queryKey: zoomKeys.status(),
    queryFn: async (): Promise<{ connected: boolean }> => {
      const res = await fetch("/api/zoom/status");
      if (!res.ok) throw new Error("Failed to fetch Zoom status");
      return res.json();
    },
  });
}

export function useZoomMeetings(
  type: "scheduled" | "live" | "upcoming" = "upcoming",
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: zoomKeys.meetings(type),
    queryFn: async (): Promise<ZoomMeetingsListResponse> => {
      const res = await fetch(`/api/zoom/meetings?type=${type}&page_size=20`);
      if (!res.ok) throw new Error("Failed to fetch Zoom meetings");
      return res.json();
    },
    enabled: options.enabled ?? true,
  });
}

export function useCreateZoomMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateMeetingParams): Promise<ZoomMeeting> => {
      const res = await fetch("/api/zoom/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to create Zoom meeting");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoomKeys.meetings() });
    },
  });
}

export function useDeleteZoomMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (meetingId: string | number): Promise<void> => {
      const res = await fetch(`/api/zoom/meetings/${meetingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete Zoom meeting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoomKeys.meetings() });
    },
  });
}
