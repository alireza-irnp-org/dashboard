import { relations } from "drizzle-orm";
import { boolean, customType, index, integer, jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "@/lib/auth/auth-schema";

const vector = customType<{ data: number[]; driverData: string; config: { dimensions: number } }>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 1536})`;
  },
  fromDriver(value: string): number[] {
    return value.replace(/[\[\]]/g, "").split(",").map(Number);
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
});

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
  files: many(file),
}));

export const messageRelations = relations(message, ({ one, many }) => ({
  thread: one(thread, { fields: [message.threadId], references: [thread.id] }),
  files: many(file),
}));

export const userThreadsRelation = relations(user, ({ many }) => ({
  threads: many(thread),
}));

export const file = pgTable(
  "file",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => thread.id, { onDelete: "cascade" }),
    messageId: text("message_id").references(() => message.id, { onDelete: "set null" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    storagePath: text("storage_path").notNull(),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    // pending | extracting | chunking | embedding | ready | failed
    status: text("status").notNull().default("pending"),
    error: text("error"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("file_threadId_idx").on(table.threadId),
    index("file_messageId_idx").on(table.messageId),
  ],
);

export const fileChunk = pgTable(
  "file_chunk",
  {
    id: text("id").primaryKey(),
    fileId: text("file_id")
      .notNull()
      .references(() => file.id, { onDelete: "cascade" }),
    threadId: text("thread_id")
      .notNull()
      .references(() => thread.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    // text | table | image_description | heading
    chunkType: text("chunk_type").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("file_chunk_fileId_idx").on(table.fileId),
    index("file_chunk_threadId_idx").on(table.threadId),
  ],
);

export const fileRelations = relations(file, ({ one, many }) => ({
  thread: one(thread, { fields: [file.threadId], references: [thread.id] }),
  message: one(message, { fields: [file.messageId], references: [message.id] }),
  user: one(user, { fields: [file.userId], references: [user.id] }),
  chunks: many(fileChunk),
}));

export const fileChunkRelations = relations(fileChunk, ({ one }) => ({
  file: one(file, { fields: [fileChunk.fileId], references: [file.id] }),
  thread: one(thread, { fields: [fileChunk.threadId], references: [thread.id] }),
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
