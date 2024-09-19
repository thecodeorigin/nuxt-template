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
CREATE TABLE IF NOT EXISTS "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);
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
ALTER TABLE "projects" ADD COLUMN "status" "status" DEFAULT 'processing';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customers" ADD CONSTRAINT "customer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."sys_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
