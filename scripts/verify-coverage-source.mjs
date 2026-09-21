import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../lib/seed-data.ts", import.meta.url), "utf8");
const observedAccounts = ["may", "broken", "nara", "kuro", "ailee", "adam", "naila", "aurea", "syasya", "reen", "mira", "eriqa", "paparay", "aurora"];
const missing = observedAccounts.filter((accountId) => {
  const marker = `id: "urlebird-${accountId}-2026-09-21"`;
  const start = source.indexOf(marker);
  if (start < 0) return true;
  const block = source.slice(start, source.indexOf("\n  },", start));
  return !block.includes(`accountId: "${accountId}"`) || !block.includes('source: "Urlebird manual observation"');
});

if (missing.length) throw new Error(`Missing Urlebird source entries: ${missing.join(", ")}`);
if (!source.includes("@zeros000002 was not found there")) throw new Error("Shion unresolved-source note is missing");
if (!source.includes("Butler has no supplied handle")) throw new Error("Butler unresolved-source note is missing");

console.log(`Okenation source coverage verification passed: ${observedAccounts.length} Urlebird observations; 2 unresolved.`);
