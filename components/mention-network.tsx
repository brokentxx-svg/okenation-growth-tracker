"use client";

import { Check, ExternalLink, Link2, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import type { Account } from "../lib/seed-data";
import {
  mentionPlatforms,
  mentionSurfaces,
  type MemberCheckResult,
  type MentionPlatform,
  type MentionSurface,
  type NetworkData,
} from "../lib/network";

type MentionNetworkProps = {
  accounts: Account[];
  data: NetworkData;
  onReload: () => Promise<void>;
};

function localDateTime() {
  return new Date().toISOString().slice(0, 16);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Unknown";
  return new Intl.DateTimeFormat("en-MY", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kuala_Lumpur" }).format(date);
}

function label(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function edgeKey(sourceAccountId: string, targetAccountId: string) {
  return `${sourceAccountId}->${targetAccountId}`;
}

async function postJson(url: string, payload: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  const result = await response.json() as { error?: string; message?: string; status?: string };
  if (!response.ok) throw new Error(result.error ?? "Evidence could not be saved.");
  return result;
}

function nodeStatusText(status: NetworkData["nodes"][number]["status"]) {
  if (status === "unavailable") return "Unavailable source";
  if (status === "checked") return "Checked";
  return "Not checked";
}

export function MentionNetwork({ accounts, data, onReload }: MentionNetworkProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"all" | MentionPlatform>("all");
  const [surfaceFilter, setSurfaceFilter] = useState<"all" | MentionSurface>("all");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [checkForm, setCheckForm] = useState({
    accountId: accounts[0]?.id ?? "",
    platform: "urlebird" as MentionPlatform,
    surfacesChecked: [...mentionSurfaces] as MentionSurface[],
    result: "none_visible" as MemberCheckResult,
    sourceUrl: "",
    checkedAt: localDateTime(),
    note: "",
  });
  const [mentionForm, setMentionForm] = useState({
    sourceAccountId: accounts[0]?.id ?? "",
    targetHandle: "",
    platform: "urlebird" as MentionPlatform,
    surface: "caption" as MentionSurface,
    sourceUrl: "",
    evidenceText: "",
    capturedAt: localDateTime(),
  });

  const accountMap = useMemo(() => new Map(data.nodes.map((node) => [node.id, node])), [data.nodes]);
  const latestChecks = useMemo(() => {
    const latest = new Map<string, NetworkData["checks"][number]>();
    for (const check of data.checks) if (!latest.has(check.accountId)) latest.set(check.accountId, check);
    return latest;
  }, [data.checks]);
  const selectedCheckAccount = accountMap.get(checkForm.accountId);
  const selectedMentionSource = accountMap.get(mentionForm.sourceAccountId);

  const filteredObservations = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return data.observations.filter((observation) => {
      const source = accountMap.get(observation.sourceAccountId);
      const target = observation.targetAccountId ? accountMap.get(observation.targetAccountId) : null;
      const matchesQuery = !needle || [source?.name, source?.handle, target?.name, target?.handle, observation.targetHandle, observation.evidenceText].some((value) => value?.toLowerCase().includes(needle));
      const matchesPlatform = platformFilter === "all" || observation.platform === platformFilter;
      const matchesSurface = surfaceFilter === "all" || observation.surface === surfaceFilter;
      const matchesNode = !selectedNode || observation.sourceAccountId === selectedNode || observation.targetAccountId === selectedNode;
      const matchesEdge = !selectedEdge || (observation.targetAccountId && edgeKey(observation.sourceAccountId, observation.targetAccountId) === selectedEdge);
      return matchesQuery && matchesPlatform && matchesSurface && matchesNode && matchesEdge;
    });
  }, [accountMap, data.observations, platformFilter, query, selectedEdge, selectedNode, surfaceFilter]);

  const filteredEdgeKeys = useMemo(() => new Set(filteredObservations.filter((observation) => observation.targetAccountId).map((observation) => edgeKey(observation.sourceAccountId, observation.targetAccountId as string))), [filteredObservations]);
  const visibleEdges = data.edges.filter((edge) => filteredEdgeKeys.has(edgeKey(edge.sourceAccountId, edge.targetAccountId)));
  const layout = useMemo(() => {
    const width = 900;
    const height = 500;
    const radius = Math.min(195, Math.max(135, data.nodes.length * 13));
    return { width, height, nodes: data.nodes.map((node, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / Math.max(data.nodes.length, 1);
      return { node, x: width / 2 + Math.cos(angle) * radius, y: height / 2 + Math.sin(angle) * radius };
    }) };
  }, [data.nodes]);
  const positions = useMemo(() => new Map(layout.nodes.map((item) => [item.node.id, item])), [layout.nodes]);

  async function reloadAfterSave() {
    await onReload();
    setSelectedEdge(null);
  }

  async function submitCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("Saving member check…");
    try {
      await postJson("/api/network/checks", checkForm);
      await reloadAfterSave();
      setMessage("Member check saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Member check could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function submitMention(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("Saving mention evidence…");
    try {
      const result = await postJson("/api/network/observations", mentionForm);
      await reloadAfterSave();
      setMentionForm((current) => ({ ...current, targetHandle: "", sourceUrl: "", evidenceText: "" }));
      setMessage(result.status === "duplicate" ? "That exact source mention is already recorded." : "Mention evidence saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Mention evidence could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  function toggleSurface(surface: MentionSurface) {
    setCheckForm((current) => ({ ...current, surfacesChecked: current.surfacesChecked.includes(surface) ? current.surfacesChecked.filter((item) => item !== surface) : [...current.surfacesChecked, surface] }));
  }

  return (
    <section className="panel network-panel" id="network">
      <div className="panel-heading network-heading">
        <div><span className="panel-kicker">Okenation / explicit mentions</span><h2>Who is linking to whom?</h2></div>
        <div className="network-actions"><a className="text-button" href="/signin-with-chatgpt?return_to=/">Sign in to record <ShieldCheck size={14} /></a><button className="text-button" type="button" onClick={() => void onReload()}><RefreshCw size={14} /> Reload saved map</button></div>
      </div>
      <p className="network-intro">Only visible @handle mentions are counted. An unobserved link is not treated as a missing relationship; every edge below needs a source URL and evidence excerpt.</p>

      <div className="network-metrics" aria-label="Mention network summary">
        <div><strong>{data.summary.checkedCount}/{data.summary.memberCount}</strong><span>members checked</span></div>
        <div><strong>{data.summary.edgeCount}</strong><span>directed edges</span></div>
        <div><strong>{data.summary.observationCount}</strong><span>observations</span></div>
        <div><strong>{data.summary.mutualPairCount}</strong><span>mutual pairs</span></div>
        <div><strong>{data.summary.unresolvedCount}</strong><span>unknown handles</span></div>
      </div>

      <div className="network-layout">
        <div className="network-graph-wrap">
          <svg className="network-graph" viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-label="Directional Okenation member mention network">
            <defs><marker id="mentionArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="currentColor" /></marker></defs>
            <circle cx={layout.width / 2} cy={layout.height / 2} r="72" className="network-core" />
            <text x={layout.width / 2} y={layout.height / 2 - 4} textAnchor="middle" className="network-core-label">OKENATION</text>
            <text x={layout.width / 2} y={layout.height / 2 + 14} textAnchor="middle" className="network-core-sub">visible evidence</text>
            {visibleEdges.map((edge) => {
              const source = positions.get(edge.sourceAccountId);
              const target = positions.get(edge.targetAccountId);
              if (!source || !target) return null;
              const dx = target.x - source.x;
              const dy = target.y - source.y;
              const distance = Math.max(Math.hypot(dx, dy), 1);
              const unitX = dx / distance;
              const unitY = dy / distance;
              const active = selectedEdge === edgeKey(edge.sourceAccountId, edge.targetAccountId);
              return <line key={edgeKey(edge.sourceAccountId, edge.targetAccountId)} x1={source.x + unitX * 25} y1={source.y + unitY * 25} x2={target.x - unitX * 25} y2={target.y - unitY * 25} className={`network-edge ${active ? "selected" : ""}`} strokeWidth={Math.min(7, 1.5 + edge.count)} markerEnd="url(#mentionArrow)" role="button" tabIndex={0} aria-label={`${source.node.name} mentions ${target.node.name}, ${edge.count} observations`} onClick={() => { setSelectedEdge(edgeKey(edge.sourceAccountId, edge.targetAccountId)); setSelectedNode(null); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedEdge(edgeKey(edge.sourceAccountId, edge.targetAccountId)); setSelectedNode(null); } }} />;
            })}
            {layout.nodes.map(({ node, x, y }) => {
              const active = selectedNode === node.id;
              return <g key={node.id} className={`network-node ${active ? "selected" : ""} ${node.status}`} transform={`translate(${x} ${y})`} role="button" tabIndex={0} aria-label={`${node.name}, ${nodeStatusText(node.status)}, ${node.incomingCount} incoming and ${node.outgoingCount} outgoing mentions`} onClick={() => { setSelectedNode(node.id); setSelectedEdge(null); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedNode(node.id); setSelectedEdge(null); } }}><circle r="23" /><text y="4" textAnchor="middle" className="network-node-initials">{node.name.split(/[ /]/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</text><text y="39" textAnchor="middle" className="network-node-label">{node.name.split(" / ")[0]}</text></g>;
            })}
          </svg>
          <p className="network-graph-note">Click a node or arrow to inspect its recorded evidence. Isolated nodes are still part of the working roster.</p>
        </div>

        <div className="network-evidence">
          <div className="network-filter-row"><label className="network-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search member or handle" aria-label="Search mention evidence" /></label><select value={platformFilter} onChange={(event) => setPlatformFilter(event.target.value as "all" | MentionPlatform)} aria-label="Filter by platform"><option value="all">All sources</option>{mentionPlatforms.map((platform) => <option value={platform} key={platform}>{label(platform)}</option>)}</select><select value={surfaceFilter} onChange={(event) => setSurfaceFilter(event.target.value as "all" | MentionSurface)} aria-label="Filter by mention surface"><option value="all">All surfaces</option>{mentionSurfaces.map((surface) => <option value={surface} key={surface}>{label(surface)}</option>)}</select></div>
          <div className="evidence-heading"><span>{filteredObservations.length} visible evidence item{filteredObservations.length === 1 ? "" : "s"}</span>{(selectedNode || selectedEdge) && <button type="button" className="text-button" onClick={() => { setSelectedNode(null); setSelectedEdge(null); }}>Clear selection</button>}</div>
          {filteredObservations.length ? <div className="evidence-list">{filteredObservations.slice(0, 30).map((observation) => { const source = accountMap.get(observation.sourceAccountId); const target = observation.targetAccountId ? accountMap.get(observation.targetAccountId) : null; return <article className="evidence-card" key={observation.id}><div className="evidence-card-top"><strong>{source?.name ?? observation.sourceAccountId} <span>→</span> {target?.name ?? observation.targetHandle}</strong><span>{label(observation.surface)}</span></div><p>“{observation.evidenceText}”</p><div className="evidence-card-foot"><span>{label(observation.platform)} · {formatDate(observation.capturedAt)}</span><a href={observation.sourceUrl} target="_blank" rel="noreferrer" aria-label="Open evidence source">Open source <ExternalLink size={12} /></a></div></article>; })}</div> : <div className="network-empty"><Link2 size={19} /><strong>No recorded mention evidence yet.</strong><span>Complete a member check, then record each visible @handle with its source URL and excerpt.</span></div>}
          {data.unresolved.length > 0 && <div className="unresolved-list"><strong>Unresolved handles</strong>{data.unresolved.slice(0, 8).map((observation) => <span key={observation.id}>{observation.targetHandle} · {formatDate(observation.capturedAt)}</span>)}</div>}
        </div>
      </div>

      <div className="network-checklist"><div className="panel-heading"><div><span className="panel-kicker">Coverage / manual sweep</span><h3>Every roster member gets a check</h3></div><span className="table-note">Last checked: {formatDate(data.summary.latestCheckedAt)}</span></div><div className="network-check-grid">{data.nodes.map((node) => { const check = latestChecks.get(node.id); const account = accountMap.get(node.id); return <div className="network-check-card" key={node.id}><div><strong>{node.name}</strong><span>{node.handle ?? "No handle supplied"}</span></div><span className={`check-state ${node.status}`}><span className="status-dot" />{nodeStatusText(node.status)}</span>{check && <small>{label(check.platform)} · {formatDate(check.checkedAt)}</small>}{account?.profileUrl && <a className="mini-link" href={account.profileUrl} target="_blank" rel="noreferrer">TikTok <ExternalLink size={11} /></a>}</div>; })}</div></div>

      <div className="network-capture-grid">
        <form className="network-form" onSubmit={submitCheck}><div className="panel-heading"><div><span className="panel-kicker">Input / source review</span><h3>Record member check</h3></div><Check size={17} className="heading-icon" /></div><p className="form-help">Use this for “mentions found”, “none visible”, or a known unavailable source.</p><label>Member<select value={checkForm.accountId} onChange={(event) => setCheckForm({ ...checkForm, accountId: event.target.value })}>{accounts.map((account) => <option value={account.id} key={account.id}>{account.name}</option>)}</select></label>{selectedCheckAccount?.profileUrl && <div className="form-links"><a href={selectedCheckAccount.profileUrl} target="_blank" rel="noreferrer">TikTok profile <ExternalLink size={12} /></a>{selectedCheckAccount.handle && <a href={`https://urlebird.com/user/${encodeURIComponent(selectedCheckAccount.handle.replace(/^@/, ""))}/`} target="_blank" rel="noreferrer">Urlebird mirror <ExternalLink size={12} /></a>}</div>}<label>Platform<select value={checkForm.platform} onChange={(event) => setCheckForm({ ...checkForm, platform: event.target.value as MentionPlatform })}>{mentionPlatforms.map((platform) => <option value={platform} key={platform}>{label(platform)}</option>)}</select></label><fieldset className="network-fieldset"><legend>Surfaces checked</legend><div className="network-check-options">{mentionSurfaces.map((surface) => <label key={surface}><input type="checkbox" checked={checkForm.surfacesChecked.includes(surface)} onChange={() => toggleSurface(surface)} />{label(surface)}</label>)}</div></fieldset><label>Result<select value={checkForm.result} onChange={(event) => setCheckForm({ ...checkForm, result: event.target.value as MemberCheckResult })}><option value="none_visible">No known mention visible</option><option value="mentions_found">Mentions found</option><option value="unavailable">Source unavailable</option></select></label><label>Source URL<input value={checkForm.sourceUrl} onChange={(event) => setCheckForm({ ...checkForm, sourceUrl: event.target.value })} placeholder="TikTok or Urlebird URL" /></label><label>Checked at<input type="datetime-local" value={checkForm.checkedAt} onChange={(event) => setCheckForm({ ...checkForm, checkedAt: event.target.value })} /></label><label>Note<textarea rows={2} value={checkForm.note} onChange={(event) => setCheckForm({ ...checkForm, note: event.target.value })} placeholder="What was visible or unavailable?" /></label><button className="primary-button" type="submit" disabled={saving}>Save member check</button></form>

        <form className="network-form" onSubmit={submitMention}><div className="panel-heading"><div><span className="panel-kicker">Input / explicit edge</span><h3>Record a mention</h3></div><Link2 size={17} className="heading-icon" /></div><p className="form-help">Record only a visible @handle. Unknown handles stay outside the graph until resolved.</p><label>Source member<select value={mentionForm.sourceAccountId} onChange={(event) => setMentionForm({ ...mentionForm, sourceAccountId: event.target.value })}>{accounts.map((account) => <option value={account.id} key={account.id}>{account.name}</option>)}</select></label>{selectedMentionSource?.handle && <span className="form-handle">Source: {selectedMentionSource.handle}</span>}<label>Visible target @handle<input value={mentionForm.targetHandle} onChange={(event) => setMentionForm({ ...mentionForm, targetHandle: event.target.value })} placeholder="e.g. @aurea_is" required /></label><label>Platform<select value={mentionForm.platform} onChange={(event) => setMentionForm({ ...mentionForm, platform: event.target.value as MentionPlatform })}>{mentionPlatforms.map((platform) => <option value={platform} key={platform}>{label(platform)}</option>)}</select></label><label>Surface<select value={mentionForm.surface} onChange={(event) => setMentionForm({ ...mentionForm, surface: event.target.value as MentionSurface })}>{mentionSurfaces.map((surface) => <option value={surface} key={surface}>{label(surface)}</option>)}</select></label><label>Source URL<input value={mentionForm.sourceUrl} onChange={(event) => setMentionForm({ ...mentionForm, sourceUrl: event.target.value })} placeholder="Exact post/profile source" required /></label><label>Visible evidence excerpt<textarea rows={3} value={mentionForm.evidenceText} onChange={(event) => setMentionForm({ ...mentionForm, evidenceText: event.target.value })} placeholder="Paste the visible @mention or short excerpt" required /></label><label>Captured at<input type="datetime-local" value={mentionForm.capturedAt} onChange={(event) => setMentionForm({ ...mentionForm, capturedAt: event.target.value })} /></label><button className="primary-button" type="submit" disabled={saving}>Save mention evidence</button></form>
      </div>
      {message && <p className="form-message" role="status">{message}</p>}
    </section>
  );
}
