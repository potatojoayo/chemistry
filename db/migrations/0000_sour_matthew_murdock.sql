CREATE TABLE "answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"answer" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "answers_profile_id_question_id_key" UNIQUE("profile_id","question_id")
);
--> statement-breakpoint
ALTER TABLE "answers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" uuid NOT NULL,
	"nickname" text,
	"avatar_url" text DEFAULT 'https://bsqlysekyircziilazvv.supabase.co/storage/v1/object/public/images/profiles/default-avatar.png',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"test_index" integer DEFAULT 0 NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"openness" real,
	"conscientiousness" real,
	"extraversion" real,
	"agreeableness" real,
	"neuroticism" real,
	"avoidance" real,
	"anxiety" real,
	"humor" real,
	"conflict" real,
	"z_openness" real,
	"z_conscientiousness" real,
	"z_extraversion" real,
	"z_agreeableness" real,
	"z_neuroticism" real,
	"z_avoidance" real,
	"z_anxiety" real,
	"z_humor" real,
	"z_conflict" real,
	"test_completed" boolean DEFAULT false NOT NULL,
	"emotional_stability_percentage" real,
	"big_5_type" bigint,
	"flexibility_percentage" real,
	"emotional_stability_level" smallint,
	"attachment_type" text,
	"flexibility_level" smallint,
	"passion_level" smallint,
	"passion_type" text,
	"passion_index" real,
	"gender" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" text DEFAULT 'gen_random_uuid()' NOT NULL,
	"domain" text NOT NULL,
	"code" text NOT NULL,
	"content" text NOT NULL,
	"selection_count" smallint DEFAULT 5 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"index" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "questions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inviter_profile_id" uuid NOT NULL,
	"invitee_profile_id" uuid NOT NULL,
	"relationship_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tikitaka_index" real NOT NULL,
	"chemistry_index" real NOT NULL,
	"aas_score" real NOT NULL,
	"aas_level" smallint NOT NULL,
	"big_5_score" real NOT NULL,
	"big_5_level" smallint NOT NULL,
	"passion_type_number" smallint NOT NULL,
	"passion_index" real NOT NULL,
	"flexibility_score" real NOT NULL,
	"flexibility_level" smallint NOT NULL,
	CONSTRAINT "uq_relation_pair" UNIQUE("inviter_profile_id","invitee_profile_id")
);
--> statement-breakpoint
ALTER TABLE "relationships" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "report_aas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"type_text" text NOT NULL,
	"emotional_stability_level" smallint NOT NULL,
	"overall_evaluation" text NOT NULL,
	"detail_evaluations" text NOT NULL,
	"counseling_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"emotional_stability_text" text NOT NULL,
	"title" text NOT NULL,
	"sequence" smallint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_aas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "report_big_5" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"big_5_type" bigint NOT NULL,
	"sequence" integer NOT NULL,
	"nickname" text NOT NULL,
	"title" text NOT NULL,
	"overall_evaluation" text NOT NULL,
	"detail_evaluations" text NOT NULL,
	"counseling_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "report_big_5_big_5_type_key" UNIQUE("big_5_type")
);
--> statement-breakpoint
ALTER TABLE "report_big_5" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "report_chemistry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aas_level" integer NOT NULL,
	"big_5_level" integer NOT NULL,
	"flexibility_level" integer NOT NULL,
	"overall_evaluation" text NOT NULL,
	"detail_evaluations" text NOT NULL,
	"counseling_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"emotional_stability_text" text NOT NULL,
	"title" text NOT NULL,
	"sequence" smallint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_chemistry" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "report_flexibility" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flexibility_level" smallint NOT NULL,
	"flexibility_label" text NOT NULL,
	"title" text NOT NULL,
	"overall_evaluation" text NOT NULL,
	"detail_evaluation" text NOT NULL,
	"counseling_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_flexibility" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "report_passion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"male_passion_level" integer NOT NULL,
	"female_passion_level" integer NOT NULL,
	"male_passion_type" text NOT NULL,
	"female_passion_type" text NOT NULL,
	"overall_evaluation" text NOT NULL,
	"detail_evaluations" text NOT NULL,
	"counseling_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"emotional_stability_text" text NOT NULL,
	"title" text NOT NULL,
	"sequence" smallint NOT NULL,
	"type_number" smallint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_passion" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "report_tikitaka" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tikitaka_index" double precision NOT NULL,
	"overall_evaluation" text NOT NULL,
	"detail_evaluations" text NOT NULL,
	"counseling_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	"sequence" smallint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_tikitaka" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tests" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_inviter_profile_id_profiles_id_fk" FOREIGN KEY ("inviter_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_invitee_profile_id_profiles_id_fk" FOREIGN KEY ("invitee_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_relations_requester" ON "relationships" USING btree ("inviter_profile_id");--> statement-breakpoint
CREATE INDEX "idx_relations_target" ON "relationships" USING btree ("invitee_profile_id");--> statement-breakpoint
CREATE POLICY "users can manage their own answers" ON "answers" AS PERMISSIVE FOR ALL TO "authenticated" USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())) WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "authenticated can view all profiles" ON "profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "users can insert their own profile" ON "profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (user_id = auth.uid());--> statement-breakpoint
CREATE POLICY "users can update their own profile" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());--> statement-breakpoint
CREATE POLICY "users can manage their own relationships" ON "relationships" AS PERMISSIVE FOR ALL TO "authenticated" USING (inviter_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR invitee_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())) WITH CHECK (inviter_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR invitee_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "public_read_access" ON "report_aas" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "public_read_access" ON "report_big_5" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "public_read_access" ON "report_chemistry" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "public_read_access" ON "report_flexibility" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "public_read_access" ON "report_passion" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "public_read_access" ON "report_tikitaka" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "public can view tests" ON "tests" AS PERMISSIVE FOR SELECT TO public USING (true);