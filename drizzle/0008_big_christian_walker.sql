CREATE TABLE "club" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "club_admin" (
	"user_id" text PRIMARY KEY NOT NULL,
	"club_id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "challenge" ADD COLUMN "club_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "club_admin" ADD CONSTRAINT "club_admin_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_admin" ADD CONSTRAINT "club_admin_club_id_club_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."club"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_club_id_club_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."club"("id") ON DELETE cascade ON UPDATE no action;