# Gates: Okenation growth tracker

OWNS: app/**, db/**, public/**, scripts/**, .openai/**, package.json, package-lock.json, next.config.*

Scope: Complete the public Okenation growth dashboard with durable, evidence-labelled member snapshots, evidence-bounded comparisons, improvement summaries, video ideas, and a verified Sites deployment.

- [x] G1: Source contract is complete and contains the dashboard, API routes, schema, metadata, and favicon.
  CHECK: node scripts/verify-site.mjs
  EXPECT: Okenation tracker source verification passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\Oken\Documents\Socials Med\work\okenation-growth-tracker-20260921; path=429797028ae0/37 entries; output=Okenation tracker source verification passed

- [x] G2: The successful production build output contains the declared D1-backed Worker and migration assets.
  CHECK: node scripts/verify-build.mjs
  EXPECT: Okenation tracker build output verification passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\Oken\Documents\Socials Med\work\okenation-growth-tracker-20260921; path=429797028ae0/37 entries; output=Okenation tracker build output verification passed

- [x] G3: Packaged output contains the hosting manifest, Worker entrypoint, and static assets required by Sites.
  CHECK: node scripts/verify-package.mjs
  EXPECT: Okenation tracker package verification passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\Oken\Documents\Socials Med\work\okenation-growth-tracker-20260921; path=429797028ae0/37 entries; output=Okenation tracker package verification passed

- [x] G4: First viewport is a working public tracker; source labels, Urlebird manual fallback, unavailable live refresh, snapshot entry, and responsive controls are understandable and usable.
  EVIDENCE: public browser DOM confirmed Okenation Growth Room, 14 observed · 2 unresolved, visible Urlebird observation labels and UB links, explicit No Urlebird profile and No handle supplied boundaries, refresh boundary, and the snapshot form; no Awaiting text remained.

- [x] G5: Published Site deployment reports success, returns a production URL, and preserves public access.
  EVIDENCE: Sites publish status=succeeded; URL=https://okenation-growth-room.aasf012.chatgpt.site; latest version=5; get_site access_mode=public and status=active.

- [x] G6: Source contains timestamped Urlebird observations for every account with a resolvable public mirror and explicitly records the two unresolved accounts.
  CHECK: node scripts/verify-coverage-source.mjs
  EXPECT: Okenation source coverage verification passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\Oken\Documents\Socials Med\work\okenation-growth-tracker-20260921; path=429797028ae0/37 entries; output=Okenation source coverage verification passed: 14 Urlebird observations; 2 unresolved.

- [x] G7: The deployed public dashboard exposes the imported observations and reports the unresolved accounts instead of silently presenting them as measured.
  CHECK: node scripts/verify-public-coverage.mjs
  EXPECT: Okenation public coverage verification passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\Oken\Documents\Socials Med\work\okenation-growth-tracker-20260921; path=429797028ae0/37 entries; output=Okenation public coverage verification passed: 14/16 accounts with observations; 2 unresolved.

- [x] G8: The mention-network schema, resolver rules, fixtures, and fallback contract are present and valid.
  CHECK: node scripts/verify-network.mjs --source
  EXPECT: Okenation mention network source verification passed
  EVIDENCE: exit=0; cwd=C:\Users\Oken\Documents\Socials Med\work\okenation-growth-tracker-20260921; output=Okenation mention network source verification passed

- [x] G9: The public network API returns all working-roster nodes, aggregates directional observations, and rejects anonymous writes.
  CHECK: node --experimental-strip-types scripts/verify-network.mjs --api
  EXPECT: Okenation mention network API verification passed
  EVIDENCE: exit=0; cwd=C:\Users\Oken\Documents\Socials Med\work\okenation-growth-tracker-20260921; output=Okenation mention network API verification passed; local GET=200 with memberCount=16 and anonymous POST=401; authenticated local check and observation POSTs=201; database aggregate=1 edge, 1 observation

- [x] G10: The public dashboard renders the network graph, scan checklist, evidence list, filters, and manual capture controls without removing the existing growth surface.
  CHECK: node scripts/verify-site.mjs
  EXPECT: Okenation tracker source verification passed
  EVIDENCE: exit=0; cwd=C:\Users\Oken\Documents\Socials Med\work\okenation-growth-tracker-20260921; output=Okenation tracker source verification passed; browser DOM showed 16 graph nodes, 16 checklist cards, filters, evidence empty state, and both capture forms

- [x] G11: The application passes lint and production build verification after the network change.
  CHECK: node scripts/verify-lint.mjs
  EXPECT: Okenation lint verification passed
  EVIDENCE: exit=0; cwd=C:\Users\Oken\Documents\Socials Med\work\okenation-growth-tracker-20260921; output=Okenation lint verification passed

- [x] G12: The built/package output contains the network routes and updated D1 migration assets.
  CHECK: node scripts/verify-build.mjs
  EXPECT: Okenation tracker build output verification passed
  EVIDENCE: exit=0; cwd=C:\Users\Oken\Documents\Socials Med\work\okenation-growth-tracker-20260921; output=Okenation tracker build output verification passed; verify-package.mjs also passed

- [ ] G13: The deployed public Site exposes all 16 network nodes and preserves the source/evidence boundary.
  EVIDENCE:
