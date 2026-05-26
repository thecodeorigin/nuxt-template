DROP TABLE `todos`;
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`type` text DEFAULT 'one_time' NOT NULL,
	`price` integer NOT NULL,
	`price_currency` text DEFAULT 'USD' NOT NULL,
	`billing_interval` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `products_status_idx` ON `products` (`status`);
--> statement-breakpoint
CREATE INDEX `products_type_idx` ON `products` (`type`);
