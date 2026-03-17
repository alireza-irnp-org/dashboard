import { auth } from "@/lib/auth/auth";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({
    token: session.session.token,
    expiresAt: session.session.expiresAt,
    createdAt: session.session.createdAt,
    updatedAt: session.session.updatedAt,
    ipAddress: session.session.ipAddress,
    userAgent: session.session.userAgent,
    userId: session.session.userId,
  });
}
