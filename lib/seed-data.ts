import { buildNetworkData, type MemberCheck, type MentionObservation, type NetworkData } from "./network";

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

export const demoMemberChecks: MemberCheck[] = [];
export const demoMentionObservations: MentionObservation[] = [];
export const demoNetwork: NetworkData = buildNetworkData(demoAccounts, demoMemberChecks, demoMentionObservations);

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
  {
    id: "urlebird-may-2026-09-21",
    accountId: "may",
    capturedAt: "2026-09-21T10:54:20+08:00",
    followers: 758,
    following: 254,
    likes: 10090,
    posts: 145,
    source: "Urlebird manual observation",
    evidenceNote: "Visible Urlebird profile totals captured on 21 Sep 2026 10:54 MYT. Third-party mirror; values may lag TikTok.",
  },
  {
    id: "urlebird-broken-2026-09-21",
    accountId: "broken",
    capturedAt: "2026-09-21T10:54:20+08:00",
    followers: 2130,
    following: 286,
    likes: 7550,
    posts: 453,
    source: "Urlebird manual observation",
    evidenceNote: "Visible Urlebird profile totals captured on 21 Sep 2026 10:54 MYT. Third-party mirror; values may lag TikTok.",
  },
  {
    id: "urlebird-nara-2026-09-21",
    accountId: "nara",
    capturedAt: "2026-09-21T10:54:20+08:00",
    followers: 1260,
    following: 218,
    likes: 11240,
    posts: 179,
    source: "Urlebird manual observation",
    evidenceNote: "Visible Urlebird profile totals captured on 21 Sep 2026 10:54 MYT. Third-party mirror; values may lag TikTok.",
  },
  {
    id: "urlebird-kuro-2026-09-21",
    accountId: "kuro",
    capturedAt: "2026-09-21T10:54:20+08:00",
    followers: 2820,
    following: 21,
    likes: 26340,
    posts: 53,
    source: "Urlebird manual observation",
    evidenceNote: "Visible Urlebird profile totals captured on 21 Sep 2026 10:54 MYT. Third-party mirror; values may lag TikTok.",
  },
  {
    id: "urlebird-ailee-2026-09-21",
    accountId: "ailee",
    capturedAt: "2026-09-21T10:54:20+08:00",
    followers: 4430,
    following: 0,
    likes: 25960,
    posts: 0,
    source: "Urlebird manual observation",
    evidenceNote: "Visible Urlebird profile totals captured on 21 Sep 2026 10:54 MYT. Third-party mirror; values may lag TikTok.",
  },
  {
    id: "urlebird-adam-2026-09-21",
    accountId: "adam",
    capturedAt: "2026-09-21T10:54:20+08:00",
    followers: 63,
    following: 0,
    likes: 437,
    posts: 0,
    source: "Urlebird manual observation",
    evidenceNote: "Visible Urlebird profile totals captured on 21 Sep 2026 10:54 MYT. Third-party mirror; values may lag TikTok.",
  },
  {
    id: "urlebird-naila-2026-09-21",
    accountId: "naila",
    capturedAt: "2026-09-21T10:54:20+08:00",
    followers: 2580,
    following: 0,
    likes: 100200,
    posts: 0,
    source: "Urlebird manual observation",
    evidenceNote: "Visible Urlebird profile totals captured on 21 Sep 2026 10:54 MYT. Third-party mirror; values may lag TikTok.",
  },
  {
    id: "urlebird-aurea-2026-09-21",
    accountId: "aurea",
    capturedAt: "2026-09-21T10:54:20+08:00",
    followers: 6590,
    following: 0,
    likes: 202220,
    posts: 0,
    source: "Urlebird manual observation",
    evidenceNote: "Visible Urlebird profile totals captured on 21 Sep 2026 10:54 MYT. Third-party mirror; values may lag TikTok.",
  },
  {
    id: "urlebird-syasya-2026-09-21",
    accountId: "syasya",
    capturedAt: "2026-09-21T10:54:20+08:00",
    followers: 1760,
    following: 27,
    likes: 41050,
    posts: 385,
    source: "Urlebird manual observation",
    evidenceNote: "Visible Urlebird profile totals captured on 21 Sep 2026 10:54 MYT. Third-party mirror; values may lag TikTok.",
  },
  {
    id: "urlebird-reen-2026-09-21",
    accountId: "reen",
    capturedAt: "2026-09-21T10:54:20+08:00",
    followers: 1720,
    following: 0,
    likes: 3520,
    posts: 0,
    source: "Urlebird manual observation",
    evidenceNote: "Visible Urlebird profile totals captured on 21 Sep 2026 10:54 MYT. Third-party mirror; values may lag TikTok.",
  },
  {
    id: "urlebird-mira-2026-09-21",
    accountId: "mira",
    capturedAt: "2026-09-21T10:54:20+08:00",
    followers: 366,
    following: 0,
    likes: 2170,
    posts: 0,
    source: "Urlebird manual observation",
    evidenceNote: "Visible Urlebird profile totals captured on 21 Sep 2026 10:54 MYT. Third-party mirror; values may lag TikTok.",
  },
  {
    id: "urlebird-eriqa-2026-09-21",
    accountId: "eriqa",
    capturedAt: "2026-09-21T10:54:20+08:00",
    followers: 455,
    following: 0,
    likes: 2060,
    posts: 0,
    source: "Urlebird manual observation",
    evidenceNote: "Visible Urlebird profile totals captured on 21 Sep 2026 10:54 MYT. Third-party mirror; values may lag TikTok.",
  },
  {
    id: "urlebird-paparay-2026-09-21",
    accountId: "paparay",
    capturedAt: "2026-09-21T10:54:20+08:00",
    followers: 1790,
    following: 4310,
    likes: 18470,
    posts: 386,
    source: "Urlebird manual observation",
    evidenceNote: "Visible Urlebird profile totals captured on 21 Sep 2026 10:54 MYT. Third-party mirror; values may lag TikTok.",
  },
  {
    id: "urlebird-aurora-2026-09-21",
    accountId: "aurora",
    capturedAt: "2026-09-21T10:54:20+08:00",
    followers: 3490,
    following: 4040,
    likes: 3320,
    posts: 44,
    source: "Urlebird manual observation",
    evidenceNote: "Visible Urlebird profile totals captured on 21 Sep 2026 10:54 MYT. Third-party mirror; values may lag TikTok.",
  },
  {
    id: "live-may-2026-10-03",
    accountId: "may",
    capturedAt: "2026-10-03T12:00:00+08:00",
    followers: 1179,
    following: 262,
    likes: 14200,
    posts: 156,
    source: "OpenMuse live profile observation",
    evidenceNote: "Visible profile totals captured live via OpenMuse on 03 Oct 2026. Follower count crossed 1.17K with 156 published videos.",
  },
  {
    id: "live-nara-2026-10-03",
    accountId: "nara",
    capturedAt: "2026-10-03T12:00:00+08:00",
    followers: 1271,
    following: 229,
    likes: 12000,
    posts: 179,
    source: "OpenMuse live profile observation",
    evidenceNote: "Visible profile totals captured live via OpenMuse on 03 Oct 2026.",
  },
  {
    id: "live-kuro-2026-10-03",
    accountId: "kuro",
    capturedAt: "2026-10-03T12:00:00+08:00",
    followers: 5646,
    following: 23,
    likes: 107300,
    posts: 53,
    source: "OpenMuse live profile observation",
    evidenceNote: "Visible profile totals captured live via OpenMuse on 03 Oct 2026. Major growth to 5.6K followers and 107K likes.",
  },
  {
    id: "live-ailee-2026-10-03",
    accountId: "ailee",
    capturedAt: "2026-10-03T12:00:00+08:00",
    followers: 4817,
    following: 32,
    likes: 27400,
    posts: 0,
    source: "OpenMuse live profile observation",
    evidenceNote: "Visible profile totals captured live via OpenMuse on 03 Oct 2026.",
  },
  {
    id: "live-adam-2026-10-03",
    accountId: "adam",
    capturedAt: "2026-10-03T12:00:00+08:00",
    followers: 103,
    following: 23,
    likes: 781,
    posts: 0,
    source: "OpenMuse live profile observation",
    evidenceNote: "Visible profile totals captured live via OpenMuse on 03 Oct 2026.",
  },
  {
    id: "live-naila-2026-10-03",
    accountId: "naila",
    capturedAt: "2026-10-03T12:00:00+08:00",
    followers: 4185,
    following: 74,
    likes: 153500,
    posts: 0,
    source: "OpenMuse live profile observation",
    evidenceNote: "Visible profile totals captured live via OpenMuse on 03 Oct 2026. Substantial engagement with 153.5K likes.",
  },
  {
    id: "live-aurea-2026-10-03",
    accountId: "aurea",
    capturedAt: "2026-10-03T12:00:00+08:00",
    followers: 9429,
    following: 86,
    likes: 258100,
    posts: 0,
    source: "OpenMuse live profile observation",
    evidenceNote: "Visible profile totals captured live via OpenMuse on 03 Oct 2026. Leading roster scale with 9.4K followers and 258K likes.",
  },
  {
    id: "live-syasya-2026-10-03",
    accountId: "syasya",
    capturedAt: "2026-10-03T12:00:00+08:00",
    followers: 5137,
    following: 29,
    likes: 109000,
    posts: 385,
    source: "OpenMuse live profile observation",
    evidenceNote: "Visible profile totals captured live via OpenMuse on 03 Oct 2026. Reached 5.1K followers and 109K likes across 385 videos.",
  },
  {
    id: "live-reen-2026-10-03",
    accountId: "reen",
    capturedAt: "2026-10-03T12:00:00+08:00",
    followers: 1981,
    following: 328,
    likes: 4944,
    posts: 0,
    source: "OpenMuse live profile observation",
    evidenceNote: "Visible profile totals captured live via OpenMuse on 03 Oct 2026.",
  },
  {
    id: "live-mira-2026-10-03",
    accountId: "mira",
    capturedAt: "2026-10-03T12:00:00+08:00",
    followers: 535,
    following: 687,
    likes: 3026,
    posts: 0,
    source: "OpenMuse live profile observation",
    evidenceNote: "Visible profile totals captured live via OpenMuse on 03 Oct 2026.",
  },
  {
    id: "live-eriqa-2026-10-03",
    accountId: "eriqa",
    capturedAt: "2026-10-03T12:00:00+08:00",
    followers: 518,
    following: 99,
    likes: 2477,
    posts: 0,
    source: "OpenMuse live profile observation",
    evidenceNote: "Visible profile totals captured live via OpenMuse on 03 Oct 2026.",
  },
  {
    id: "live-paparay-2026-10-03",
    accountId: "paparay",
    capturedAt: "2026-10-03T12:00:00+08:00",
    followers: 1810,
    following: 4342,
    likes: 18900,
    posts: 386,
    source: "OpenMuse live profile observation",
    evidenceNote: "Visible profile totals captured live via OpenMuse on 03 Oct 2026.",
  },
  {
    id: "live-aurora-2026-10-03",
    accountId: "aurora",
    capturedAt: "2026-10-03T12:00:00+08:00",
    followers: 3487,
    following: 4053,
    likes: 3326,
    posts: 44,
    source: "OpenMuse live profile observation",
    evidenceNote: "Visible profile totals captured live via OpenMuse on 03 Oct 2026.",
  },
];

export const demoPosts: PostSignal[] = [
  { id: "7688523910845129001", accountId: "may", views: 56020, pinned: false, classification: "recent viral peak" },
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
  refreshAttempt: "03 Oct 2026: visible public profiles were observed live via OpenMuse and Laya. 14 of 16 roster entries have timestamped observations; @zeros000002 was not found there and Butler has no supplied handle.",
  storage: "fallback",
  storageMessage: "Saved snapshots are read from the Site database; third-party Urlebird observations remain labelled by source and capture time.",
};
