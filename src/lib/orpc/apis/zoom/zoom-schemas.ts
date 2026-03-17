import { z } from "zod/v3";

export const ZoomMeetingSettingsSchema = z.object({
    host_video: z.boolean().optional(),
    participant_video: z.boolean().optional(),
    join_before_host: z.boolean().optional(),
    mute_upon_entry: z.boolean().optional(),
    waiting_room: z.boolean().optional(),
});

export const ZoomMeetingSchema = z.object({
    id: z.number(),
    uuid: z.string(),
    host_id: z.string(),
    topic: z.string(),
    type: z.number().describe("1=instant, 2=scheduled, 3=recurring (no fixed time), 8=recurring (fixed time)"),
    status: z.string().optional(),
    start_time: z.string().optional(),
    duration: z.number().describe("Duration in minutes").optional(),
    timezone: z.string().optional(),
    created_at: z.string().optional(),
    join_url: z.string().optional(),
    agenda: z.string().optional(),
    password: z.string().optional(),
});

export const ZoomMeetingsListSchema = z.object({
    page_count: z.number(),
    page_number: z.number(),
    page_size: z.number(),
    total_records: z.number(),
    meetings: z.array(ZoomMeetingSchema),
});

export const ZoomUserSchema = z.object({
    id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email(),
    type: z.number(),
    role_name: z.string(),
    pmi: z.number(),
    use_pmi: z.boolean(),
    personal_meeting_url: z.string(),
    timezone: z.string(),
    created_at: z.string(),
    last_login_time: z.string(),
    pic_url: z.string(),
    status: z.string(),
});

export const ZoomStatusOutputSchema = z.object({
    connected: z.boolean(),
});

export const MeetingIdSchema = z.object({
    meetingId: z.string().describe("Zoom meeting ID"),
});

export const ListMeetingsInputSchema = z.object({
    type: z
        .enum(["scheduled", "live", "upcoming"])
        .optional()
        .default("upcoming")
        .describe("Filter by meeting type"),
    page_size: z
        .number()
        .int()
        .min(1)
        .max(300)
        .optional()
        .default(30)
        .describe("Number of records per page"),
    page_number: z
        .number()
        .int()
        .min(1)
        .optional()
        .default(1)
        .describe("Page number"),
});

export const CreateMeetingInputSchema = z.object({
    topic: z.string().describe("Meeting topic / title"),
    type: z.number().int().optional().describe("1=instant, 2=scheduled, 3=recurring (no fixed time), 8=recurring (fixed time)"),
    start_time: z.string().optional().describe("ISO 8601 datetime, e.g. 2026-03-20T10:00:00Z"),
    duration: z.number().int().optional().describe("Duration in minutes"),
    timezone: z.string().optional(),
    agenda: z.string().optional(),
    password: z.string().optional(),
    settings: ZoomMeetingSettingsSchema.optional(),
});

export const UpdateMeetingInputSchema = z.object({
    meetingId: z.string().describe("Zoom meeting ID"),
    topic: z.string().optional(),
    type: z.number().int().optional(),
    start_time: z.string().optional().describe("ISO 8601 datetime"),
    duration: z.number().int().optional().describe("Duration in minutes"),
    timezone: z.string().optional(),
    agenda: z.string().optional(),
    password: z.string().optional(),
    settings: ZoomMeetingSettingsSchema.optional(),
});
