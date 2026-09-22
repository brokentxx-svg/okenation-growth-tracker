import { getChatGPTUser } from "../../../chatgpt-auth";
import { getDb } from "../../../../db";
import { accounts, mentionObservations } from "../../../../db/schema";
import { displayHandle, mentionPlatforms, mentionSurfaces, resolveTargetAccountId } from "../../../../lib/network";
import { demoAccounts } from "../../../../lib/seed-data";

function validUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function routeError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  if (message.includes("no such table") || message.includes("mention_observations") || message.includes("accounts")) {
    return "Saved network storage is not ready yet. Apply the latest D1 migration before recording mentions.";
  }
  return message;
}

export async function POST(request: Request) {
  if (!(await getChatGPTUser())) return Response.json({ error: "Sign in to record network evidence." }, { status: 401 });

  try {
    const payload = await request.json() as Record<string, unknown>;
    const sourceAccountId = typeof payload.sourceAccountId === "string" ? payload.sourceAccountId : "";
    const sourceAccount = demoAccounts.find((candidate) => candidate.id === sourceAccountId);
    if (!sourceAccount) return Response.json({ error: "Choose a known source account." }, { status: 400 });

    const targetHandle = typeof payload.targetHandle === "string" ? displayHandle(payload.targetHandle) : "";
    if (!targetHandle) return Response.json({ error: "Enter the visible @handle that was mentioned." }, { status: 400 });
    const targetAccountId = resolveTargetAccountId(targetHandle, demoAccounts);
    if (targetAccountId === sourceAccountId) return Response.json({ error: "Self-mentions are not relationship edges." }, { status: 400 });

    const platform = typeof payload.platform === "string" && mentionPlatforms.includes(payload.platform as typeof mentionPlatforms[number]) ? payload.platform : null;
    const surface = typeof payload.surface === "string" && mentionSurfaces.includes(payload.surface as typeof mentionSurfaces[number]) ? payload.surface : null;
    if (!platform || !surface) return Response.json({ error: "Choose a valid source platform and mention surface." }, { status: 400 });

    const sourceUrl = typeof payload.sourceUrl === "string" ? payload.sourceUrl.trim().slice(0, 500) : "";
    if (!sourceUrl || !validUrl(sourceUrl)) return Response.json({ error: "Source URL must be a valid HTTP or HTTPS link." }, { status: 400 });
    const evidenceText = typeof payload.evidenceText === "string" ? payload.evidenceText.trim().slice(0, 600) : "";
    if (!evidenceText) return Response.json({ error: "Paste the visible evidence excerpt." }, { status: 400 });

    const rawCapturedAt = typeof payload.capturedAt === "string" && payload.capturedAt ? payload.capturedAt : null;
    const capturedDate = rawCapturedAt ? new Date(rawCapturedAt) : new Date();
    if (Number.isNaN(capturedDate.valueOf())) return Response.json({ error: "Captured time is invalid." }, { status: 400 });
    const capturedAt = capturedDate.toISOString();

    const db = getDb();
    const relatedAccounts = [sourceAccount, ...(targetAccountId ? demoAccounts.filter((candidate) => candidate.id === targetAccountId) : [])];
    await db.insert(accounts).values(relatedAccounts.map((account) => ({ id: account.id, name: account.name, handle: account.handle, profileUrl: account.profileUrl, role: account.role, status: account.status }))).onConflictDoNothing();
    const [observation] = await db.insert(mentionObservations).values({ sourceAccountId, targetAccountId, targetHandle, sourceUrl, platform, surface, evidenceText, capturedAt }).onConflictDoNothing().returning();
    if (!observation) return Response.json({ status: "duplicate", message: "That exact source mention is already recorded." });
    return Response.json({ observation }, { status: 201 });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 503 });
  }
}
