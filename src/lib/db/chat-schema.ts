import { relations } from "drizzle-orm";
import { boolean, index, jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "@/lib/auth/auth-schema";

export const thread = pgTable(
  "thread",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title"),
    isArchived: boolean("is_archived").default(false).notNull(),
    // ID of the last message in the active branch; used as headId when loading history
    headMessageId: text("head_message_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("thread_userId_idx").on(table.userId),
    index("thread_userId_isArchived_idx").on(table.userId, table.isArchived),
  ],
);

export const message = pgTable(
  "message",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => thread.id, { onDelete: "cascade" }),
    // parent_id mirrors MessageStorageEntry.parent_id for branch reconstruction
    parentId: text("parent_id"),
    // format mirrors MessageStorageEntry.format (e.g. "aiSdk/v1")
    format: text("format").notNull(),
    // content mirrors MessageStorageEntry.content — the format-encoded message payload
    content: jsonb("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("message_threadId_idx").on(table.threadId),
    index("message_threadId_createdAt_idx").on(table.threadId, table.createdAt),
  ],
);

export const threadRelations = relations(thread, ({ one, many }) => ({
  user: one(user, { fields: [thread.userId], references: [user.id] }),
  messages: many(message),
}));

export const messageRelations = relations(message, ({ one }) => ({
  thread: one(thread, { fields: [message.threadId], references: [thread.id] }),
}));

export const userThreadsRelation = relations(user, ({ many }) => ({
  threads: many(thread),
}));

export const vote = pgTable(
  "vote",
  {
    messageId: text("message_id")
      .notNull()
      .references(() => message.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    isUpvote: boolean("is_upvote").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.messageId, table.userId] })],
);
