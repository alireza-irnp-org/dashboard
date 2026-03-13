import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { thread } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { generateId } from "ai";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const threads = await db
    .select({
      id: thread.id,
      title: thread.title,
      isArchived: thread.isArchived,
    })
    .from(thread)
    .where(eq(thread.userId, session.user.id))
    .orderBy(desc(thread.updatedAt));

  return Response.json({
    threads: threads.map((t) => ({
      remoteId: t.id,
      status: t.isArchived ? "archived" : "regular",
      title: t.title ?? undefined,
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = generateId();
  await db.insert(thread).values({
    id,
    userId: session.user.id,
  });

  return Response.json({ remoteId: id, externalId: undefined });
}
