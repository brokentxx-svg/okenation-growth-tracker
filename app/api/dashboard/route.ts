import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { accounts, snapshots } from "../../../db/schema";
import { demoAccounts, demoDashboard, demoIdeas, demoPosts, demoSnapshots, type Account, type Snapshot } from "../../../lib/seed-data";

function toAccount(row: typeof accounts.$inferSelect): Account {
  return {
    id: row.id,
    name: row.name,
    handle: row.handle,
    profileUrl: row.profileUrl,
    role: row.role,
    status: row.status,
  };
}

function toSnapshot(row: typeof snapshots.$inferSelect): Snapshot {
  return {
    id: row.id,
    accountId: row.accountId,
    capturedAt: row.capturedAt,
    followers: row.followers,
    following: row.following,
    likes: row.likes,
    posts: row.posts,
    source: row.source,
    evidenceNote: row.evidenceNote,
  };
}

function fallbackResponse(message?: string) {
  return Response.json({
    ...demoDashboard,
    storage: "fallback",
    storageMessage: message ?? demoDashboard.storageMessage,
  }, { headers: { "cache-control": "no-store" } });
}

export async function GET() {
  try {
    const db = getDb();
    const [storedAccounts, storedSnapshots] = await Promise.all([
      db.select().from(accounts),
      db.select().from(snapshots).orderBy(desc(snapshots.capturedAt), desc(snapshots.id)),
    ]);
    const accountMap = new Map(demoAccounts.map((account) => [account.id, account]));
    storedAccounts.forEach((row) => accountMap.set(row.id, toAccount(row)));
    const snapshotMap = new Map(demoSnapshots.map((snapshot) => [`${snapshot.accountId}:${snapshot.capturedAt}`, snapshot]));
    storedSnapshots.map(toSnapshot).forEach((snapshot) => snapshotMap.set(`${snapshot.accountId}:${snapshot.capturedAt}`, snapshot));
    return Response.json({
      accounts: [...accountMap.values()],
      snapshots: [...snapshotMap.values()],
      posts: demoPosts,
      ideas: demoIdeas,
      refreshAttempt: demoDashboard.refreshAttempt,
      storage: "database",
      storageMessage: "Snapshots are being read from the Site database; seeded observations remain labelled by source.",
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Database unavailable";
    return fallbackResponse(`Saved storage is not available yet: ${detail}`);
  }
}
