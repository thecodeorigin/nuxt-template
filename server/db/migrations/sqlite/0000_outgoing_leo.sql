CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`action_ref_id` text,
	`test` text,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `activities_user_id_idx` ON `activities` (`user_id`);--> statement-breakpoint
CREATE TABLE `identities` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`provider_user_id` text NOT NULL,
	`provider_data` text,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `identities_user_id_idx` ON `identities` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `identities_provider_unique_idx` ON `identities` (`provider`,`provider_user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text,
	`name` text,
	`primary_email` text NOT NULL,
	`primary_phone` text,
	`avatar` text,
	`verified` integer DEFAULT false,
	`email_notifications` integer DEFAULT true,
	`abilities` text DEFAULT '[]' NOT NULL,
	`custom_data` text DEFAULT '{}',
	`last_sign_in_at` integer,
	`is_suspended` integer DEFAULT false,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_primary_email_unique` ON `users` (`primary_email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_primary_phone_unique` ON `users` (`primary_phone`);--> statement-breakpoint
CREATE INDEX `users_username_idx` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `users_name_idx` ON `users` (`name`);