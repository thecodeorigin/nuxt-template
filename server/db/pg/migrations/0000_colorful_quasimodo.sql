CREATE TYPE "public"."activity_action" AS ENUM('auth:sign_in', 'auth:sign_up', 'auth:impersonate_start', 'auth:impersonate_stop');--> statement-breakpoint
CREATE TYPE "public"."auth_provider" AS ENUM('google', 'github');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action" "activity_action" NOT NULL,
	"action_ref_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "auth_provider" NOT NULL,
	"provider_user_id" varchar(255) NOT NULL,
	"provider_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(64),
	"name" varchar(255),
	"primary_email" varchar(255) NOT NULL,
	"primary_phone" varchar(32),
	"avatar" varchar(2048),
	"verified" boolean DEFAULT false,
	"email_notifications" boolean DEFAULT true,
	"abilities" text[] DEFAULT '{}' NOT NULL,
	"custom_data" jsonb DEFAULT '{}'::jsonb,
	"last_sign_in_at" timestamp with time zone,
	"is_suspended" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_primary_email_unique" UNIQUE("primary_email"),
	CONSTRAINT "users_primary_phone_unique" UNIQUE("primary_phone")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "identities" ADD CONSTRAINT "identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "activities_user_id_idx" ON "activities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "identities_user_id_idx" ON "identities" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "identities_provider_unique_idx" ON "identities" USING btree ("provider","provider_user_id");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_name_idx" ON "users" USING btree ("name");