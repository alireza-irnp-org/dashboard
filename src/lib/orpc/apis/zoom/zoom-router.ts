import { z } from "zod/v3";
import { authed, zoomAuthed } from "@/lib/orpc/base";
import { isZoomConnected } from "@/lib/sdks/zoom/zoom-client";
import {
    CreateMeetingInputSchema,
    ListMeetingsInputSchema,
    MeetingIdSchema,
    UpdateMeetingInputSchema,
    ZoomMeetingSchema,
    ZoomMeetingsListSchema,
    ZoomStatusOutputSchema,
    ZoomUserSchema,
} from "./zoom-schemas";

export const zoomRouter = {
    status: authed
        .route({ method: "GET", path: "/zoom/status", summary: "Check Zoom connection status", tags: ["Zoom"] })
        .output(ZoomStatusOutputSchema)
        .handler(async ({ context }) => {
            const connected = await isZoomConnected(context.session.user.id);
            return { connected };
        }),

    profile: zoomAuthed
        .route({ method: "GET", path: "/zoom/profile", summary: "Get authenticated Zoom user profile", tags: ["Zoom"] })
        .output(ZoomUserSchema)
        .handler(async ({ context }) => context.zoom.getMe()),

    meetings: {
        list: zoomAuthed
            .route({ method: "GET", path: "/zoom/meetings", summary: "List meetings", tags: ["Zoom Meetings"] })
            .input(ListMeetingsInputSchema)
            .output(ZoomMeetingsListSchema)
            .handler(async ({ context, input }) => context.zoom.listMeetings("me", input)),

        get: zoomAuthed
            .route({ method: "GET", path: "/zoom/meetings/{meetingId}", summary: "Get a meeting by ID", tags: ["Zoom Meetings"] })
            .input(MeetingIdSchema)
            .output(ZoomMeetingSchema)
            .handler(async ({ context, input }) => context.zoom.getMeeting(input.meetingId)),

        create: zoomAuthed
            .route({ method: "POST", path: "/zoom/meetings", summary: "Create a new meeting", tags: ["Zoom Meetings"] })
            .input(CreateMeetingInputSchema)
            .output(ZoomMeetingSchema)
            .handler(async ({ context, input }) => context.zoom.createMeeting(input)),

        update: zoomAuthed
            .route({ method: "PATCH", path: "/zoom/meetings/{meetingId}", summary: "Update an existing meeting", tags: ["Zoom Meetings"] })
            .input(UpdateMeetingInputSchema)
            .output(z.void())
            .handler(async ({ context, input }) => {
                const { meetingId, ...params } = input;
                await context.zoom.updateMeeting(meetingId, params);
            }),

        delete: zoomAuthed
            .route({ method: "DELETE", path: "/zoom/meetings/{meetingId}", summary: "Delete a meeting", tags: ["Zoom Meetings"] })
            .input(MeetingIdSchema)
            .output(z.void())
            .handler(async ({ context, input }) => context.zoom.deleteMeeting(input.meetingId)),
    },
};
