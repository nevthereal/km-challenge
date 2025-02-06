ALTER TABLE "challenge" DROP CONSTRAINT "challenge_creator_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "creator_id_idx";--> statement-breakpoint
ALTER TABLE "challenge" DROP COLUMN "creator_id";