ALTER TABLE "code" RENAME COLUMN "challenge_id" TO "club_id";--> statement-breakpoint
ALTER TABLE "code" DROP CONSTRAINT "code_challenge_id_challenge_id_fk";
--> statement-breakpoint
ALTER TABLE "code" ADD CONSTRAINT "code_club_id_club_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."club"("id") ON DELETE cascade ON UPDATE no action;