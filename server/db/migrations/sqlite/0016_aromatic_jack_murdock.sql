CREATE TABLE `selfhost_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`actor_user_id` text,
	`action` text NOT NULL,
	`success` integer NOT NULL,
	`cf_account_id` text,
	`error_message` text,
	`started_at` integer NOT NULL,
	`finished_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `selfhost_audit_org_idx` ON `selfhost_audit` (`organization_id`);--> statement-breakpoint
CREATE INDEX `selfhost_audit_started_idx` ON `selfhost_audit` (`started_at`);--> statement-breakpoint
CREATE TABLE `selfhost_deployments` (
	`organization_id` text PRIMARY KEY NOT NULL,
	`cf_account_id` text,
	`cf_script_name` text,
	`workers_dev_url` text,
	`deployed_version` text,
	`deployed_at` integer,
	`cf_token_ciphertext` text,
	`cf_token_iv` text,
	`cf_token_expires_at` integer,
	`status` text DEFAULT 'idle' NOT NULL,
	`last_error` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
