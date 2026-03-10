-- Drop old tables created by 0004 (wrong schema) and recreate with correct schema
DROP TABLE IF EXISTS "message";--> statement-breakpoint
DROP TABLE IF EXISTS "thread";--> statement-breakpoint
CREATE TABLE "message" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"parent_id" text,
	"format" text NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "thread" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text,
	"is_archived" boolean DEFAULT false NOT NULL,
	"head_message_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_thread_id_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread" ADD CONSTRAINT "thread_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "message_threadId_idx" ON "message" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "message_threadId_createdAt_idx" ON "message" USING btree ("thread_id","created_at");--> statement-breakpoint
CREATE INDEX "thread_userId_idx" ON "thread" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "thread_userId_isArchived_idx" ON "thread" USING btree ("user_id","is_archived");
