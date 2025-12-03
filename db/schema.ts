import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  doublePrecision,
  index,
  integer,
  pgPolicy,
  pgSchema,
  pgTable,
  real,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";

const authSchema = pgSchema("auth");

const users = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

export const profiles = pgTable(
  "profiles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    nickname: text("nickname"),
    avatarUrl: text("avatar_url").default(
      "https://bsqlysekyircziilazvv.supabase.co/storage/v1/object/public/images/profiles/default-avatar.png"
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    testIndex: integer("test_index").default(0).notNull(),
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    openness: real("openness"),
    conscientiousness: real("conscientiousness"),
    extraversion: real("extraversion"),
    agreeableness: real("agreeableness"),
    neuroticism: real("neuroticism"),
    avoidance: real("avoidance"),
    anxiety: real("anxiety"),
    humor: real("humor"),
    conflict: real("conflict"),
    zOpenness: real("z_openness"),
    zConscientiousness: real("z_conscientiousness"),
    zExtraversion: real("z_extraversion"),
    zAgreeableness: real("z_agreeableness"),
    zNeuroticism: real("z_neuroticism"),
    zAvoidance: real("z_avoidance"),
    zAnxiety: real("z_anxiety"),
    zHumor: real("z_humor"),
    zConflict: real("z_conflict"),
    testCompleted: boolean("test_completed").default(false).notNull(),
    emotionalStabilityPercentage: real("emotional_stability_percentage"),
    big5Type: bigint("big_5_type", { mode: "number" }),
    flexibilityPercentage: real("flexibility_percentage"),
    emotionalStabilityLevel: smallint("emotional_stability_level"),
    attachmentType: text("attachment_type"),
    flexibilityLevel: smallint("flexibility_level"),
    passionLevel: smallint("passion_level"),
    passionType: text("passion_type"),
    passionIndex: real("passion_index"),
    gender: text("gender").notNull(),
  },
  (table) => [
    pgPolicy("authenticated can view all profiles", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
    pgPolicy("users can insert their own profile", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`user_id = auth.uid()`,
    }),
    pgPolicy("users can update their own profile", {
      for: "update",
      to: authenticatedRole,
      using: sql`user_id = auth.uid()`,
      withCheck: sql`user_id = auth.uid()`,
    }),
  ]
);

export const tests = pgTable(
  "tests",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    pgPolicy("public can view tests", {
      for: "select",
      to: "public",
      using: sql`true`,
    }),
  ]
);

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  testId: text("test_id")
    .default("gen_random_uuid()")
    .notNull()
    .references(() => tests.id, { onDelete: "cascade" }),
  domain: text("domain").notNull(),
  code: text("code").notNull(),
  content: text("content").notNull(),
  selectionCount: smallint("selection_count").default(5).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  index: bigint("index", { mode: "number" }).default(0).notNull(),
}).enableRLS();

export const answers = pgTable(
  "answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "restrict" }),
    answer: smallint("answer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("answers_profile_id_question_id_key").on(
      table.profileId,
      table.questionId
    ),
    pgPolicy("users can manage their own answers", {
      for: "all",
      to: authenticatedRole,
      using: sql`profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())`,
      withCheck: sql`profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())`,
    }),
  ]
);

export const relationships = pgTable(
  "relationships",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    inviterProfileId: uuid("inviter_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    inviteeProfileId: uuid("invitee_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    relationshipType: text("relationship_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    tikitakaIndex: real("tikitaka_index").notNull(),
    chemistryIndex: real("chemistry_index").notNull(),
    aasScore: real("aas_score").notNull(),
    aasLevel: smallint("aas_level").notNull(),
    big5Score: real("big_5_score").notNull(),
    big5Level: smallint("big_5_level").notNull(),
    passionTypeNumber: smallint("passion_type_number").notNull(),
    passionIndex: real("passion_index").notNull(),
    flexibilityScore: real("flexibility_score").notNull(),
    flexibilityLevel: smallint("flexibility_level").notNull(),
  },
  (table) => [
    unique("uq_relation_pair").on(
      table.inviterProfileId,
      table.inviteeProfileId
    ),
    index("idx_relations_requester").on(table.inviterProfileId),
    index("idx_relations_target").on(table.inviteeProfileId),
    pgPolicy("users can manage their own relationships", {
      for: "all",
      to: authenticatedRole,
      using: sql`inviter_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR invitee_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())`,
      withCheck: sql`inviter_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR invitee_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())`,
    }),
  ]
);

export const reportAas = pgTable(
  "report_aas",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    type: text("type").notNull(),
    typeText: text("type_text").notNull(),
    emotionalStabilityLevel: smallint("emotional_stability_level").notNull(),
    overallEvaluation: text("overall_evaluation").notNull(),
    detailEvaluations: text("detail_evaluations").notNull(),
    counselingText: text("counseling_text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    emotionalStabilityText: text("emotional_stability_text").notNull(),
    title: text("title").notNull(),
    sequence: smallint("sequence").notNull(),
  },
  (table) => [
    pgPolicy("public_read_access", {
      for: "select",
      to: "public",
      using: sql`true`,
    }),
  ]
);

export const reportBig5 = pgTable(
  "report_big_5",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    big5Type: bigint("big_5_type", { mode: "number" }).notNull(),
    sequence: integer("sequence").notNull(),
    nickname: text("nickname").notNull(),
    title: text("title").notNull(),
    overallEvaluation: text("overall_evaluation").notNull(),
    detailEvaluations: text("detail_evaluations").notNull(),
    counselingText: text("counseling_text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("report_big_5_big_5_type_key").on(table.big5Type),
    pgPolicy("public_read_access", {
      for: "select",
      to: "public",
      using: sql`true`,
    }),
  ]
);

export const reportChemistry = pgTable(
  "report_chemistry",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    aasLevel: integer("aas_level").notNull(),
    big5Level: integer("big_5_level").notNull(),
    flexibilityLevel: integer("flexibility_level").notNull(),
    overallEvaluation: text("overall_evaluation").notNull(),
    detailEvaluations: text("detail_evaluations").notNull(),
    counselingText: text("counseling_text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    emotionalStabilityText: text("emotional_stability_text").notNull(),
    title: text("title").notNull(),
    sequence: smallint("sequence").notNull(),
  },
  (table) => [
    pgPolicy("public_read_access", {
      for: "select",
      to: "public",
      using: sql`true`,
    }),
  ]
);

export const reportFlexibility = pgTable(
  "report_flexibility",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    flexibilityLevel: smallint("flexibility_level").notNull(),
    flexibilityLabel: text("flexibility_label").notNull(),
    title: text("title").notNull(),
    overallEvaluation: text("overall_evaluation").notNull(),
    detailEvaluation: text("detail_evaluation").notNull(),
    counselingText: text("counseling_text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    pgPolicy("public_read_access", {
      for: "select",
      to: "public",
      using: sql`true`,
    }),
  ]
);

export const reportPassion = pgTable(
  "report_passion",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    malePassionLevel: integer("male_passion_level").notNull(),
    femalePassionLevel: integer("female_passion_level").notNull(),
    malePassionType: text("male_passion_type").notNull(),
    femalePassionType: text("female_passion_type").notNull(),
    overallEvaluation: text("overall_evaluation").notNull(),
    detailEvaluations: text("detail_evaluations").notNull(),
    counselingText: text("counseling_text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    emotionalStabilityText: text("emotional_stability_text").notNull(),
    title: text("title").notNull(),
    sequence: smallint("sequence").notNull(),
    typeNumber: smallint("type_number").notNull(),
  },
  (table) => [
    pgPolicy("public_read_access", {
      for: "select",
      to: "public",
      using: sql`true`,
    }),
  ]
);

export const reportTikitaka = pgTable(
  "report_tikitaka",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    tikitakaIndex: doublePrecision("tikitaka_index").notNull(),
    overallEvaluation: text("overall_evaluation").notNull(),
    detailEvaluations: text("detail_evaluations").notNull(),
    counselingText: text("counseling_text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    title: text("title").notNull(),
    sequence: smallint("sequence").notNull(),
  },
  (table) => [
    pgPolicy("public_read_access", {
      for: "select",
      to: "public",
      using: sql`true`,
    }),
  ]
);
