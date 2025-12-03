ALTER TABLE "report_tikitaka" ADD COLUMN "min_index" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "report_tikitaka" ADD COLUMN "max_index" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "report_tikitaka" DROP COLUMN "tikitaka_index";