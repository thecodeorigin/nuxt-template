ALTER TABLE "sys_permissions" DROP CONSTRAINT "sys_permissions_role_id_sys_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "sys_users" DROP CONSTRAINT "sys_users_role_id_sys_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "user_payment_methods" DROP CONSTRAINT "user_payment_methods_user_id_sys_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_shortcuts" DROP CONSTRAINT "user_shortcuts_user_id_sys_users_id_fk";
--> statement-breakpoint
ALTER TABLE "sys_notifications" ALTER COLUMN "user_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sys_permissions" ALTER COLUMN "role_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_devices" ALTER COLUMN "user_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_shortcuts" ALTER COLUMN "user_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_shortcuts" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_permissions" ADD CONSTRAINT "sys_permissions_role_id_sys_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."sys_roles"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_users" ADD CONSTRAINT "sys_users_role_id_sys_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."sys_roles"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_payment_methods" ADD CONSTRAINT "user_payment_methods_user_id_sys_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sys_users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_shortcuts" ADD CONSTRAINT "user_shortcuts_user_id_sys_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sys_users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
