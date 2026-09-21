# Gates: Okenation growth tracker

OWNS: app/**, db/**, public/**, scripts/**, .openai/**, package.json, package-lock.json, next.config.*

Scope: Complete the private Okenation growth dashboard with durable metric snapshots, evidence-bounded comparisons, improvement summaries, video ideas, and a verified Sites deployment.

- [x] G1: Source contract is complete and contains the dashboard, API routes, schema, metadata, and favicon.
  CHECK: node scripts/verify-site.mjs
  EXPECT: Okenation tracker source verification passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\Oken\Documents\Socials Med\work\okenation-growth-tracker-20260921; path=429797028ae0/37 entries; output=Okenation tracker source verification passed

- [ ] G2: Production build completes with the declared D1-backed Worker output.
  CHECK: node C:/Users/Oken/.codex/plugins/cache/openai-curated-remote/sites/0.1.65/scripts/build-site.mjs
  EXPECT: build completed successfully
  EVIDENCE: pending

- [ ] G3: Packaged output contains the hosting manifest, Worker entrypoint, and static assets required by Sites.
  CHECK: node scripts/verify-package.mjs
  EXPECT: Okenation tracker package verification passed
  EVIDENCE: pending

- [ ] G4: First viewport is a working tracker, not a marketing placeholder; source labels and unavailable live refresh are understandable; snapshot entry and responsive controls are usable.
  EVIDENCE: pending manual review from the rendered preview and final deployment.

- [ ] G5: Published Site deployment reports success and returns a production URL.
  EVIDENCE: pending Sites deployment response and status check.
