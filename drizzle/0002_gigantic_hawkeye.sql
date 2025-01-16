ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "public"."user" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."role";--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('Coach', 'U15', 'U17', 'U19');--> statement-breakpoint
ALTER TABLE "public"."user" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";