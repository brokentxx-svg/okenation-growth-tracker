import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
