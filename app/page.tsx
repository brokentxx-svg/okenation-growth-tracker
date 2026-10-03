"use client";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Clock3,
  DatabaseZap,
  ExternalLink,
  Lightbulb,
  RefreshCw,
  UsersRound,
  Video,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { MentionNetwork } from "../components/mention-network";
import { demoDashboard, demoNetwork, type Account, type DashboardData, type Snapshot } from "../lib/seed-data";
import type { NetworkData } from "../lib/network";

type WebToolContext = {
  registerTool: (tool: {
    name: string;
    title: string;
    description: string;
    inputSchema: Record<string, unknown>;
    annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
    execute: (input: unknown) => Promise<unknown>;
  }, options?: { signal?: AbortSignal }) => void | Promise<void>;
};

function formatCount(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-MY", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatExact(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-MY").format(value);
}

function formatDelta(value: number | null) {
  if (value === null) return "No baseline";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatCount(value)}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date(value));
}

function urlebirdUrl(account: Account) {
  return account.handle ? `https://urlebird.com/user/${encodeURIComponent(account.handle.replace(/^@/, ""))}/` : null;
}

function latestSnapshot(accountId: string, snapshots: Snapshot[]) {
  return [...snapshots]
    .filter((snapshot) => snapshot.accountId === accountId)
    .sort((a, b) => +new Date(b.capturedAt) - +new Date(a.capturedAt))[0] ?? null;
}

function previousSnapshot(accountId: string, snapshots: Snapshot[]) {
  return [...snapshots]
    .filter((snapshot) => snapshot.accountId === accountId)
    .sort((a, b) => +new Date(b.capturedAt) - +new Date(a.capturedAt))[1] ?? null;
}

function metricDelta(latest: Snapshot | null, previous: Snapshot | null, key: "followers" | "likes") {
  if (!latest || !previous || latest[key] === null || previous[key] === null) return null;
  return latest[key] - previous[key];
}

function initials(name: string) {
  return name.split(/[ /]/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function GrowthChart({ metrics }: { metrics: { label: string; value: number; tone: string }[] }) {
  const max = Math.max(...metrics.map((metric) => metric.value), 1);
  return (
    <div className="chart-wrap">
      <svg className="growth-chart overview-chart" viewBox="0 0 600 210" role="img" aria-label="Okenation overview of followers, sampled video views, and likes">
        {[0, 1, 2, 3, 4].map((tick) => {
          const x = 160 + tick * 75;
          return <g key={tick}><line x1={x} x2={x} y1="20" y2="184" className="chart-grid" /><text x={x} y="202" textAnchor="middle" className="chart-axis-label">{formatCount(Math.round((max * tick) / 4))}</text></g>;
        })}
        {metrics.map((metric, index) => {
          const y = 48 + index * 55;
          const width = (metric.value / max) * 300;
          return <g key={metric.label}><text x="0" y={y + 5} className="chart-metric-label">{metric.label}</text><rect x="160" y={y - 10} width={width} height="19" rx="8" className={`chart-bar ${metric.tone}`} /><text x="480" y={y + 5} className="chart-value">{formatExact(metric.value)}</text></g>;
        })}
      </svg>
    </div>
  );
}

function AccountRow({ account, snapshots }: { account: Account; snapshots: Snapshot[] }) {
  const latest = latestSnapshot(account.id, snapshots);
  const previous = previousSnapshot(account.id, snapshots);
  const delta = metricDelta(latest, previous, "followers");
  const hasData = Boolean(latest);
  const mirrorUrl = urlebirdUrl(account);
  const sourceLabel = latest?.source === "Urlebird manual observation"
    ? "Urlebird observation"
    : hasData
      ? "Verified snapshot"
      : account.id === "shion"
        ? "No Urlebird profile"
        : account.id === "butler"
          ? "No handle supplied"
          : "Awaiting snapshot";
  const followerLabel = hasData ? formatExact(latest?.followers) : sourceLabel === "Awaiting snapshot" ? "Awaiting" : "—";

  return (
    <div className="account-row">
      <div className="account-identity"><span className={`avatar avatar-${account.id}`}>{initials(account.name)}</span><div><div className="account-name-line"><strong>{account.name}</strong>{account.profileUrl && <a className="mini-link" href={account.profileUrl} target="_blank" rel="noreferrer" aria-label={`Open ${account.name} TikTok profile`} title="TikTok profile"><ExternalLink size={12} /></a>}{mirrorUrl && <a className="mini-link" href={mirrorUrl} target="_blank" rel="noreferrer" aria-label={`Open ${account.name} on Urlebird`} title="Manual Urlebird check">UB</a>}</div><span className="handle">{account.handle ?? "Profile not supplied"}</span></div></div>
      <div className="account-number">{followerLabel}</div>
      <div className={`account-change ${delta !== null && delta > 0 ? "positive" : "muted"}`}>{delta !== null ? <ArrowUpRight size={14} /> : null}{formatDelta(delta)}</div>
      <div className="account-status"><span className={`status-dot ${hasData ? "live" : "quiet"}`} />{sourceLabel}</div>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<DashboardData>(demoDashboard);
  const [network, setNetwork] = useState<NetworkData>(demoNetwork);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [snapshotForm, setSnapshotForm] = useState({ accountId: "may", capturedAt: new Date().toISOString().slice(0, 16), followers: "", following: "", likes: "", source: "manual TikTok capture", evidenceNote: "Only enter figures visible at the time of capture." });

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setRefreshing(true);
    try {
      const response = await fetch(`/api/dashboard?ts=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Dashboard refresh unavailable");
      const next = (await response.json()) as DashboardData;
      setData(next);
      if (!quiet) setMessage(next.storage === "database" ? "Dashboard refreshed from saved snapshots." : "Showing verified fallback data; saved storage is not connected yet.");
    } catch {
      if (!quiet) setMessage("Refresh unavailable; keeping the last verified view.");
    } finally {
      if (!quiet) setRefreshing(false);
    }
  }, []);

  const refreshNetwork = useCallback(async () => {
    try {
      const response = await fetch(`/api/network?ts=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Network refresh unavailable");
      setNetwork((await response.json()) as NetworkData);
    } catch {
      // Keep the last verified network view when saved storage is unavailable.
    }
  }, []);

  useEffect(() => {
    const kickoff = window.setTimeout(() => {
      void refresh(true);
      void refreshNetwork();
    }, 0);
    const timer = window.setInterval(() => void refresh(true), 30_000);
    return () => {
      window.clearTimeout(kickoff);
      window.clearInterval(timer);
    };
  }, [refresh, refreshNetwork]);

  useEffect(() => {
    const context = (document as Document & { modelContext?: WebToolContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = async () => {
      try {
        await context.registerTool({
          name: "refresh_okenation_dashboard",
          title: "Refresh Okenation dashboard",
          description: "Read the latest saved Okenation snapshots and update the visible comparison without changing data.",
          inputSchema: { type: "object", properties: {}, additionalProperties: false },
          annotations: { readOnlyHint: true, untrustedContentHint: false },
          async execute() {
            const response = await fetch(`/api/dashboard?ts=${Date.now()}`, { cache: "no-store" });
            if (!response.ok) throw new Error("Dashboard refresh unavailable");
            const next = (await response.json()) as DashboardData;
            setData(next);
            await refreshNetwork();
            return { status: "refreshed", storage: next.storage ?? "fallback", trackedAccounts: next.accounts.filter((account) => next.snapshots.some((snapshot) => snapshot.accountId === account.id)).length };
          },
        }, { signal: lifecycle.signal });
        await context.registerTool({
          name: "record_okenation_snapshot",
          title: "Record Okenation snapshot",
          description: "Save visible TikTok account metrics for one known Okenation member, then update the visible comparison.",
          inputSchema: {
            type: "object",
            properties: {
              accountId: { type: "string", description: "Known Okenation account id, such as may or nara." },
              capturedAt: { type: "string", description: "ISO date-time of the visible capture." },
              followers: { type: ["integer", "null"], minimum: 0 },
              following: { type: ["integer", "null"], minimum: 0 },
              likes: { type: ["integer", "null"], minimum: 0 },
              evidenceNote: { type: "string" },
            },
            required: ["accountId"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          async execute(input) {
            const response = await fetch("/api/snapshots", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
            const result = await response.json() as { error?: string };
            if (!response.ok) throw new Error(result.error ?? "Snapshot could not be saved");
            const dashboardResponse = await fetch(`/api/dashboard?ts=${Date.now()}`, { cache: "no-store" });
            if (!dashboardResponse.ok) throw new Error("Snapshot saved, but dashboard refresh failed");
            const next = (await dashboardResponse.json()) as DashboardData;
            setData(next);
            return { status: "saved", accountId: (input as { accountId?: string }).accountId ?? null, storage: next.storage ?? "fallback" };
          },
        }, { signal: lifecycle.signal });
      } catch {
        // WebMCP is optional; unsupported or unavailable registration must not affect the visible dashboard.
      }
    };
    void register();
    return () => lifecycle.abort();
  }, [refreshNetwork]);

  const latestMay = latestSnapshot("may", data.snapshots);
  const trackedAccounts = data.accounts.filter((account) => latestSnapshot(account.id, data.snapshots));
  const latestMemberSnapshots = data.accounts.map((account) => latestSnapshot(account.id, data.snapshots)).filter((snapshot): snapshot is Snapshot => Boolean(snapshot));
  const overviewMetrics = [
    { label: "Followers", value: latestMemberSnapshots.reduce((total, snapshot) => total + (snapshot.followers ?? 0), 0), tone: "followers" },
    { label: "Views", value: data.posts.reduce((total, post) => total + post.views, 0), tone: "views" },
    { label: "Likes", value: latestMemberSnapshots.reduce((total, snapshot) => total + (snapshot.likes ?? 0), 0), tone: "likes" },
  ];
  const topRows = [...data.accounts].sort((a, b) => {
    const aHas = latestSnapshot(a.id, data.snapshots) ? 1 : 0;
    const bHas = latestSnapshot(b.id, data.snapshots) ? 1 : 0;
    return bHas - aHas || a.name.localeCompare(b.name);
  });

  async function submitSnapshot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Saving snapshot…");
    const payload = { ...snapshotForm, followers: snapshotForm.followers ? Number(snapshotForm.followers) : null, following: snapshotForm.following ? Number(snapshotForm.following) : null, likes: snapshotForm.likes ? Number(snapshotForm.likes) : null };
    try {
      const response = await fetch("/api/snapshots", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Snapshot could not be saved");
      setMessage("Snapshot saved. Refreshing the comparison…");
      setSnapshotForm((current) => ({ ...current, followers: "", following: "", likes: "" }));
      await refresh(true);
      setMessage("Snapshot saved and comparison updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Snapshot could not be saved.");
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar"><div className="brand-lockup"><span className="brand-mark">O</span><div><div className="brand-name">OKENATION</div><div className="brand-section">Growth room / MYT</div></div></div><div className="topbar-actions"><span className="sync-pill"><span className="status-dot live" />Saved data / 30s</span><button className="icon-button" type="button" onClick={() => void Promise.all([refresh(), refreshNetwork()])} disabled={refreshing} aria-label="Refresh saved dashboard and network data"><RefreshCw size={16} className={refreshing ? "spin" : ""} /></button><span className="profile-chip">Oken</span></div></header>
      <div className="app-body">
        <aside className="rail" aria-label="Dashboard sections"><div className="rail-caption">Workspace</div><a className="rail-item active" href="#overview"><Activity size={17} /><span>Overview</span></a><a className="rail-item" href="#network"><UsersRound size={17} /><span>Network</span></a><a className="rail-item" href="#comparison"><UsersRound size={17} /><span>Members</span></a><a className="rail-item" href="#ideas"><Video size={17} /><span>Video lab</span></a><div className="rail-divider" /><div className="rail-caption">Evidence</div><div className="rail-note"><span className="status-dot live" />{trackedAccounts.length}/{data.accounts.length} accounts tracked</div><div className="rail-note"><Clock3 size={14} />Updated {latestMay ? formatDate(latestMay.capturedAt).split(",")[0] : "unknown"}</div><div className="rail-bottom"><div className="rail-caption">Data boundary</div><p>Numbers are shown with their source and freshness. Unknown stays unknown.</p></div></aside>
        <div className="workspace">
          <section className="page-heading" id="overview"><div><div className="eyebrow"><span className="eyebrow-line" />Okenation / daily read</div><h1>Growth, with the story still intact.</h1><p>One clear view of what moved, what is still unmeasured, and what to make next.</p></div><div className="heading-meta"><span className="source-badge"><DatabaseZap size={14} />{data.storage === "database" ? "Saved snapshots" : "Verified fallback"}</span><span>Last verified: {latestMay ? formatDate(latestMay.capturedAt) : "No capture"}</span></div></section>

          <section className="panel overview-panel" aria-label="Simple overview"><div className="panel-heading"><div><span className="panel-kicker">Okenation / at a glance</span><h2>Followers, views, likes</h2></div><span className="panel-context">Latest available totals</span></div><GrowthChart metrics={overviewMetrics} /><div className="chart-footnote"><span>Followers and likes use the latest saved snapshot for each of {latestMemberSnapshots.length} tracked members. Views sum the {data.posts.length} sampled May posts shown in this dashboard.</span></div></section>

          <section className="lower-grid"><article className="panel ideas-panel" id="ideas"><div className="panel-heading"><div><span className="panel-kicker">Next / video lab</span><h2>Ideas worth making</h2></div><Lightbulb size={18} className="heading-icon" /></div><div className="idea-list">{data.ideas.map((idea, index) => <div className="idea-card" key={idea.title}><div className="idea-index">0{index + 1}</div><div className="idea-copy"><div className="idea-title-line"><strong>{idea.title}</strong><span>{idea.tag}</span></div><p>{idea.rationale}</p></div></div>)}</div><p className="disclaimer">Suggestions are creative directions from the stored signals, not promises about distribution.</p></article><article className="panel capture-panel"><div className="panel-heading"><div><span className="panel-kicker">Input / current evidence</span><h2>Record a snapshot</h2></div><Clock3 size={18} className="heading-icon" /></div><p className="capture-intro">Use the Urlebird link beside a member for a temporary manual cross-check. Save only figures visible at the time of capture.</p><form className="capture-form" onSubmit={submitSnapshot}><label>Account<select value={snapshotForm.accountId} onChange={(event) => setSnapshotForm({ ...snapshotForm, accountId: event.target.value })}>{data.accounts.map((account) => <option value={account.id} key={account.id}>{account.name}</option>)}</select></label><label>Source<select value={snapshotForm.source} onChange={(event) => setSnapshotForm({ ...snapshotForm, source: event.target.value })}><option value="manual TikTok capture">TikTok visible profile</option><option value="Urlebird manual observation">Urlebird manual observation</option><option value="TikTok Studio export">TikTok Studio export</option></select></label><label>Captured at<input type="datetime-local" value={snapshotForm.capturedAt} onChange={(event) => setSnapshotForm({ ...snapshotForm, capturedAt: event.target.value })} /></label><div className="form-row"><label>Followers<input inputMode="numeric" placeholder="e.g. 661" value={snapshotForm.followers} onChange={(event) => setSnapshotForm({ ...snapshotForm, followers: event.target.value })} /></label><label>Following<input inputMode="numeric" placeholder="e.g. 250" value={snapshotForm.following} onChange={(event) => setSnapshotForm({ ...snapshotForm, following: event.target.value })} /></label></div><label>Likes<input inputMode="numeric" placeholder="e.g. 7,215" value={snapshotForm.likes} onChange={(event) => setSnapshotForm({ ...snapshotForm, likes: event.target.value.replace(/,/g, "") })} /></label><details><summary>Evidence note</summary><textarea rows={3} value={snapshotForm.evidenceNote} onChange={(event) => setSnapshotForm({ ...snapshotForm, evidenceNote: event.target.value })} /></details><button className="primary-button" type="submit"><DatabaseZap size={16} />Save snapshot</button></form>{message && <p className="form-message" role="status">{message}</p>}</article></section>

          <MentionNetwork accounts={data.accounts} data={network} onReload={refreshNetwork} />

          <section className="panel comparison-panel" id="comparison"><div className="panel-heading comparison-heading"><div><span className="panel-kicker">Members / evidence map</span><h2>Who is measurable right now?</h2></div><span className="table-note">{trackedAccounts.length} observed · {data.accounts.length - trackedAccounts.length} unresolved</span></div><div className="account-table" role="table" aria-label="Okenation member growth comparison"><div className="account-header" role="row"><span>Member</span><span>Followers</span><span>Change</span><span>Evidence state</span></div>{topRows.map((account) => <AccountRow account={account} snapshots={data.snapshots} key={account.id} />)}</div></section>

          <section className="boundary-bar"><AlertTriangle size={16} /><div><strong>Refresh boundary</strong><span>{data.refreshAttempt} Network evidence is manual and reloads only after it is saved.</span></div><button type="button" className="text-button" onClick={() => void Promise.all([refresh(), refreshNetwork()])}>Check again <ArrowUpRight size={14} /></button></section><footer className="footer-note">Okenation Growth Room · public growth room · saved data refreshes every 30 seconds</footer>
        </div>
      </div>
    </main>
  );
}
