import { auth } from "@/lib/auth/auth";
import { isZoomConnected } from "@/lib/zoom/zoom-client";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connected = await isZoomConnected(session.user.id);

  return Response.json({ connected });
}
