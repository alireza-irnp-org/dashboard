import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { message, thread } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";

type Params = { id: string };

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify thread belongs to the user
  const threadRows = await db
    .select({ headMessageId: thread.headMessageId })
    .from(thread)
    .where(and(eq(thread.id, id), eq(thread.userId, session.user.id)))
    .limit(1);

  if (!threadRows[0]) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await db
    .select()
    .from(message)
    .where(eq(message.threadId, id))
    .orderBy(asc(message.createdAt));

  return Response.json({
    headId: threadRows[0].headMessageId ?? null,
    messages: messages.map((m) => ({
      id: m.id,
      parent_id: m.parentId ?? null,
      format: m.format,
      content: m.content,
    })),
  });
}

export async function POST(req: Request, { params }: { params: Promise<Params> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify thread belongs to the user
  const threadRows = await db
    .select({ id: thread.id })
    .from(thread)
    .where(and(eq(thread.id, id), eq(thread.userId, session.user.id)))
    .limit(1);

  if (!threadRows[0]) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body: {
    id: string;
    parent_id: string | null;
    format: string;
    content: Record<string, unknown>;
  } = await req.json();

  await db
    .insert(message)
    .values({
      id: body.id,
      threadId: id,
      parentId: body.parent_id,
      format: body.format,
      content: body.content,
    })
    .onConflictDoUpdate({
      target: message.id,
      set: {
        content: body.content,
        parentId: body.parent_id,
      },
    });

  // Update thread's head and touch updatedAt
  await db
    .update(thread)
    .set({ headMessageId: body.id })
    .where(eq(thread.id, id));

  return Response.json({ ok: true });
}
