ALTER TABLE "profiles" RENAME COLUMN "emotional_stability_percentage" TO "emotional_flexibility_percentage";--> statement-breakpoint
ALTER TABLE "profiles" RENAME COLUMN "emotional_stability_level" TO "emotional_flexibility_level";--> statement-breakpoint
ALTER TABLE "report_aas" RENAME COLUMN "emotional_stability_level" TO "emotional_flexibility_level";--> statement-breakpoint
ALTER TABLE "report_aas" RENAME COLUMN "emotional_stability_text" TO "emotional_flexibility_text";--> statement-breakpoint
ALTER TABLE "report_chemistry" RENAME COLUMN "emotional_stability_text" TO "emotional_flexibility_text";--> statement-breakpoint
ALTER TABLE "report_passion" RENAME COLUMN "emotional_stability_text" TO "emotional_flexibility_text";