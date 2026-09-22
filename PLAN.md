# Okenation Growth Tracker plan

## Objective

Build a private, responsive Okenation growth workspace that shows the latest verified account snapshot, compares historical movement, gives a short evidence-bounded improvement summary, and proposes the next video ideas.

## Scope

- One primary dashboard route for the working surface.
- Durable D1 storage for accounts and metric snapshots.
- Seeded fallback data from the latest verified Okenation records so the first view is useful before a live refresh is available.
- Snapshot entry for current TikTok figures, followed by automatic dashboard refresh.
- Clear freshness and evidence labels; no claim of direct TikTok API realtime access.
- Compact video-idea suggestions driven by the stored performance signals and Okenation character roster.
- Responsive layout, keyboard-usable controls, site-specific favicon, and private Sites deployment.

## Data contract

- `accounts`: stable id, display name, handle, profile URL, role, and status.
- `snapshots`: account id, captured timestamp, followers, following, likes, post count, source label, and evidence note.
- UI computes deltas only between dated snapshots for the same account.
- Unknown or unavailable metrics remain unknown; the UI never converts missing data to zero.

## Visual thesis

An evidence room for a living creator world: charcoal and ink surfaces, warm gold Okenation accents, high-signal metric cards, and a quiet electric-blue freshness marker. Dense enough for daily decisions, calm enough to read quickly.

## Verification contract

- Site source is complete enough to recognize the Okenation tracker on first render.
- The build succeeds and contains the declared D1 schema and Worker entrypoint.
- Dashboard data, comparisons, evidence labels, snapshot entry, and suggestions render without fabricated live metrics.
- Final source is packaged from the pushed commit and deployment status succeeds.

## Mention network implementation tree

- [ ] Root: freeze the exact-handle mention contract and current 16-account working roster.
  - [ ] Leaf A: add D1 tables, migration, types, fallback fixtures, and resolver self-checks.
  - [ ] Leaf B: add public read API plus authenticated manual check/observation writes.
  - [ ] Leaf C: add graph, checklist, evidence list, filters, and accessible mobile fallback.
  - [ ] Leaf D: run source, API, lint, build, package, and public deployment verification.

Dependencies: A unblocks B; A and B unblock C; A/B/C unblock D. No automated crawler or paid analytics dependency is in scope.
