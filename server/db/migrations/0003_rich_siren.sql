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
