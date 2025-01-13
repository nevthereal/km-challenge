ALTER TABLE "athlete" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "athlete" CASCADE;--> statement-breakpoint
ALTER TABLE "entry" RENAME COLUMN "athleteId" TO "userId";--> statement-breakpoint
ALTER TABLE "entry" DROP CONSTRAINT "entry_athleteId_athlete_id_fk";
--> statement-breakpoint
ALTER TABLE "entry" ADD CONSTRAINT "entry_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;