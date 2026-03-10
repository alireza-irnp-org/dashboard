import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { thread } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

type Params = { id: string };

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const rows = await db
    .select()
    .from(thread)
    .where(and(eq(thread.id, id), eq(thread.userId, session.user.id)))
    .limit(1);

  if (!rows[0]) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const t = rows[0];
  return Response.json({
    remoteId: t.id,
    status: t.isArchived ? "archived" : "regular",
    title: t.title ?? undefined,
    externalId: undefined,
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body: { title?: string; isArchived?: boolean } = await req.json();

  const set: Partial<typeof thread.$inferInsert> = {};
  if (body.title !== undefined) set.title = body.title;
  if (body.isArchived !== undefined) set.isArchived = body.isArchived;

  if (Object.keys(set).length === 0) {
    return Response.json({ ok: true });
  }

  await db
    .update(thread)
    .set(set)
    .where(and(eq(thread.id, id), eq(thread.userId, session.user.id)));

  return Response.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<Params> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db
    .delete(thread)
    .where(and(eq(thread.id, id), eq(thread.userId, session.user.id)));

  return Response.json({ ok: true });
}
