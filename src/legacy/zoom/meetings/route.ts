import { auth } from "@/lib/auth/auth";
import { getZoomClient } from "@/lib/sdks/zoom/zoom-client";

export async function GET(req: Request) {
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

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") ?? "upcoming") as
    | "scheduled"
    | "live"
    | "upcoming";
  const page_size = Number(searchParams.get("page_size") ?? "30");
  const page_number = Number(searchParams.get("page_number") ?? "1");

  const data = await zoom.listMeetings("me", { type, page_size, page_number });

  return Response.json(data);
}

export async function POST(req: Request) {
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

  const body = await req.json();
  const meeting = await zoom.createMeeting(body);

  return Response.json(meeting, { status: 201 });
}
