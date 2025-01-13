CREATE TABLE "athlete" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"admin" boolean DEFAULT false,
	CONSTRAINT "athlete_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "competition" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"startsAt" timestamp NOT NULL,
	"endsAt" timestamp NOT NULL,
	"creatorId" text
);
--> statement-breakpoint
CREATE TABLE "discipline" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"factor" integer NOT NULL,
	"competitionId" text
);
--> statement-breakpoint
CREATE TABLE "entry" (
	"id" text PRIMARY KEY NOT NULL,
	"disciplineId" text NOT NULL,
	"competitionId" text NOT NULL,
	"athleteId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"admin" boolean DEFAULT false,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "competition" ADD CONSTRAINT "competition_creatorId_user_id_fk" FOREIGN KEY ("creatorId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discipline" ADD CONSTRAINT "discipline_competitionId_competition_id_fk" FOREIGN KEY ("competitionId") REFERENCES "public"."competition"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry" ADD CONSTRAINT "entry_disciplineId_discipline_id_fk" FOREIGN KEY ("disciplineId") REFERENCES "public"."discipline"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry" ADD CONSTRAINT "entry_competitionId_competition_id_fk" FOREIGN KEY ("competitionId") REFERENCES "public"."competition"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry" ADD CONSTRAINT "entry_athleteId_athlete_id_fk" FOREIGN KEY ("athleteId") REFERENCES "public"."athlete"("id") ON DELETE no action ON UPDATE no action;