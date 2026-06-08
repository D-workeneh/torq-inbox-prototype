import { APP_WORKSPACES } from '@/lib/appNavConfig';

export type AiCreditLevel = 'exceeded' | 'warning' | 'normal';

export interface WorkspaceAiCredits {
  workspaceId: string;
  /** Display label (inbox pill, settings) */
  workspaceName: string;
  used: number;
  limit: number;
  resetLabel: string;
  level: AiCreditLevel;
}

const CREDITS: Record<string, Omit<WorkspaceAiCredits, 'workspaceId' | 'workspaceName'>> = {
  'torq-dev': {
    used: 5_000,
    limit: 5_000,
    resetLabel: 'Mar 1',
    level: 'exceeded',
  },
  'torq-staging': {
    used: 4_500,
    limit: 5_000,
    resetLabel: 'Mar 1',
    level: 'warning',
  },
  'torq-prod': {
    used: 10_000,
    limit: 10_000,
    resetLabel: 'Mar 1',
    level: 'exceeded',
  },
};

function resolveWorkspaceName(workspaceId: string): string {
  return APP_WORKSPACES.find((w) => w.id === workspaceId)?.name ?? workspaceId;
}

export function getWorkspaceAiCredits(workspaceId: string): WorkspaceAiCredits {
  const base = CREDITS[workspaceId] ?? CREDITS['torq-dev'];
  return {
    workspaceId,
    workspaceName: resolveWorkspaceName(workspaceId),
    ...base,
  };
}

export function resolveWorkspaceIdFromName(name: string): string {
  const byName = APP_WORKSPACES.find((w) => w.id === name || w.name === name);
  if (byName) return byName.id;
  const entry = Object.entries(CREDITS).find(
    ([id]) => resolveWorkspaceName(id).toLowerCase() === name.toLowerCase(),
  );
  return entry?.[0] ?? 'torq-dev';
}

export function formatCreditsNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function formatCreditsValue(used: number, limit: number): string {
  return `${formatCreditsNumber(used)} of ${formatCreditsNumber(limit)}`;
}

export function getAiUsagePercent(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

export function getAiCreditsMetricValue(credits: WorkspaceAiCredits): string {
  return formatCreditsValue(credits.used, credits.limit);
}

export function getAiCreditsMetricHint(credits: WorkspaceAiCredits): string {
  const pct = getAiUsagePercent(credits.used, credits.limit);
  const reset = `Resets ${credits.resetLabel}`;
  if (credits.level === 'exceeded') {
    return `${reset} · ${pct}% used · Limit reached`;
  }
  if (credits.level === 'warning') {
    return `${reset} · ${pct}% used this cycle`;
  }
  return `${reset} · ${pct}% used this cycle`;
}

export const AI_CREDIT_EXCEEDED_BODY =
  'Critical: Workflows using AI operators are now failing';

export type AiCreditNotifVariant = 'exceeded' | 'warning' | 'summary';

export function getAiCreditNotificationCopy(
  credits: WorkspaceAiCredits,
  variant: AiCreditNotifVariant,
): { title: string; body: string; severity: 'critical' | 'high' | 'low' } {
  const value = formatCreditsValue(credits.used, credits.limit);
  const pct = getAiUsagePercent(credits.used, credits.limit);

  if (variant === 'exceeded') {
    return {
      title: 'AI credit limit exceeded',
      body: AI_CREDIT_EXCEEDED_BODY,
      severity: 'critical',
    };
  }
  if (variant === 'warning') {
    return {
      title: `AI credits at ${pct}% usage`,
      body: `${credits.workspaceName} · ${value} credits used`,
      severity: 'high',
    };
  }
  return {
    title: 'AI credit usage this month',
    body: `${value} credits used · View usage breakdown`,
    severity: 'low',
  };
}

/** Snapshot for a specific notification row (may differ from current Usage tab for warning/summary). */
export function getAiCreditsSnapshotForNotif(
  credits: WorkspaceAiCredits,
  variant: AiCreditNotifVariant,
): { used: number; limit: number } {
  if (variant === 'exceeded') {
    return { used: credits.limit, limit: credits.limit };
  }
  if (variant === 'warning') {
    const used = Math.min(credits.limit, Math.round(credits.limit * 0.9));
    return { used, limit: credits.limit };
  }
  return { used: credits.used, limit: credits.limit };
}
