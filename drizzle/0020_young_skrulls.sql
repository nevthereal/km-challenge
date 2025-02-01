CREATE INDEX "creator_id_idx" ON "challenge" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "club_id_idx" ON "challenge" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "date_range_idx" ON "challenge" USING btree ("starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "challenge_member_user_id_idx" ON "challenge_member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "challenge_member_challenge_id_idx" ON "challenge_member" USING btree ("challenge_id");--> statement-breakpoint
CREATE INDEX "club_admin_user_id_idx" ON "club_admin" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "club_admin_club_id_idx" ON "club_admin" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "club_member_user_id_idx" ON "club_member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "club_member_club_id_idx" ON "club_member" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "discipline_challenge_id_idx" ON "discipline" USING btree ("challenge_id");--> statement-breakpoint
CREATE INDEX "entry_discipline_id_idx" ON "entry" USING btree ("discipline_id");--> statement-breakpoint
CREATE INDEX "entry_challenge_id_idx" ON "entry" USING btree ("challenge_id");--> statement-breakpoint
CREATE INDEX "entry_user_id_idx" ON "entry" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "entry_date_idx" ON "entry" USING btree ("date");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");