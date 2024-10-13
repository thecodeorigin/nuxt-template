ALTER TABLE "sys_faqs" DROP CONSTRAINT "public_sys_faqs_category_id_fkey";
--> statement-breakpoint
ALTER TABLE "sys_notifications" DROP CONSTRAINT "public_sys_notifications_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "sys_permissions" DROP CONSTRAINT "public_sys_permissions_role_id_fkey";
--> statement-breakpoint
ALTER TABLE "sys_users" DROP CONSTRAINT "public_sys_users_role_id_fkey";
--> statement-breakpoint
ALTER TABLE "user_devices" DROP CONSTRAINT "public_user_devices_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "user_payment_methods" DROP CONSTRAINT "public_user_payment_methods_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "user_shortcuts" DROP CONSTRAINT "public_user_shortcuts_user_id_fkey";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_faqs" ADD CONSTRAINT "sys_faqs_category_id_sys_faq_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."sys_faq_categories"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_notifications" ADD CONSTRAINT "sys_notifications_user_id_sys_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sys_users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_permissions" ADD CONSTRAINT "sys_permissions_role_id_sys_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."sys_roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sys_users" ADD CONSTRAINT "sys_users_role_id_sys_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."sys_roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_sys_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sys_users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_payment_methods" ADD CONSTRAINT "user_payment_methods_user_id_sys_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sys_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_shortcuts" ADD CONSTRAINT "user_shortcuts_user_id_sys_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sys_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
