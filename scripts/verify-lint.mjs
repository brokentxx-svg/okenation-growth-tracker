import { spawnSync } from "node:child_process";

const windows = process.platform === "win32";
const command = windows ? (process.env.ComSpec ?? "cmd.exe") : "npm";
const args = windows ? ["/d", "/s", "/c", "npm run lint"] : ["run", "lint"];
const result = spawnSync(command, args, { stdio: "inherit", shell: false });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
console.log("Okenation lint verification passed");
