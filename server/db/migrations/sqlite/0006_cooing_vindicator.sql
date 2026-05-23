CREATE TABLE `organization_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`token` text NOT NULL,
	`invited_by` text,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_invitations_token_unique` ON `organization_invitations` (`token`);--> statement-breakpoint
CREATE INDEX `org_invitations_org_idx` ON `organization_invitations` (`organization_id`);--> statement-breakpoint
CREATE INDEX `org_invitations_token_idx` ON `organization_invitations` (`token`);