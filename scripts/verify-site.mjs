import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "app/page.tsx",
  "app/layout.tsx",
  "app/globals.css",
  "app/api/dashboard/route.ts",
  "app/api/snapshots/route.ts",
  "app/api/network/route.ts",
  "app/api/network/checks/route.ts",
  "app/api/network/observations/route.ts",
  "components/mention-network.tsx",
  "db/schema.ts",
  "lib/network.ts",
  "lib/seed-data.ts",
  "public/favicon.svg",
  ".openai/hosting.json",
];
const missing = required.filter((file) => !existsSync(path.join(root, file)));
if (missing.length) throw new Error(`missing required files: ${missing.join(", ")}`);

const page = readFileSync(path.join(root, "app/page.tsx"), "utf8");
const schema = readFileSync(path.join(root, "db/schema.ts"), "utf8");
const css = readFileSync(path.join(root, "app/globals.css"), "utf8");
const manifest = JSON.parse(readFileSync(path.join(root, ".openai/hosting.json"), "utf8"));
const checks = [
  [page.includes("Okenation / daily read"), "dashboard identity"],
  [page.includes("/api/dashboard"), "live-ready dashboard data"],
  [page.includes("AllMembersGraph"), "unified all-members telemetry graph"],
  [!page.includes("signal-panel") && !page.includes("ideas-panel"), "clean layout without removed panels"],
  [page.includes("Unknown stays unknown") || page.includes("classification unknown"), "evidence boundary"],
  [schema.includes('sqliteTable("accounts"') && schema.includes('sqliteTable("snapshots"') && schema.includes('sqliteTable("member_checks"') && schema.includes('sqliteTable("mention_observations"'), "D1 schema"],
  [css.includes("--gold") && css.includes("@media (max-width: 760px)"), "responsive visual system"],
  [manifest.project_id && manifest.d1 === "DB", "Sites manifest"],
  [!page.includes("Your site is taking shape"), "starter placeholder removed"],
];
const failed = checks.filter(([ok]) => !ok).map(([, label]) => label);
if (failed.length) throw new Error(`failed checks: ${failed.join(", ")}`);
console.log("Okenation tracker source verification passed");
