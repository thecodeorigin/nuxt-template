CREATE TABLE `permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`subject` text NOT NULL,
	`action` text NOT NULL,
	`scope` text,
	`org_kind` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `permissions_key_unique` ON `permissions` (`key`);--> statement-breakpoint
CREATE INDEX `permissions_subject_idx` ON `permissions` (`subject`);