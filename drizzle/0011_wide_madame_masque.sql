CREATE TYPE "public"."gender" AS ENUM('M', 'F');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "gender" "gender";