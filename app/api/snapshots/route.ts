import { getDb } from "../../../db";
import { accounts, snapshots } from "../../../db/schema";
import { demoAccounts } from "../../../lib/seed-data";

function numericOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : Number.NaN;
}

function routeError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  if (message.includes("no such table") || message.includes("accounts") || message.includes("snapshots")) {
    return "Saved storage is not ready yet. The dashboard can still show the verified baseline; try again after the Site database is provisioned.";
  }
  return message;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    const accountId = typeof payload.accountId === "string" ? payload.accountId : "";
    const account = demoAccounts.find((candidate) => candidate.id === accountId);
    if (!account) return Response.json({ error: "Choose a known Okenation account." }, { status: 400 });

    const followers = numericOrNull(payload.followers);
    const following = numericOrNull(payload.following);
    const likes = numericOrNull(payload.likes);
    if ([followers, following, likes].some(Number.isNaN)) {
      return Response.json({ error: "Metrics must be whole numbers 0 or higher." }, { status: 400 });
    }
    if ([followers, following, likes].every((value) => value === null)) {
      return Response.json({ error: "Enter at least one visible metric." }, { status: 400 });
    }

    const capturedAt = typeof payload.capturedAt === "string" && payload.capturedAt ? new Date(payload.capturedAt).toISOString() : new Date().toISOString();
    if (Number.isNaN(new Date(capturedAt).valueOf())) return Response.json({ error: "Captured time is invalid." }, { status: 400 });
    const source = typeof payload.source === "string" && payload.source.trim() ? payload.source.trim().slice(0, 120) : "manual TikTok capture";
    const evidenceNote = typeof payload.evidenceNote === "string" ? payload.evidenceNote.trim().slice(0, 600) : "";
    const db = getDb();
    await db.insert(accounts).values({ id: account.id, name: account.name, handle: account.handle, profileUrl: account.profileUrl, role: account.role, status: account.status }).onConflictDoNothing();
    const [snapshot] = await db.insert(snapshots).values({ accountId, capturedAt, followers, following, likes, source, evidenceNote }).returning();
    return Response.json({ snapshot }, { status: 201 });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 503 });
  }
}
