CREATE TABLE "code" (
	"code" text PRIMARY KEY NOT NULL,
	"competitionId" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "entry" ADD COLUMN "createdAt" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "role";--> statement-breakpoint
ALTER TABLE "code" ADD CONSTRAINT "code_competitionId_competition_id_fk" FOREIGN KEY ("competitionId") REFERENCES "public"."competition"("id") ON DELETE no action ON UPDATE no action;