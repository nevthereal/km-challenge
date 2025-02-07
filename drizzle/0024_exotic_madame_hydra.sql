ALTER TABLE "challenge_member" ADD COLUMN "joined_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "club_admin" ADD COLUMN "granted_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "club_member" ADD COLUMN "joined_at" timestamp DEFAULT now();