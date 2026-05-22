CREATE TABLE `todos` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text,
	`title` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `todos_org_idx` ON `todos` (`organization_id`);