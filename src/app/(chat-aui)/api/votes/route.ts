import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { message, thread, vote } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId, isUpvote } = (await req.json()) as {
    messageId: string;
    isUpvote: boolean;
  };

  // Verify the message belongs to the authenticated user via thread ownership
  const rows = await db
    .select({ id: message.id })
    .from(message)
    .innerJoin(thread, eq(message.threadId, thread.id))
    .where(and(eq(message.id, messageId), eq(thread.userId, session.user.id)))
    .limit(1);

  if (!rows[0]) return Response.json({ error: "Not found" }, { status: 404 });

  await db
    .insert(vote)
    .values({ messageId, userId: session.user.id, isUpvote })
    .onConflictDoUpdate({
      target: [vote.messageId, vote.userId],
      set: { isUpvote },
    });

  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId } = (await req.json()) as { messageId: string };

  await db
    .delete(vote)
    .where(and(eq(vote.messageId, messageId), eq(vote.userId, session.user.id)));

  return Response.json({ ok: true });
}
