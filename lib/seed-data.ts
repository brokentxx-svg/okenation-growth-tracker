export type Account = {
  id: string;
  name: string;
  handle: string | null;
  profileUrl: string | null;
  role: string;
  status: string;
};

export type Snapshot = {
  id: number | string;
  accountId: string;
  capturedAt: string;
  followers: number | null;
  following: number | null;
  likes: number | null;
  posts: number | null;
  source: string;
  evidenceNote: string;
};

export type PostSignal = {
  id: string;
  accountId: string;
  views: number;
  pinned: boolean;
  classification: string;
};

export type VideoIdea = {
  title: string;
  tag: string;
  rationale: string;
};

export type DashboardData = {
  accounts: Account[];
  snapshots: Snapshot[];
  posts: PostSignal[];
  ideas: VideoIdea[];
  refreshAttempt: string;
  storage?: "database" | "fallback";
  storageMessage?: string;
};

export const demoAccounts: Account[] = [
  { id: "may", name: "May", handle: "@may_brokentx", profileUrl: "https://www.tiktok.com/@may_brokentx", role: "lead account", status: "active" },
  { id: "broken", name: "Broken / Oken", handle: "@brokentx", profileUrl: "https://www.tiktok.com/@brokentx", role: "human centre", status: "active" },
  { id: "nara", name: "Nara / Aisyah", handle: "@ai.aisyahinara", profileUrl: "https://www.tiktok.com/@ai.aisyahinara", role: "member", status: "active" },
  { id: "shion", name: "Shion / Zeros", handle: "@zeros000002", profileUrl: "https://www.tiktok.com/@zeros000002", role: "member", status: "active" },
  { id: "kuro", name: "Kuro", handle: "@renjikuro1", profileUrl: "https://www.tiktok.com/@renjikuro1", role: "member", status: "active" },
  { id: "ailee", name: "Ailee Alfeera", handle: "@ailee.alfeera", profileUrl: "https://www.tiktok.com/@ailee.alfeera", role: "member", status: "active" },
  { id: "adam", name: "Adam", handle: "@adam.fareeq2", profileUrl: "https://www.tiktok.com/@adam.fareeq2", role: "member", status: "active" },
  { id: "naila", name: "Naila / Nayla / Wawa Noor", handle: "@wawanoor.ai", profileUrl: "https://www.tiktok.com/@wawanoor.ai", role: "member", status: "active" },
  { id: "aurea", name: "Aurea", handle: "@aurea_is", profileUrl: "https://www.tiktok.com/@aurea_is", role: "member", status: "active" },
  { id: "syasya", name: "Syasya Izzati", handle: "@ai_syasy4", profileUrl: "https://www.tiktok.com/@ai_syasy4", role: "member", status: "active" },
  { id: "reen", name: "Reen", handle: "@zareenqisya", profileUrl: "https://www.tiktok.com/@zareenqisya", role: "member", status: "active" },
  { id: "mira", name: "MiraAI", handle: "@hey.its.mirai", profileUrl: "https://www.tiktok.com/@hey.its.mirai", role: "member", status: "active" },
  { id: "eriqa", name: "Eriqa", handle: "@nureriqaaulia88", profileUrl: "https://www.tiktok.com/@nureriqaaulia88", role: "member", status: "active" },
  { id: "paparay", name: "PapaRay", handle: "@mantaray83", profileUrl: "https://www.tiktok.com/@mantaray83", role: "member", status: "active" },
  { id: "aurora", name: "Aurora", handle: "@putradawson", profileUrl: "https://www.tiktok.com/@putradawson", role: "member", status: "active" },
  { id: "butler", name: "Butler", handle: null, profileUrl: null, role: "member", status: "active" },
];

export const demoSnapshots: Snapshot[] = [
  {
    id: "baseline-may-2026-08-17",
    accountId: "may",
    capturedAt: "2026-08-17T21:00:00+08:00",
    followers: 258,
    following: 230,
    likes: 1130,
    posts: null,
    source: "signed-in profile observation",
    evidenceNote: "Displayed May profile totals captured on 17 Aug 2026. Post count was not captured.",
  },
  {
    id: "latest-may-2026-09-11",
    accountId: "may",
    capturedAt: "2026-09-11T21:36:19+08:00",
    followers: 661,
    following: 250,
    likes: 7215,
    posts: null,
    source: "signed-in profile observation",
    evidenceNote: "Profile displayed May / @may_brokentx. 27 visible post cards were observed; retention, comments, attribution and paid status remain unknown.",
  },
];

export const demoPosts: PostSignal[] = [
  { id: "7681448253946170645", accountId: "may", views: 88500, pinned: false, classification: "unknown" },
  { id: "7682176178433690900", accountId: "may", views: 45000, pinned: false, classification: "unknown" },
  { id: "7681670267680148756", accountId: "may", views: 8425, pinned: false, classification: "unknown" },
  { id: "7683155997136784661", accountId: "may", views: 7081, pinned: false, classification: "excluded by owner working rule" },
  { id: "7682511010825129236", accountId: "may", views: 4128, pinned: false, classification: "excluded by owner working rule" },
  { id: "7680475705318133012", accountId: "may", views: 970, pinned: true, classification: "under threshold; status unknown" },
  { id: "7683278326097513749", accountId: "may", views: 929, pinned: false, classification: "under threshold; status unknown" },
];

export const demoIdeas: VideoIdea[] = [
  { title: "One ordinary problem, one absurd Okenation escalation", tag: "collab loop", rationale: "Put May and one member in the same recognisable Malaysian situation, then let the relationship—not a generic topic—create the turn." },
  { title: "Reward the viewer who remembers", tag: "return trigger", rationale: "Bring back one phrase, prop or tiny rule from an earlier post and make the callback change the scene." },
  { title: "A single-camera handoff between characters", tag: "world proof", rationale: "End May's beat with a concrete unfinished action, then hand that same action to Nara, Shion or another member so the shared world is immediately legible." },
];

export const demoDashboard: DashboardData = {
  accounts: demoAccounts,
  snapshots: demoSnapshots,
  posts: demoPosts,
  ideas: demoIdeas,
  refreshAttempt: "20 Sep 2026: refresh was attempted, but no accessible signed-in TikTok tab was available; no new figures were verified.",
  storage: "fallback",
  storageMessage: "This view is seeded from the latest verified Okenation records. Save a snapshot to begin durable tracking.",
};
