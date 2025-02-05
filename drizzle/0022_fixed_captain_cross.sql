ALTER TABLE "challenge" DROP CONSTRAINT "challenge_creator_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "entry" DROP CONSTRAINT "entry_discipline_id_discipline_id_fk";
--> statement-breakpoint
ALTER TABLE "entry" ALTER COLUMN "discipline_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry" ADD CONSTRAINT "entry_discipline_id_discipline_id_fk" FOREIGN KEY ("discipline_id") REFERENCES "public"."discipline"("id") ON DELETE set null ON UPDATE no action;