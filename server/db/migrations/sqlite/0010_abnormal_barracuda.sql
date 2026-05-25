CREATE TABLE `support_ticket_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`ticket_id` text NOT NULL,
	`author_id` text,
	`author_role` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `support_ticket_messages_ticket_idx` ON `support_ticket_messages` (`ticket_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`kind` text NOT NULL,
	`category` text,
	`subject` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`assigned_to` text,
	`last_message_at` integer NOT NULL,
	`last_message_role` text DEFAULT 'user' NOT NULL,
	`reminder_sent_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `support_tickets_user_idx` ON `support_tickets` (`user_id`);--> statement-breakpoint
CREATE INDEX `support_tickets_status_idx` ON `support_tickets` (`status`);--> statement-breakpoint
CREATE INDEX `support_tickets_assigned_idx` ON `support_tickets` (`assigned_to`);--> statement-breakpoint
CREATE INDEX `support_tickets_reminder_idx` ON `support_tickets` (`last_message_role`,`last_message_at`);