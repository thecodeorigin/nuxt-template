ALTER TABLE "sys_users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "sys_users" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "sys_users" ADD COLUMN "provider" varchar;--> statement-breakpoint
ALTER TABLE "sys_users" ADD COLUMN "provider_id" varchar;