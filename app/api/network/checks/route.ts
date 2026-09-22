import { getChatGPTUser } from "../../../chatgpt-auth";
import { getDb } from "../../../../db";
import { accounts, memberChecks } from "../../../../db/schema";
import { demoAccounts } from "../../../../lib/seed-data";
import { memberCheckResults, mentionPlatforms, mentionSurfaces } from "../../../../lib/network";

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
  if (message.includes("no such table") || message.includes("member_checks") || message.includes("accounts")) {
    return "Saved network storage is not ready yet. Apply the latest D1 migration before recording checks.";
  }
  return message;
}

export async function POST(request: Request) {
  if (!(await getChatGPTUser())) return Response.json({ error: "Sign in to record network evidence." }, { status: 401 });

  try {
    const payload = await request.json() as Record<string, unknown>;
    const accountId = typeof payload.accountId === "string" ? payload.accountId : "";
    const account = demoAccounts.find((candidate) => candidate.id === accountId);
    if (!account) return Response.json({ error: "Choose a known Okenation account." }, { status: 400 });

    const platform = typeof payload.platform === "string" && mentionPlatforms.includes(payload.platform as typeof mentionPlatforms[number]) ? payload.platform : null;
    const result = typeof payload.result === "string" && memberCheckResults.includes(payload.result as typeof memberCheckResults[number]) ? payload.result : null;
    const surfaces = Array.isArray(payload.surfacesChecked)
      ? payload.surfacesChecked.filter((surface): surface is typeof mentionSurfaces[number] => typeof surface === "string" && mentionSurfaces.includes(surface as typeof mentionSurfaces[number]))
      : [];
    if (!platform || !result) return Response.json({ error: "Choose a valid source and check result." }, { status: 400 });

    const rawCheckedAt = typeof payload.checkedAt === "string" && payload.checkedAt ? payload.checkedAt : null;
    const checkedDate = rawCheckedAt ? new Date(rawCheckedAt) : new Date();
    if (Number.isNaN(checkedDate.valueOf())) return Response.json({ error: "Checked time is invalid." }, { status: 400 });
    const checkedAt = checkedDate.toISOString();
    const sourceUrl = typeof payload.sourceUrl === "string" && payload.sourceUrl.trim() ? payload.sourceUrl.trim().slice(0, 500) : null;
    if (sourceUrl && !validUrl(sourceUrl)) return Response.json({ error: "Source URL must be a valid HTTP or HTTPS link." }, { status: 400 });
    const note = typeof payload.note === "string" ? payload.note.trim().slice(0, 600) : "";

    const db = getDb();
    await db.insert(accounts).values({ id: account.id, name: account.name, handle: account.handle, profileUrl: account.profileUrl, role: account.role, status: account.status }).onConflictDoNothing();
    const [check] = await db.insert(memberChecks).values({ accountId, platform, sourceUrl, checkedAt, surfacesChecked: surfaces.join(","), result, note }).returning();
    return Response.json({ check }, { status: 201 });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 503 });
  }
}
