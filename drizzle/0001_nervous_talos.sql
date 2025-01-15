ALTER TABLE "user" ADD COLUMN "role" "role" DEFAULT 'Athlet' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "admin" boolean DEFAULT false;