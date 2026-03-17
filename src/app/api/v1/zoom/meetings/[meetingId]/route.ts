import { auth } from "@/lib/auth/auth";
import { getZoomClient } from "@/lib/zoom/zoom-client";

type Params = { params: Promise<{ meetingId: string }> };

export async function GET(req: Request, { params }: Params) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const zoom = await getZoomClient(req.headers);

  if (!zoom) {
    return Response.json(
      { error: "Zoom account not connected" },
      { status: 400 }
    );
  }

  const { meetingId } = await params;
  const meeting = await zoom.getMeeting(meetingId);

  return Response.json(meeting);
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const zoom = await getZoomClient(req.headers);

  if (!zoom) {
    return Response.json(
      { error: "Zoom account not connected" },
      { status: 400 }
    );
  }

  const { meetingId } = await params;
  const body = await req.json();
  await zoom.updateMeeting(meetingId, body);

  return new Response(null, { status: 204 });
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const zoom = await getZoomClient(req.headers);

  if (!zoom) {
    return Response.json(
      { error: "Zoom account not connected" },
      { status: 400 }
    );
  }

  const { meetingId } = await params;
  await zoom.deleteMeeting(meetingId);

  return new Response(null, { status: 204 });
}
