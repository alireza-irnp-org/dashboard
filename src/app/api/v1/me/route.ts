import { auth } from "@/lib/auth/auth";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({
    user: session.user,
  });
}
