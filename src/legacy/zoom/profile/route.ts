import { auth } from "@/lib/auth/auth";
import { getZoomClient } from "@/lib/sdks/zoom/zoom-client";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const zoom = await getZoomClient(req.headers);

  if (!zoom) {
    return Response.json({ error: "Zoom not connected" }, { status: 404 });
  }

  const profile = await zoom.getMe();
  return Response.json(profile);
}
