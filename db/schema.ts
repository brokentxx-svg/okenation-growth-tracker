import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  handle: text("handle"),
  profileUrl: text("profile_url"),
  role: text("role").notNull().default("member"),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const snapshots = sqliteTable("snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: text("account_id").notNull().references(() => accounts.id),
  capturedAt: text("captured_at").notNull(),
  followers: integer("followers"),
  following: integer("following"),
  likes: integer("likes"),
  posts: integer("posts"),
  source: text("source").notNull().default("manual TikTok capture"),
  evidenceNote: text("evidence_note").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const memberChecks = sqliteTable("member_checks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: text("account_id").notNull().references(() => accounts.id),
  platform: text("platform").notNull(),
  sourceUrl: text("source_url"),
  checkedAt: text("checked_at").notNull(),
  surfacesChecked: text("surfaces_checked").notNull().default(""),
  result: text("result").notNull(),
  note: text("note").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const mentionObservations = sqliteTable("mention_observations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sourceAccountId: text("source_account_id").notNull().references(() => accounts.id),
  targetAccountId: text("target_account_id").references(() => accounts.id),
  targetHandle: text("target_handle").notNull(),
  sourceUrl: text("source_url").notNull(),
  platform: text("platform").notNull(),
  surface: text("surface").notNull(),
  evidenceText: text("evidence_text").notNull(),
  capturedAt: text("captured_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  sourceTargetSurfaceUnique: uniqueIndex("mention_source_target_surface_unique").on(table.sourceAccountId, table.sourceUrl, table.targetHandle, table.surface),
}));
