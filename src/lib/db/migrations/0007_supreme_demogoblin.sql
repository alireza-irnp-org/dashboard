CREATE TABLE "file" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"message_id" text,
	"user_id" text NOT NULL,
	"storage_path" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_chunk" (
	"id" text PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL,
	"thread_id" text NOT NULL,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"chunk_type" text NOT NULL,
	"embedding" vector(1536),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_thread_id_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_message_id_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."message"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_chunk" ADD CONSTRAINT "file_chunk_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_chunk" ADD CONSTRAINT "file_chunk_thread_id_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "file_threadId_idx" ON "file" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "file_messageId_idx" ON "file" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "file_chunk_fileId_idx" ON "file_chunk" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "file_chunk_threadId_idx" ON "file_chunk" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "file_chunk_embedding_idx" ON "file_chunk" USING hnsw ("embedding" vector_cosine_ops);