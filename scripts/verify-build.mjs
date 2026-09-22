import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "dist/server/index.js",
  "dist/client",
  "dist/.openai/hosting.json",
  "dist/.openai/drizzle/0000_romantic_ghost_rider.sql",
  "dist/.openai/drizzle/0001_free_domino.sql",
];
const missing = required.filter((file) => !existsSync(path.join(root, file)));
if (missing.length) throw new Error(`missing built output: ${missing.join(", ")}`);
const manifest = JSON.parse(readFileSync(path.join(root, "dist/.openai/hosting.json"), "utf8"));
if (manifest.project_id !== "appgprj_6ab0830f46808191ab1bab15e3bcf882" || manifest.d1 !== "DB") {
  throw new Error("built hosting manifest does not match the registered Site");
}
console.log("Okenation tracker build output verification passed");
