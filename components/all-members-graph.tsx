"use client";

import { useId, useMemo, useState } from "react";
import type { Account, DashboardData, Snapshot } from "../lib/seed-data";

export type ChartMetric = "followers" | "likes" | "growth" | "trajectory";

interface AllMembersGraphProps {
  accounts: Account[];
  snapshots: Snapshot[];
  posts: DashboardData["posts"];
}

const MEMBER_COLORS: Record<string, string> = {
  may: "var(--gold)",
  broken: "#84cc16",
  nara: "#14b8a6",
  kuro: "#10b981",
  ailee: "#ec4899",
  adam: "#94a3b8",
  naila: "#f59e0b",
  aurea: "#a855f7",
  syasya: "#06b6d4",
  reen: "#ef4444",
  mira: "#6366f1",
  eriqa: "#d946ef",
  paparay: "#f97316",
  aurora: "#3b82f6",
  shion: "#64748b",
  butler: "#475569",
};

function formatCompact(val: number | null | undefined): string {
  if (val === null || val === undefined) return "—";
  return new Intl.NumberFormat("en-MY", { notation: "compact", maximumFractionDigits: 1 }).format(val);
}

function formatExact(val: number | null | undefined): string {
  if (val === null || val === undefined) return "—";
  return new Intl.NumberFormat("en-MY").format(val);
}

function latestSnapshot(accountId: string, snapshots: Snapshot[]) {
  return [...snapshots]
    .filter((s) => s.accountId === accountId)
    .sort((a, b) => +new Date(b.capturedAt) - +new Date(a.capturedAt))[0] ?? null;
}

function previousSnapshot(accountId: string, snapshots: Snapshot[]) {
  return [...snapshots]
    .filter((s) => s.accountId === accountId)
    .sort((a, b) => +new Date(b.capturedAt) - +new Date(a.capturedAt))[1] ?? null;
}

export function AllMembersGraph({ accounts, snapshots, posts }: AllMembersGraphProps) {
  const gradientId = useId();
  const [metric, setMetric] = useState<ChartMetric>("followers");
  const [hoveredAccountId, setHoveredAccountId] = useState<string | null>(null);

  // Compute processed member telemetry
  const processed = useMemo(() => {
    return accounts.map((account) => {
      const latest = latestSnapshot(account.id, snapshots);
      const prev = previousSnapshot(account.id, snapshots);
      const followers = latest?.followers ?? null;
      const likes = latest?.likes ?? null;
      const prevFollowers = prev?.followers ?? null;
      const delta = followers !== null && prevFollowers !== null ? followers - prevFollowers : null;
      const memberPosts = posts.filter((p) => p.accountId === account.id);
      const views = memberPosts.length ? memberPosts.reduce((sum, p) => sum + p.views, 0) : null;
      const history = snapshots
        .filter((s) => s.accountId === account.id && s.followers !== null)
        .sort((a, b) => +new Date(a.capturedAt) - +new Date(b.capturedAt));

      return {
        account,
        latest,
        prev,
        followers,
        likes,
        delta,
        views,
        history,
        hasData: Boolean(latest && (followers !== null || likes !== null)),
      };
    });
  }, [accounts, snapshots, posts]);

  // Aggregate totals
  const totals = useMemo(() => {
    const totalFollowers = processed.reduce((sum, m) => sum + (m.followers ?? 0), 0);
    const totalLikes = processed.reduce((sum, m) => sum + (m.likes ?? 0), 0);
    const totalGrowth = processed.reduce((sum, m) => sum + (m.delta && m.delta > 0 ? m.delta : 0), 0);
    const observedCount = processed.filter((m) => m.hasData).length;

    // Leader in growth
    const fastestGrower = [...processed]
      .filter((m) => m.delta !== null && m.delta > 0)
      .sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0))[0];

    return { totalFollowers, totalLikes, totalGrowth, observedCount, fastestGrower };
  }, [processed]);

  // Sorted items based on active metric
  const sortedItems = useMemo(() => {
    if (metric === "trajectory") return processed;

    return [...processed].sort((a, b) => {
      if (!a.hasData && !b.hasData) return a.account.name.localeCompare(b.account.name);
      if (!a.hasData) return 1;
      if (!b.hasData) return -1;

      if (metric === "followers") return (b.followers ?? -1) - (a.followers ?? -1);
      if (metric === "likes") return (b.likes ?? -1) - (a.likes ?? -1);
      if (metric === "growth") return (b.delta ?? -999999) - (a.delta ?? -999999);
      return 0;
    });
  }, [processed, metric]);

  // Coordinate dimensions
  const svgWidth = 960;
  const svgHeight = 350;
  const marginLeft = 60;
  const marginRight = 30;
  const marginTop = 30;
  const marginBottom = 90;
  const plotWidth = svgWidth - marginLeft - marginRight;
  const plotHeight = svgHeight - marginTop - marginBottom;
  const plotBottom = marginTop + plotHeight;

  // Max value for scaling
  const maxValue = useMemo(() => {
    if (metric === "followers") {
      const maxF = Math.max(...processed.map((m) => m.followers ?? 0), 1000);
      return Math.ceil(maxF / 1000) * 1000;
    }
    if (metric === "likes") {
      const maxL = Math.max(...processed.map((m) => m.likes ?? 0), 10000);
      return Math.ceil(maxL / 50000) * 50000;
    }
    if (metric === "growth") {
      const maxG = Math.max(...processed.map((m) => m.delta ?? 0), 500);
      return Math.ceil(maxG / 500) * 500;
    }
    // Trajectory timeline
    const maxHist = Math.max(...processed.flatMap((m) => m.history.map((h) => h.followers ?? 0)), 10000);
    return Math.ceil(maxHist / 2000) * 2000;
  }, [processed, metric]);

  // Y-axis tick values
  const yTicks = useMemo(() => {
    return [0, 0.25, 0.5, 0.75, 1.0].map((pct) => ({
      pct,
      y: plotBottom - pct * plotHeight,
      value: Math.round(pct * maxValue),
    }));
  }, [plotBottom, plotHeight, maxValue]);

  // Distinct timeline dates for trajectory view
  const timelineDates = useMemo(() => {
    const set = new Set<string>();
    snapshots.forEach((s) => {
      if (s.followers !== null) {
        set.add(s.capturedAt.slice(0, 10));
      }
    });
    return Array.from(set).sort();
  }, [snapshots]);

  // Hovered item details
  const activeDetail = useMemo(() => {
    if (!hoveredAccountId) return null;
    return processed.find((m) => m.account.id === hoveredAccountId) ?? null;
  }, [hoveredAccountId, processed]);

  return (
    <section className="panel unified-chart-panel" aria-label="Unified Okenation member growth graph">
      {/* Header and Telemetry Tabs */}
      <div className="unified-chart-header">
        <div>
          <span className="panel-kicker">Okenation / telemetry</span>
          <h2>All members, one graph</h2>
          <p className="unified-chart-subtitle">
            Direct comparison and trajectory of all 16 members on a unified scale.
          </p>
        </div>

        <div className="metric-tabs" role="tablist" aria-label="Chart metric selector">
          <button
            type="button"
            role="tab"
            aria-selected={metric === "followers"}
            className={`metric-tab ${metric === "followers" ? "active" : ""}`}
            onClick={() => setMetric("followers")}
          >
            Followers
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={metric === "likes"}
            className={`metric-tab ${metric === "likes" ? "active" : ""}`}
            onClick={() => setMetric("likes")}
          >
            Likes
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={metric === "growth"}
            className={`metric-tab ${metric === "growth" ? "active" : ""}`}
            onClick={() => setMetric("growth")}
          >
            Net Growth
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={metric === "trajectory"}
            className={`metric-tab ${metric === "trajectory" ? "active" : ""}`}
            onClick={() => setMetric("trajectory")}
          >
            Trajectory
          </button>
        </div>
      </div>

      {/* Aggregate Stats Strip or Hovered HUD */}
      <div className="chart-hud">
        {activeDetail ? (
          <div className="hud-inspector">
            <div className="inspector-left">
              <span
                className="inspector-avatar"
                style={{
                  backgroundColor: MEMBER_COLORS[activeDetail.account.id] || "var(--gold)",
                }}
              >
                {activeDetail.account.name.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <strong>{activeDetail.account.name}</strong>
                <span>{activeDetail.account.handle ?? "No handle supplied"} · {activeDetail.account.role}</span>
              </div>
            </div>
            <div className="inspector-metrics">
              <div className="inspector-item">
                <span className="label">Followers</span>
                <span className="val">{formatExact(activeDetail.followers)}</span>
              </div>
              <div className="inspector-item">
                <span className="label">Likes</span>
                <span className="val">{formatExact(activeDetail.likes)}</span>
              </div>
              <div className="inspector-item">
                <span className="label">Growth</span>
                <span className={`val ${activeDetail.delta && activeDetail.delta > 0 ? "positive" : ""}`}>
                  {activeDetail.delta !== null ? (activeDetail.delta > 0 ? `+${formatExact(activeDetail.delta)}` : formatExact(activeDetail.delta)) : "—"}
                </span>
              </div>
              <div className="inspector-item">
                <span className="label">Evidence</span>
                <span className="val muted">{activeDetail.hasData ? "Observed" : "Unresolved"}</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="hud-stat">
              <span className="hud-stat-label">Total Roster Scale</span>
              <span className="hud-stat-value">{formatCompact(totals.totalFollowers)} followers</span>
            </div>
            <div className="hud-stat">
              <span className="hud-stat-label">Total Resonance</span>
              <span className="hud-stat-value">{formatCompact(totals.totalLikes)} likes</span>
            </div>
            <div className="hud-stat">
              <span className="hud-stat-label">Net Gain (Latest)</span>
              <span className="hud-stat-value positive">+{formatCompact(totals.totalGrowth)} followers</span>
            </div>
            <div className="hud-stat">
              <span className="hud-stat-label">Breakout Leader</span>
              <span className="hud-stat-value">
                {totals.fastestGrower ? `${totals.fastestGrower.account.name.split(" / ")[0]} (+${formatCompact(totals.fastestGrower.delta)})` : "—"}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Unified SVG Canvas */}
      <div className="unified-svg-container">
        <svg
          className="unified-chart-svg"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          role="img"
          aria-label={`All 16 members ${metric} comparison graph`}
        >
          <defs>
            <linearGradient id={`${gradientId}-gold`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id={`${gradientId}-likes`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id={`${gradientId}-green`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
            </linearGradient>
            <pattern id={`${gradientId}-unresolved`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
            </pattern>
          </defs>

          {/* Grid lines and Y-axis labels */}
          {yTicks.map(({ pct, y, value }) => (
            <g key={pct}>
              <line
                x1={marginLeft}
                x2={svgWidth - marginRight}
                y1={y}
                y2={y}
                className="chart-grid"
              />
              <text
                x={marginLeft - 10}
                y={y + 4}
                textAnchor="end"
                className="chart-axis-label"
              >
                {formatCompact(value)}
              </text>
            </g>
          ))}

          {/* Baseline X-axis */}
          <line
            x1={marginLeft}
            x2={svgWidth - marginRight}
            y1={plotBottom}
            y2={plotBottom}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1.5"
          />

          {/* VIEW MODE: BAR CHART (Followers, Likes, Growth) */}
          {metric !== "trajectory" && (
            <g className="chart-bars-group">
              {sortedItems.map((item, index) => {
                const count = sortedItems.length;
                const slotWidth = plotWidth / count;
                const barWidth = Math.min(36, slotWidth - 14);
                const xCenter = marginLeft + (index + 0.5) * slotWidth;
                const xBar = xCenter - barWidth / 2;

                const val =
                  metric === "followers"
                    ? item.followers
                    : metric === "likes"
                      ? item.likes
                      : item.delta;

                const hasVal = item.hasData && val !== null;
                const normalized = hasVal ? Math.max(0, val as number) / maxValue : 0;
                const barHeight = hasVal ? Math.max(6, normalized * plotHeight) : 28;
                const yBar = plotBottom - barHeight;

                const isHovered = hoveredAccountId === item.account.id;
                const fillGradient =
                  metric === "followers"
                    ? `url(#${gradientId}-gold)`
                    : metric === "likes"
                      ? `url(#${gradientId}-likes)`
                      : `url(#${gradientId}-green)`;

                return (
                  <g
                    key={item.account.id}
                    className={`chart-bar-col ${isHovered ? "active" : ""}`}
                    onMouseEnter={() => setHoveredAccountId(item.account.id)}
                    onMouseLeave={() => setHoveredAccountId(null)}
                  >
                    {/* Bar geometry */}
                    {hasVal ? (
                      <rect
                        x={xBar}
                        y={yBar}
                        width={barWidth}
                        height={barHeight}
                        rx="5"
                        fill={fillGradient}
                        stroke={isHovered ? "var(--paper)" : MEMBER_COLORS[item.account.id]}
                        strokeWidth={isHovered ? 2 : 1}
                        className="chart-bar-rect"
                      >
                        <title>{`${item.account.name}: ${formatExact(val)} ${metric}`}</title>
                      </rect>
                    ) : (
                      <rect
                        x={xBar}
                        y={plotBottom - 30}
                        width={barWidth}
                        height={30}
                        rx="4"
                        fill={`url(#${gradientId}-unresolved)`}
                        stroke="rgba(255,255,255,0.18)"
                        strokeDasharray="3 3"
                        className="chart-bar-rect unresolved"
                      >
                        <title>{`${item.account.name}: Unresolved boundary`}</title>
                      </rect>
                    )}

                    {/* Value label on top of bar */}
                    <text
                      x={xCenter}
                      y={hasVal ? yBar - 7 : plotBottom - 36}
                      textAnchor="middle"
                      className={`chart-bar-val ${hasVal ? "" : "muted"}`}
                    >
                      {hasVal ? (metric === "growth" && (val as number) > 0 ? `+${formatCompact(val)}` : formatCompact(val)) : "—"}
                    </text>

                    {/* Member name label below baseline */}
                    <text
                      x={xCenter}
                      y={plotBottom + 16}
                      textAnchor="end"
                      className={`chart-member-label ${isHovered ? "highlight" : ""}`}
                      transform={`rotate(-40 ${xCenter} ${plotBottom + 16})`}
                    >
                      {item.account.name.split(" / ")[0]}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* VIEW MODE: TRAJECTORY TIMELINE */}
          {metric === "trajectory" && (
            <g className="chart-trajectory-group">
              {/* Timeline date columns */}
              {timelineDates.map((dateStr, idx) => {
                const x = marginLeft + (idx * plotWidth) / Math.max(1, timelineDates.length - 1);
                return (
                  <g key={dateStr}>
                    <line x1={x} x2={x} y1={marginTop} y2={plotBottom} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" />
                    <text x={x} y={plotBottom + 20} textAnchor="middle" className="chart-axis-label">
                      {dateStr.slice(5)}
                    </text>
                  </g>
                );
              })}

              {/* Polylines for each member */}
              {processed.map((item) => {
                if (item.history.length === 0) return null;
                const isHovered = hoveredAccountId === item.account.id;
                const isAnyHovered = hoveredAccountId !== null;
                const opacity = isHovered ? 1 : isAnyHovered ? 0.2 : 0.85;
                const strokeWidth = isHovered ? 3.5 : 2;
                const color = MEMBER_COLORS[item.account.id] || "var(--gold)";

                const points = item.history.map((h) => {
                  const dateStr = h.capturedAt.slice(0, 10);
                  const dateIndex = timelineDates.indexOf(dateStr);
                  const x = marginLeft + (dateIndex * plotWidth) / Math.max(1, timelineDates.length - 1);
                  const val = h.followers ?? 0;
                  const y = plotBottom - (val / maxValue) * plotHeight;
                  return { x, y, val, date: dateStr };
                });

                const polylineStr = points.map((p) => `${p.x},${p.y}`).join(" ");

                return (
                  <g
                    key={item.account.id}
                    onMouseEnter={() => setHoveredAccountId(item.account.id)}
                    onMouseLeave={() => setHoveredAccountId(null)}
                  >
                    <polyline
                      points={polylineStr}
                      fill="none"
                      stroke={color}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={opacity}
                      className="chart-line-path"
                    />
                    {points.map((p, pIdx) => (
                      <circle
                        key={pIdx}
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 5.5 : 3.5}
                        fill={color}
                        stroke="var(--canvas-card)"
                        strokeWidth={1.5}
                        opacity={opacity}
                        className="chart-line-dot"
                      >
                        <title>{`${item.account.name} on ${p.date}: ${formatExact(p.val)} followers`}</title>
                      </circle>
                    ))}
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Roster Quick Chips Legend */}
      <div className="chart-legend-row" aria-label="Quick member filter">
        {accounts.map((acc) => {
          const isHovered = hoveredAccountId === acc.id;
          return (
            <button
              key={acc.id}
              type="button"
              className={`legend-chip ${isHovered ? "active" : ""}`}
              onMouseEnter={() => setHoveredAccountId(acc.id)}
              onMouseLeave={() => setHoveredAccountId(null)}
            >
              <span
                className="chip-dot"
                style={{ backgroundColor: MEMBER_COLORS[acc.id] || "var(--gold)" }}
              />
              <span>{acc.name.split(" / ")[0]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
