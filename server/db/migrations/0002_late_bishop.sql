DO $$ BEGIN
 CREATE TYPE "public"."model" AS ENUM('tiny', 'medium', 'large-v3');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."status" AS ENUM('processing', 'succeeded');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "is_voice_recognition" boolean;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "model" "model";--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "source_downloadable" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "source_duration" numeric;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "source_thumbnail" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "source_title" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "source_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "structure" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "subtitle" jsonb[];--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "summarize" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "translate_from" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "translate_to" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "status" "status" DEFAULT 'processing';