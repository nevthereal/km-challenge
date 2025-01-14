ALTER TABLE "code" RENAME COLUMN "competitionId" TO "competition_id";--> statement-breakpoint
ALTER TABLE "competition" RENAME COLUMN "startsAt" TO "starts_at";--> statement-breakpoint
ALTER TABLE "competition" RENAME COLUMN "endsAt" TO "ends_at";--> statement-breakpoint
ALTER TABLE "competition" RENAME COLUMN "creatorId" TO "creator_id";--> statement-breakpoint
ALTER TABLE "discipline" RENAME COLUMN "competitionId" TO "competition_id";--> statement-breakpoint
ALTER TABLE "entry" RENAME COLUMN "disciplineId" TO "discipline_id";--> statement-breakpoint
ALTER TABLE "entry" RENAME COLUMN "competitionId" TO "competition_id";--> statement-breakpoint
ALTER TABLE "entry" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "entry" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "code" DROP CONSTRAINT "code_competitionId_competition_id_fk";
--> statement-breakpoint
ALTER TABLE "competition" DROP CONSTRAINT "competition_creatorId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "discipline" DROP CONSTRAINT "discipline_competitionId_competition_id_fk";
--> statement-breakpoint
ALTER TABLE "entry" DROP CONSTRAINT "entry_disciplineId_discipline_id_fk";
--> statement-breakpoint
ALTER TABLE "entry" DROP CONSTRAINT "entry_competitionId_competition_id_fk";
--> statement-breakpoint
ALTER TABLE "entry" DROP CONSTRAINT "entry_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "code" ADD CONSTRAINT "code_competition_id_competition_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition" ADD CONSTRAINT "competition_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discipline" ADD CONSTRAINT "discipline_competition_id_competition_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry" ADD CONSTRAINT "entry_discipline_id_discipline_id_fk" FOREIGN KEY ("discipline_id") REFERENCES "public"."discipline"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry" ADD CONSTRAINT "entry_competition_id_competition_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry" ADD CONSTRAINT "entry_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;