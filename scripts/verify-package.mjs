import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const manifest = path.join(dist, ".openai", "hosting.json");
const worker = path.join(dist, "server", "index.js");
const staticEntry = path.join(dist, "index.html");
const clientEntry = path.join(dist, "client", "index.html");
if (!existsSync(manifest)) throw new Error("dist/.openai/hosting.json is missing");
if (!existsSync(worker) && !existsSync(staticEntry) && !existsSync(clientEntry)) throw new Error("no supported Sites entrypoint found in dist");
const parsed = JSON.parse(readFileSync(manifest, "utf8"));
if (parsed.d1 !== "DB") throw new Error("packaged manifest does not declare DB");
console.log("Okenation tracker package verification passed");
