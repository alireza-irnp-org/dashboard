import { and, eq } from "drizzle-orm";
import { account } from "@/lib/auth/auth-schema";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/index";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ZoomUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  type: number;
  role_name: string;
  pmi: number;
  use_pmi: boolean;
  personal_meeting_url: string;
  timezone: string;
  created_at: string;
  last_login_time: string;
  pic_url: string;
  status: string;
}

export interface ZoomMeeting {
  id: number;
  uuid: string;
  host_id: string;
  topic: string;
  /** 1=instant, 2=scheduled, 3=recurring (no fixed time), 8=recurring (fixed time) */
  type: number;
  status: string;
  start_time: string;
  /** Duration in minutes */
  duration: number;
  timezone: string;
  created_at: string;
  join_url: string;
  agenda?: string;
  password?: string;
}

export interface ZoomMeetingsListResponse {
  page_count: number;
  page_number: number;
  page_size: number;
  total_records: number;
  meetings: ZoomMeeting[];
}

export interface CreateMeetingParams {
  topic: string;
  /** 1=instant, 2=scheduled, 3=recurring no fixed time, 8=recurring fixed time. Defaults to 2. */
  type?: number;
  /** ISO 8601 datetime, e.g. "2026-03-20T10:00:00Z" */
  start_time?: string;
  /** Duration in minutes */
  duration?: number;
  timezone?: string;
  agenda?: string;
  password?: string;
  settings?: {
    host_video?: boolean;
    participant_video?: boolean;
    join_before_host?: boolean;
    mute_upon_entry?: boolean;
    waiting_room?: boolean;
  };
}

export interface UpdateMeetingParams extends Partial<CreateMeetingParams> {}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

const ZOOM_API_BASE = "https://api.zoom.us/v2";

export class ZoomClient {
  constructor(private readonly accessToken: string) {}

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${ZOOM_API_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(
        (body as { message?: string }).message ?? `Zoom API error ${res.status}`
      );
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  /** Get the authenticated Zoom user's profile. */
  getMe(): Promise<ZoomUser> {
    return this.request<ZoomUser>("/users/me");
  }

  /**
   * List meetings for a user.
   * @param userId Zoom user ID or "me" (default)
   */
  listMeetings(
    userId = "me",
    params: {
      type?: "scheduled" | "live" | "upcoming" | "upcoming_meetings" | "previous_meetings";
      page_size?: number;
      page_number?: number;
    } = {}
  ): Promise<ZoomMeetingsListResponse> {
    const query = new URLSearchParams();
    if (params.type) query.set("type", params.type);
    if (params.page_size) query.set("page_size", String(params.page_size));
    if (params.page_number) query.set("page_number", String(params.page_number));

    const qs = query.toString();
    return this.request<ZoomMeetingsListResponse>(
      `/users/${userId}/meetings${qs ? `?${qs}` : ""}`
    );
  }

  /** Get a single meeting by ID. */
  getMeeting(meetingId: string | number): Promise<ZoomMeeting> {
    return this.request<ZoomMeeting>(`/meetings/${meetingId}`);
  }

  /**
   * Create a new meeting.
   * @param params Meeting creation params
   * @param userId Zoom user ID or "me" (default)
   */
  createMeeting(params: CreateMeetingParams, userId = "me"): Promise<ZoomMeeting> {
    return this.request<ZoomMeeting>(`/users/${userId}/meetings`, {
      method: "POST",
      body: JSON.stringify({ type: 2, ...params }),
    });
  }

  /** Update an existing meeting. */
  updateMeeting(
    meetingId: string | number,
    params: UpdateMeetingParams
  ): Promise<void> {
    return this.request<void>(`/meetings/${meetingId}`, {
      method: "PATCH",
      body: JSON.stringify(params),
    });
  }

  /** Delete a meeting. */
  deleteMeeting(meetingId: string | number): Promise<void> {
    return this.request<void>(`/meetings/${meetingId}`, {
      method: "DELETE",
    });
  }
}

// ---------------------------------------------------------------------------
// Factory: resolve decrypted access token via auth.api and return a ready client
// ---------------------------------------------------------------------------

/**
 * Creates a ZoomClient for the current request by fetching the decrypted
 * Zoom access token through Better Auth (handles encryptOAuthTokens).
 * Returns null if Zoom is not connected.
 */
export async function getZoomClient(
  headers: Headers
): Promise<ZoomClient | null> {
  const tokenData = await auth.api.getAccessToken({
    headers,
    body: { providerId: "zoom" },
  });

  if (!tokenData?.accessToken) return null;
  return new ZoomClient(tokenData.accessToken);
}

/**
 * Check whether a user has Zoom connected.
 */
export async function isZoomConnected(userId: string): Promise<boolean> {
  const [zoomAccount] = await db
    .select({ id: account.id })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "zoom")))
    .limit(1);

  return !!zoomAccount;
}
