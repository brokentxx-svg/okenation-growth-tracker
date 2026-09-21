const url = "https://okenation-growth-room.aasf012.chatgpt.site/api/dashboard";
const observedAccounts = ["may", "broken", "nara", "kuro", "ailee", "adam", "naila", "aurea", "syasya", "reen", "mira", "eriqa", "paparay", "aurora"];
const response = await fetch(`${url}?coverage_check=${Date.now()}`, { cache: "no-store" });
if (!response.ok) throw new Error(`Dashboard API returned HTTP ${response.status}`);
const data = await response.json();
const snapshotAccounts = new Set(data.snapshots.map((snapshot) => snapshot.accountId));
const missing = observedAccounts.filter((accountId) => !snapshotAccounts.has(accountId));
if (data.accounts.length !== 16) throw new Error(`Expected 16 accounts, got ${data.accounts.length}`);
if (missing.length) throw new Error(`Public dashboard is missing snapshots for: ${missing.join(", ")}`);
if (!data.refreshAttempt.includes("@zeros000002") || !data.refreshAttempt.includes("Butler")) throw new Error("Unresolved public-source boundary is missing");

console.log(`Okenation public coverage verification passed: ${observedAccounts.length}/16 accounts with observations; 2 unresolved.`);
