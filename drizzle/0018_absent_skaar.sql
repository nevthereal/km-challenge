ALTER TABLE "code" RENAME TO "inviteCode";--> statement-breakpoint
ALTER TABLE "inviteCode" DROP CONSTRAINT "code_club_id_club_id_fk";
--> statement-breakpoint
ALTER TABLE "inviteCode" ADD CONSTRAINT "inviteCode_club_id_club_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."club"("id") ON DELETE cascade ON UPDATE no action;