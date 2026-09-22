import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { accounts, memberChecks, mentionObservations } from "../../../db/schema";
import { buildNetworkData, parseSurfaces, type MemberCheck, type MentionObservation, type MentionPlatform, type MentionSurface } from "../../../lib/network";
import { demoAccounts, demoMemberChecks, demoMentionObservations } from "../../../lib/seed-data";

function toMemberCheck(row: typeof memberChecks.$inferSelect): MemberCheck {
  return {
    id: row.id,
    accountId: row.accountId,
    platform: row.platform as MentionPlatform,
    sourceUrl: row.sourceUrl,
    checkedAt: row.checkedAt,
    surfacesChecked: parseSurfaces(row.surfacesChecked),
    result: row.result as MemberCheck["result"],
    note: row.note,
  };
}

function toMentionObservation(row: typeof mentionObservations.$inferSelect): MentionObservation {
  return {
    id: row.id,
    sourceAccountId: row.sourceAccountId,
    targetAccountId: row.targetAccountId,
    targetHandle: row.targetHandle,
    sourceUrl: row.sourceUrl,
    platform: row.platform as MentionPlatform,
    surface: row.surface as MentionSurface,
    evidenceText: row.evidenceText,
    capturedAt: row.capturedAt,
  };
}

function fallbackResponse(message?: string) {
  return Response.json({
    ...buildNetworkData(demoAccounts, demoMemberChecks, demoMentionObservations),
    storage: "fallback",
    storageMessage: message ?? "Saved network observations are not connected yet; record checks after the Site database is ready.",
  }, { headers: { "cache-control": "no-store" } });
}

export async function GET() {
  try {
    const db = getDb();
    const [storedAccounts, storedChecks, storedObservations] = await Promise.all([
      db.select().from(accounts),
      db.select().from(memberChecks).orderBy(desc(memberChecks.checkedAt), desc(memberChecks.id)),
      db.select().from(mentionObservations).orderBy(desc(mentionObservations.capturedAt), desc(mentionObservations.id)),
    ]);
    const accountMap = new Map(demoAccounts.map((account) => [account.id, account]));
    storedAccounts.forEach((row) => accountMap.set(row.id, {
      id: row.id,
      name: row.name,
      handle: row.handle,
      profileUrl: row.profileUrl,
      role: row.role,
      status: row.status,
    }));
    const checks = [...demoMemberChecks, ...storedChecks.map(toMemberCheck)];
    const observations = [...demoMentionObservations, ...storedObservations.map(toMentionObservation)];
    return Response.json({
      ...buildNetworkData([...accountMap.values()], checks, observations),
      storage: "database",
      storageMessage: "Saved mention checks and observations are shown with their capture source and time.",
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Database unavailable";
    return fallbackResponse(`Saved network storage is not available yet: ${detail}`);
  }
}
