CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`permissions` text DEFAULT '[]' NOT NULL,
	`is_system` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_org_name_unique` ON `roles` (`organization_id`,`name`);--> statement-breakpoint
CREATE INDEX `roles_org_idx` ON `roles` (`organization_id`);--> statement-breakpoint
CREATE TABLE `organization_member_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`role_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `organization_members`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `member_roles_unique` ON `organization_member_roles` (`member_id`,`role_id`);--> statement-breakpoint
CREATE INDEX `member_roles_member_idx` ON `organization_member_roles` (`member_id`);--> statement-breakpoint
CREATE INDEX `member_roles_role_idx` ON `organization_member_roles` (`role_id`);--> statement-breakpoint
ALTER TABLE `organization_invitations` ADD `role_id` text REFERENCES roles(id) ON DELETE set null;--> statement-breakpoint
ALTER TABLE `organization_invitations` DROP COLUMN `role`;
