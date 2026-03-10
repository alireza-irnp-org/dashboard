import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { message, thread, vote } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

type Params = { id: string };

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const threadRow = await db
    .select({ id: thread.id })
    .from(thread)
    .where(and(eq(thread.id, id), eq(thread.userId, session.user.id)))
    .limit(1);

  if (!threadRow[0]) return Response.json({ error: "Not found" }, { status: 404 });

  const votes = await db
    .select({ messageId: vote.messageId, isUpvote: vote.isUpvote })
    .from(vote)
    .innerJoin(message, eq(vote.messageId, message.id))
    .where(and(eq(message.threadId, id), eq(vote.userId, session.user.id)));

  const voteMap: Record<string, boolean> = {};
  for (const v of votes) {
    voteMap[v.messageId] = v.isUpvote;
  }

  return Response.json({ votes: voteMap });
}
