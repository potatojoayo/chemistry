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
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    nickname: text("nickname"),
    avatar_url: text("avatar_url")
      .default(
        "https://bsqlysekyircziilazvv.supabase.co/storage/v1/object/public/images/profiles/default-avatar.png"
      )
      .notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    test_index: integer("test_index").default(0).notNull(),
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
    z_openness: real("z_openness"),
    z_conscientiousness: real("z_conscientiousness"),
    z_extraversion: real("z_extraversion"),
    z_agreeableness: real("z_agreeableness"),
    z_neuroticism: real("z_neuroticism"),
    z_avoidance: real("z_avoidance"),
    z_anxiety: real("z_anxiety"),
    z_humor: real("z_humor"),
    z_conflict: real("z_conflict"),
    test_completed: boolean("test_completed").default(false).notNull(),
    emotional_stability_percentage: real("emotional_stability_percentage"),
    big_5_type: bigint("big_5_type", { mode: "number" }),
    flexibility_percentage: real("flexibility_percentage"),
    emotional_stability_level: smallint("emotional_stability_level"),
    attachment_type: text("attachment_type"),
    flexibility_level: smallint("flexibility_level"),
    passion_level: smallint("passion_level"),
    passion_type: text("passion_type"),
    passion_index: real("passion_index"),
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
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
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
  test_id: text("test_id")
    .default("gen_random_uuid()")
    .notNull()
    .references(() => tests.id, { onDelete: "cascade" }),
  domain: text("domain").notNull(),
  content: text("content").notNull(),
  selection_count: smallint("selection_count").default(5).notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  index: bigint("index", { mode: "number" }).default(0).notNull(),
}).enableRLS();

export const answers = pgTable(
  "answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profile_id: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    question_id: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "restrict" }),
    answer: smallint("answer").notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("answers_profile_id_question_id_key").on(
      table.profile_id,
      table.question_id
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
    inviter_profile_id: uuid("inviter_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    invitee_profile_id: uuid("invitee_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    relationship_type: text("relationship_type").notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    tikitaka_index: real("tikitaka_index").notNull(),
    chemistry_index: real("chemistry_index").notNull(),
    aas_score: real("aas_score").notNull(),
    aas_level: smallint("aas_level").notNull(),
    big_5_score: real("big_5_score").notNull(),
    big_5_level: smallint("big_5_level").notNull(),
    passion_type_number: smallint("passion_type_number").notNull(),
    passion_index: real("passion_index").notNull(),
    flexibility_score: real("flexibility_score").notNull(),
    flexibility_level: smallint("flexibility_level").notNull(),
  },
  (table) => [
    unique("uq_relation_pair").on(
      table.inviter_profile_id,
      table.invitee_profile_id
    ),
    index("idx_relations_requester").on(table.inviter_profile_id),
    index("idx_relations_target").on(table.invitee_profile_id),
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
    type_text: text("type_text").notNull(),
    emotional_stability_level: smallint("emotional_stability_level").notNull(),
    overall_evaluation: text("overall_evaluation").notNull(),
    detail_evaluations: text("detail_evaluations").notNull(),
    counseling_text: text("counseling_text").notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    emotional_stability_text: text("emotional_stability_text").notNull(),
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
    big_5_type: bigint("big_5_type", { mode: "number" }).notNull(),
    sequence: integer("sequence").notNull(),
    nickname: text("nickname").notNull(),
    title: text("title").notNull(),
    overall_evaluation: text("overall_evaluation").notNull(),
    detail_evaluations: text("detail_evaluations").notNull(),
    counseling_text: text("counseling_text").notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    unique("report_big_5_big_5_type_key").on(table.big_5_type),
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
    aas_level: integer("aas_level").notNull(),
    big_5_level: integer("big_5_level").notNull(),
    flexibility_level: integer("flexibility_level").notNull(),
    overall_evaluation: text("overall_evaluation").notNull(),
    detail_evaluations: text("detail_evaluations").notNull(),
    counseling_text: text("counseling_text").notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    emotional_stability_text: text("emotional_stability_text").notNull(),
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
    flexibility_level: smallint("flexibility_level").notNull(),
    flexibility_label: text("flexibility_label").notNull(),
    title: text("title").notNull(),
    overall_evaluation: text("overall_evaluation").notNull(),
    detail_evaluation: text("detail_evaluation").notNull(),
    counseling_text: text("counseling_text").notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
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
    male_passion_level: integer("male_passion_level").notNull(),
    female_passion_level: integer("female_passion_level").notNull(),
    male_passion_type: text("male_passion_type").notNull(),
    female_passion_type: text("female_passion_type").notNull(),
    overall_evaluation: text("overall_evaluation").notNull(),
    detail_evaluations: text("detail_evaluations").notNull(),
    counseling_text: text("counseling_text").notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    emotional_stability_text: text("emotional_stability_text").notNull(),
    title: text("title").notNull(),
    sequence: smallint("sequence").notNull(),
    type_number: smallint("type_number").notNull(),
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
    tikitaka_index: doublePrecision("tikitaka_index").notNull(),
    overall_evaluation: text("overall_evaluation").notNull(),
    detail_evaluations: text("detail_evaluations").notNull(),
    counseling_text: text("counseling_text").notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
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

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Test = typeof tests.$inferSelect;
export type NewTest = typeof tests.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;

export type Relationship = typeof relationships.$inferSelect;
export type NewRelationship = typeof relationships.$inferInsert;

export type ReportBig5 = typeof reportBig5.$inferSelect;
export type NewReportBig5 = typeof reportBig5.$inferInsert;

export type ReportFlexibility = typeof reportFlexibility.$inferSelect;
export type NewReportFlexibility = typeof reportFlexibility.$inferInsert;

export type ReportPassion = typeof reportPassion.$inferSelect;
export type NewReportPassion = typeof reportPassion.$inferInsert;

export type ReportTikitaka = typeof reportTikitaka.$inferSelect;
export type NewReportTikitaka = typeof reportTikitaka.$inferInsert;

export type ReportAAS = typeof reportAas.$inferSelect;
export type NewReportAAS = typeof reportAas.$inferInsert;

export type ReportChemistry = typeof reportChemistry.$inferSelect;
export type NewReportChemistry = typeof reportChemistry.$inferInsert;
