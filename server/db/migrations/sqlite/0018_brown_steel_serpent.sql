PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_project_products` (
	`project_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`added_at` integer NOT NULL,
	PRIMARY KEY(`project_id`, `product_id`),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_project_products`("project_id", "product_id", "quantity", "added_at") SELECT "project_id", "product_id", "quantity", "added_at" FROM `project_products`;--> statement-breakpoint
DROP TABLE `project_products`;--> statement-breakpoint
ALTER TABLE `__new_project_products` RENAME TO `project_products`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_invoice_items` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`description` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`amount` integer NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_invoice_items`("id", "invoice_id", "description", "quantity", "unit_price", "currency", "amount") SELECT "id", "invoice_id", "description", "quantity", "unit_price", "currency", "amount" FROM `invoice_items`;--> statement-breakpoint
DROP TABLE `invoice_items`;--> statement-breakpoint
ALTER TABLE `__new_invoice_items` RENAME TO `invoice_items`;--> statement-breakpoint
CREATE INDEX `invoice_items_invoice_idx` ON `invoice_items` (`invoice_id`);--> statement-breakpoint
CREATE TABLE `__new_invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`number` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`subtotal` integer DEFAULT 0 NOT NULL,
	`tax` integer DEFAULT 0 NOT NULL,
	`total` integer DEFAULT 0 NOT NULL,
	`issued_at` integer,
	`due_at` integer,
	`paid_at` integer,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_invoices`("id", "organization_id", "number", "status", "currency", "subtotal", "tax", "total", "issued_at", "due_at", "paid_at", "notes", "created_at", "updated_at") SELECT "id", "organization_id", "number", "status", "currency", "subtotal", "tax", "total", "issued_at", "due_at", "paid_at", "notes", "created_at", "updated_at" FROM `invoices`;--> statement-breakpoint
DROP TABLE `invoices`;--> statement-breakpoint
ALTER TABLE `__new_invoices` RENAME TO `invoices`;--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_number_unique` ON `invoices` (`number`);--> statement-breakpoint
CREATE INDEX `invoices_org_idx` ON `invoices` (`organization_id`);--> statement-breakpoint
CREATE INDEX `invoices_status_idx` ON `invoices` (`status`);--> statement-breakpoint
ALTER TABLE `organization_invitations` ADD `metadata` text DEFAULT '{}';--> statement-breakpoint
CREATE TABLE `__new_organization_billing_settings` (
	`organization_id` text PRIMARY KEY NOT NULL,
	`company_name` text,
	`tax_id` text,
	`address` text,
	`city` text,
	`country` text DEFAULT 'US',
	`currency` text DEFAULT 'USD' NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_organization_billing_settings`("organization_id", "company_name", "tax_id", "address", "city", "country", "currency", "updated_at") SELECT "organization_id", "company_name", "tax_id", "address", "city", "country", "currency", "updated_at" FROM `organization_billing_settings`;--> statement-breakpoint
DROP TABLE `organization_billing_settings`;--> statement-breakpoint
ALTER TABLE `__new_organization_billing_settings` RENAME TO `organization_billing_settings`;