import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "db/schema.ts",
  "drizzle/0001_free_domino.sql",
  "lib/network.ts",
  "app/api/network/route.ts",
  "app/api/network/checks/route.ts",
  "app/api/network/observations/route.ts",
  "components/mention-network.tsx",
];

function fail(message) {
  throw new Error(message);
}

function sourceCheck() {
  const missing = required.filter((file) => !existsSync(path.join(root, file)));
  if (missing.length) fail(`missing network files: ${missing.join(", ")}`);
  const schema = readFileSync(path.join(root, "db/schema.ts"), "utf8");
  const network = readFileSync(path.join(root, "lib/network.ts"), "utf8");
  const page = readFileSync(path.join(root, "components/mention-network.tsx"), "utf8");
  const checks = [
    [schema.includes('sqliteTable("member_checks"'), "member_checks schema"],
    [schema.includes('sqliteTable("mention_observations"'), "mention_observations schema"],
    [schema.includes("mention_source_target_surface_unique"), "mention uniqueness"],
    [network.includes("normalizeHandle") && network.includes("resolveTargetAccountId"), "exact handle resolver"],
    [network.includes("mutualPairCount") && network.includes("unresolvedCount"), "network aggregation"],
    [page.includes("Directional Okenation member mention network") && page.includes("Record member check") && page.includes("Record a mention"), "network UI contract"],
  ];
  const failed = checks.filter(([ok]) => !ok).map(([, label]) => label);
  if (failed.length) fail(`failed network source checks: ${failed.join(", ")}`);
  console.log("Okenation mention network source verification passed");
}

async function apiCheck() {
  const { buildNetworkData, normalizeHandle, resolveTargetAccountId } = await import(new URL("../lib/network.ts", import.meta.url));
  const accounts = [
    { id: "a", name: "A", handle: "@Alpha", profileUrl: null },
    { id: "b", name: "B", handle: "@beta", profileUrl: null },
    { id: "c", name: "C", handle: "@charlie", profileUrl: null },
  ];
  if (normalizeHandle(" @Alpha, ") !== "alpha") fail("handle normalization failed");
  if (resolveTargetAccountId("@BETA", accounts) !== "b") fail("exact handle resolution failed");
  const network = buildNetworkData(accounts, [
    { id: 1, accountId: "a", platform: "tiktok", sourceUrl: null, checkedAt: "2026-09-22T00:00:00.000Z", surfacesChecked: ["caption"], result: "mentions_found", note: "" },
    { id: 2, accountId: "b", platform: "urlebird", sourceUrl: null, checkedAt: "2026-09-22T00:01:00.000Z", surfacesChecked: ["caption"], result: "none_visible", note: "" },
  ], [
    { id: 1, sourceAccountId: "a", targetAccountId: "b", targetHandle: "@beta", sourceUrl: "https://example.com/1", platform: "tiktok", surface: "caption", evidenceText: "@beta", capturedAt: "2026-09-22T00:00:00.000Z" },
    { id: 2, sourceAccountId: "b", targetAccountId: "a", targetHandle: "@alpha", sourceUrl: "https://example.com/2", platform: "urlebird", surface: "bio", evidenceText: "@alpha", capturedAt: "2026-09-22T00:02:00.000Z" },
    { id: 3, sourceAccountId: "a", targetAccountId: null, targetHandle: "@unknown", sourceUrl: "https://example.com/3", platform: "tiktok", surface: "comment", evidenceText: "@unknown", capturedAt: "2026-09-22T00:03:00.000Z" },
  ]);
  if (network.nodes.length !== 3 || network.edges.length !== 2) fail("network node or edge aggregation failed");
  if (network.summary.mutualPairCount !== 1 || network.summary.unresolvedCount !== 1) fail("mutual or unresolved aggregation failed");
  if (network.nodes.find((node) => node.id === "c")?.status !== "not_checked") fail("isolated node state failed");
  const observationRoute = readFileSync(path.join(root, "app/api/network/observations/route.ts"), "utf8");
  const checkRoute = readFileSync(path.join(root, "app/api/network/checks/route.ts"), "utf8");
  if (!observationRoute.includes("getChatGPTUser") || !checkRoute.includes("getChatGPTUser") || !observationRoute.includes("status: 401") || !checkRoute.includes("status: 401")) fail("anonymous write protection is missing");
  console.log("Okenation mention network API verification passed");
}

if (process.argv.includes("--source")) sourceCheck();
if (process.argv.includes("--api")) await apiCheck();
if (!process.argv.includes("--source") && !process.argv.includes("--api")) {
  sourceCheck();
  await apiCheck();
}
