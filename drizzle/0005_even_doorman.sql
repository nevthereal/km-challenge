ALTER TABLE "competition" RENAME TO "challenge";--> statement-breakpoint
ALTER TABLE "discipline" RENAME COLUMN "competition_id" TO "challenge_id";--> statement-breakpoint
ALTER TABLE "entry" RENAME COLUMN "competition_id" TO "challenge_id";--> statement-breakpoint
ALTER TABLE "code" RENAME COLUMN "competition_id" TO "challenge_id";--> statement-breakpoint
ALTER TABLE "challenge" DROP CONSTRAINT "competition_creator_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "discipline" DROP CONSTRAINT "discipline_competition_id_competition_id_fk";
--> statement-breakpoint
ALTER TABLE "entry" DROP CONSTRAINT "entry_competition_id_competition_id_fk";
--> statement-breakpoint
ALTER TABLE "code" DROP CONSTRAINT "code_competition_id_competition_id_fk";
--> statement-breakpoint
ALTER TABLE "challenge" ALTER COLUMN "starts_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "challenge" ALTER COLUMN "ends_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discipline" ADD CONSTRAINT "discipline_challenge_id_challenge_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry" ADD CONSTRAINT "entry_challenge_id_challenge_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code" ADD CONSTRAINT "code_challenge_id_challenge_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge"("id") ON DELETE no action ON UPDATE no action;