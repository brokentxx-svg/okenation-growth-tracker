"use client";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Clock3,
  DatabaseZap,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AllMembersGraph } from "../components/all-members-graph";
import { demoDashboard, type DashboardData, type Snapshot } from "../lib/seed-data";

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

function latestSnapshot(accountId: string, snapshots: Snapshot[]) {
  return [...snapshots]
    .filter((snapshot) => snapshot.accountId === accountId)
    .sort((a, b) => +new Date(b.capturedAt) - +new Date(a.capturedAt))[0] ?? null;
}

export default function Home() {
  const [data, setData] = useState<DashboardData>(demoDashboard);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setRefreshing(true);
    try {
      const response = await fetch(`/api/dashboard?ts=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Dashboard refresh unavailable");
      const next = (await response.json()) as DashboardData;
      setData(next);
    } catch {
      // Keep verified view on refresh error
    } finally {
      if (!quiet) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const kickoff = window.setTimeout(() => void refresh(true), 0);
    const timer = window.setInterval(() => void refresh(true), 30_000);
    return () => {
      window.clearTimeout(kickoff);
      window.clearInterval(timer);
    };
  }, [refresh]);

  const latestMay = latestSnapshot("may", data.snapshots);
  const trackedAccounts = data.accounts.filter((account) => latestSnapshot(account.id, data.snapshots));

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">O</span>
          <div>
            <div className="brand-name">OKENATION</div>
            <div className="brand-section">Growth room / MYT</div>
          </div>
        </div>
        <div className="topbar-actions">
          <span className="sync-pill"><span className="status-dot live" />Saved data / 30s</span>
          <button
            className="icon-button"
            type="button"
            onClick={() => void refresh()}
            disabled={refreshing}
            aria-label="Refresh saved dashboard data"
          >
            <RefreshCw size={16} className={refreshing ? "spin" : ""} />
          </button>
          <span className="profile-chip">Oken</span>
        </div>
      </header>

      <div className="app-body">
        <aside className="rail" aria-label="Dashboard sections">
          <div className="rail-caption">Workspace</div>
          <a className="rail-item active" href="#overview">
            <Activity size={17} />
            <span>Overview</span>
          </a>
          <div className="rail-divider" />
          <div className="rail-caption">Evidence</div>
          <div className="rail-note">
            <span className="status-dot live" />
            {trackedAccounts.length}/{data.accounts.length} accounts tracked
          </div>
          <div className="rail-note">
            <Clock3 size={14} />
            Updated {latestMay ? formatDate(latestMay.capturedAt).split(",")[0] : "unknown"}
          </div>
          <div className="rail-bottom">
            <div className="rail-caption">Data boundary</div>
            <p>Numbers are shown with their source and freshness. Unknown stays unknown.</p>
          </div>
        </aside>

        <div className="workspace">
          <section className="page-heading" id="overview">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" />Okenation / daily read</div>
              <h1>Growth, with the story still intact.</h1>
              <p>One clear view of what moved, what is still unmeasured, and what to make next.</p>
            </div>
            <div className="heading-meta">
              <span className="source-badge">
                <DatabaseZap size={14} />
                {data.storage === "database" ? "Saved snapshots" : "Verified fallback"}
              </span>
              <span>Last verified: {latestMay ? formatDate(latestMay.capturedAt) : "No capture"}</span>
            </div>
          </section>

          {/* THE 1 UNIFIED ALL-MEMBERS GRAPH */}
          <AllMembersGraph accounts={data.accounts} snapshots={data.snapshots} posts={data.posts} />

          <section className="boundary-bar">
            <AlertTriangle size={16} />
            <div>
              <strong>Refresh boundary</strong>
              <span>{data.refreshAttempt}</span>
            </div>
            <button type="button" className="text-button" onClick={() => void refresh()}>
              Check again <ArrowUpRight size={14} />
            </button>
          </section>

          <footer className="footer-note">
            Okenation Growth Room · public growth room · saved data refreshes every 30 seconds
          </footer>
        </div>
      </div>
    </main>
  );
}
