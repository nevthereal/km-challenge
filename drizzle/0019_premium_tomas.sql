ALTER TABLE "inviteCode" RENAME TO "invite_code";--> statement-breakpoint
ALTER TABLE "invite_code" DROP CONSTRAINT "inviteCode_club_id_club_id_fk";
--> statement-breakpoint
ALTER TABLE "invite_code" ADD CONSTRAINT "invite_code_club_id_club_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."club"("id") ON DELETE cascade ON UPDATE no action;