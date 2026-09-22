export const mentionPlatforms = ["tiktok", "urlebird", "tiktok_studio"] as const;
export type MentionPlatform = (typeof mentionPlatforms)[number];

export const mentionSurfaces = ["bio", "caption", "comment", "video_metadata"] as const;
export type MentionSurface = (typeof mentionSurfaces)[number];

export const memberCheckResults = ["mentions_found", "none_visible", "unavailable"] as const;
export type MemberCheckResult = (typeof memberCheckResults)[number];

type NetworkAccount = {
  id: string;
  name: string;
  handle: string | null;
  profileUrl: string | null;
};

export type MemberCheck = {
  id: number | string;
  accountId: string;
  platform: MentionPlatform;
  sourceUrl: string | null;
  checkedAt: string;
  surfacesChecked: MentionSurface[];
  result: MemberCheckResult;
  note: string;
};

export type MentionObservation = {
  id: number | string;
  sourceAccountId: string;
  targetAccountId: string | null;
  targetHandle: string;
  sourceUrl: string;
  platform: MentionPlatform;
  surface: MentionSurface;
  evidenceText: string;
  capturedAt: string;
};

export type NetworkNode = NetworkAccount & {
  incomingCount: number;
  outgoingCount: number;
  observationCount: number;
  status: "checked" | "not_checked" | "unavailable";
  lastCheckedAt: string | null;
};

export type NetworkEdge = {
  sourceAccountId: string;
  targetAccountId: string;
  count: number;
  firstSeenAt: string;
  lastSeenAt: string;
  observationIds: Array<number | string>;
  surfaces: MentionSurface[];
  platforms: MentionPlatform[];
};

export type NetworkData = {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  observations: MentionObservation[];
  checks: MemberCheck[];
  unresolved: MentionObservation[];
  summary: {
    memberCount: number;
    checkedCount: number;
    edgeCount: number;
    observationCount: number;
    mutualPairCount: number;
    unresolvedCount: number;
    latestCheckedAt: string | null;
  };
};

export function normalizeHandle(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[.,!?;:)}\]}]+$/g, "");
}

export function displayHandle(value: string): string {
  const normalized = normalizeHandle(value);
  return normalized ? `@${normalized}` : "";
}

export function resolveTargetAccountId(targetHandle: string, accounts: NetworkAccount[]): string | null {
  const normalized = normalizeHandle(targetHandle);
  if (!normalized) return null;
  return accounts.find((account) => normalizeHandle(account.handle ?? "") === normalized)?.id ?? null;
}

export function parseSurfaces(value: string | null | undefined): MentionSurface[] {
  if (!value) return [];
  return value
    .split(",")
    .map((surface) => surface.trim())
    .filter((surface): surface is MentionSurface => (mentionSurfaces as readonly string[]).includes(surface));
}

export function buildNetworkData(
  accounts: NetworkAccount[],
  checks: MemberCheck[],
  observations: MentionObservation[],
): NetworkData {
  const accountMap = new Map(accounts.map((account) => [account.id, account]));
  const latestChecks = new Map<string, MemberCheck>();
  for (const check of [...checks].sort((a, b) => +new Date(b.checkedAt) - +new Date(a.checkedAt))) {
    if (!latestChecks.has(check.accountId)) latestChecks.set(check.accountId, check);
  }

  const nodeStats = new Map(accounts.map((account) => [account.id, { incomingCount: 0, outgoingCount: 0, observationCount: 0 }]));
  const edgeMap = new Map<string, NetworkEdge>();
  const unresolved = observations.filter((observation) => !observation.targetAccountId || !accountMap.has(observation.targetAccountId));

  for (const observation of observations) {
    if (!observation.targetAccountId || observation.targetAccountId === observation.sourceAccountId) continue;
    if (!accountMap.has(observation.sourceAccountId) || !accountMap.has(observation.targetAccountId)) continue;
    const key = `${observation.sourceAccountId}->${observation.targetAccountId}`;
    const sourceStats = nodeStats.get(observation.sourceAccountId);
    const targetStats = nodeStats.get(observation.targetAccountId);
    if (sourceStats) {
      sourceStats.outgoingCount += 1;
      sourceStats.observationCount += 1;
    }
    if (targetStats) {
      targetStats.incomingCount += 1;
      targetStats.observationCount += 1;
    }
    const existing = edgeMap.get(key);
    if (existing) {
      existing.count += 1;
      existing.firstSeenAt = new Date(existing.firstSeenAt) < new Date(observation.capturedAt) ? existing.firstSeenAt : observation.capturedAt;
      existing.lastSeenAt = new Date(existing.lastSeenAt) > new Date(observation.capturedAt) ? existing.lastSeenAt : observation.capturedAt;
      existing.observationIds.push(observation.id);
      if (!existing.surfaces.includes(observation.surface)) existing.surfaces.push(observation.surface);
      if (!existing.platforms.includes(observation.platform)) existing.platforms.push(observation.platform);
    } else {
      edgeMap.set(key, {
        sourceAccountId: observation.sourceAccountId,
        targetAccountId: observation.targetAccountId,
        count: 1,
        firstSeenAt: observation.capturedAt,
        lastSeenAt: observation.capturedAt,
        observationIds: [observation.id],
        surfaces: [observation.surface],
        platforms: [observation.platform],
      });
    }
  }

  const edges = [...edgeMap.values()].sort((a, b) => b.count - a.count || a.sourceAccountId.localeCompare(b.sourceAccountId));
  const nodes = accounts.map((account) => {
    const latestCheck = latestChecks.get(account.id);
    const stats = nodeStats.get(account.id) ?? { incomingCount: 0, outgoingCount: 0, observationCount: 0 };
    return {
      ...account,
      ...stats,
      status: latestCheck?.result === "unavailable" ? "unavailable" : latestCheck ? "checked" : "not_checked",
      lastCheckedAt: latestCheck?.checkedAt ?? null,
    } satisfies NetworkNode;
  });

  const edgeKeys = new Set(edges.map((edge) => `${edge.sourceAccountId}->${edge.targetAccountId}`));
  const mutualPairCount = edges.filter((edge) => edge.sourceAccountId < edge.targetAccountId && edgeKeys.has(`${edge.targetAccountId}->${edge.sourceAccountId}`)).length;
  const latestCheckedAt = checks.length ? [...checks].sort((a, b) => +new Date(b.checkedAt) - +new Date(a.checkedAt))[0].checkedAt : null;

  return {
    nodes,
    edges,
    observations: [...observations].sort((a, b) => +new Date(b.capturedAt) - +new Date(a.capturedAt)),
    checks: [...checks].sort((a, b) => +new Date(b.checkedAt) - +new Date(a.checkedAt)),
    unresolved,
    summary: {
      memberCount: accounts.length,
      checkedCount: latestChecks.size,
      edgeCount: edges.length,
      observationCount: observations.length,
      mutualPairCount,
      unresolvedCount: new Set(unresolved.map((observation) => observation.targetHandle)).size,
      latestCheckedAt,
    },
  };
}
