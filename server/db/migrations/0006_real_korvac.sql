ALTER TYPE "permission_subject" ADD VALUE 'Project';--> statement-breakpoint
ALTER TYPE "permission_subject" ADD VALUE 'Setting';--> statement-breakpoint
ALTER TYPE "permission_subject" ADD VALUE 'Landing';--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "source_duration" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "source_duration" SET DEFAULT 0;