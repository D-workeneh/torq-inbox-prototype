import {
  getAiCreditsMetricHint,
  getAiCreditsMetricValue,
  getWorkspaceAiCredits,
} from '@/lib/workspaceAiCredits';

export interface WorkspaceMetric {
  id: string;
  label: string;
  value: string;
  /** Opens AI credit usage when set */
  action?: 'ai-credits';
  /** Optional subtext under the value */
  hint?: string;
  progress?: { used: number; limit: number };
}

export interface WorkspaceOwner {
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
}

export interface WorkspaceUsageSnapshot {
  id: string;
  name: string;
  color: string;
  plan: string;
  metrics: WorkspaceMetric[];
  owners: WorkspaceOwner[];
}

const TORQ_DEV_USAGE: WorkspaceUsageSnapshot = {
  id: 'torq-dev',
  name: 'torq-dev',
  color: '#2864FF',
  plan: 'Enterprise',
  metrics: [
    { id: 'workflows', label: 'Workflows', value: '47' },
    { id: 'nested', label: 'Nested workflows', value: '8' },
    { id: 'cases', label: 'Open cases', value: '124' },
    { id: 'runners', label: 'Runners', value: '6', hint: '4 active now' },
    { id: 'editors', label: 'Workflow editors', value: '12' },
    { id: 'operators', label: 'Case operators', value: '9' },
    (() => {
      const ai = getWorkspaceAiCredits('torq-dev');
      return {
        id: 'ai',
        label: 'AI credits',
        value: getAiCreditsMetricValue(ai),
        hint: getAiCreditsMetricHint(ai),
        action: 'ai-credits' as const,
        progress: { used: ai.used, limit: ai.limit },
      };
    })(),
  ],
  owners: [
    {
      name: 'Omer Efrat',
      email: 'omer.efrat@torq.io',
      initials: 'OE',
      avatarUrl:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face&auto=format',
    },
    {
      name: 'David Workeneh',
      email: 'david@torq.io',
      initials: 'DW',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face&auto=format',
    },
  ],
};

/** Display name override for settings usage (sidebar id → product workspace label) */
const WORKSPACE_DISPLAY_NAMES: Record<string, string> = {
  'torq-dev': 'torq-dev',
  'torq-staging': 'Genesis-Dev-58',
  'torq-prod': 'Pinnacle-Prod',
};

const USAGE_BY_WORKSPACE_ID: Record<string, WorkspaceUsageSnapshot> = {
  'torq-dev': TORQ_DEV_USAGE,
  'genesis-dev-28': { ...TORQ_DEV_USAGE, id: 'genesis-dev-28', name: 'Genesis-Dev-28', color: '#F5C842' },
  'torq-staging': {
    ...TORQ_DEV_USAGE,
    id: 'torq-staging',
    name: 'Genesis-Dev-58',
    color: '#9275FF',
    plan: 'Professional',
    metrics: TORQ_DEV_USAGE.metrics.map((m) =>
      m.id === 'workflows'
        ? { ...m, value: '31' }
        : m.id === 'cases'
          ? { ...m, value: '58' }
          : m.id === 'ai'
            ? (() => {
                const ai = getWorkspaceAiCredits('torq-staging');
                return {
                  ...m,
                  value: getAiCreditsMetricValue(ai),
                  progress: { used: ai.used, limit: ai.limit },
                  hint: getAiCreditsMetricHint(ai),
                };
              })()
            : m,
    ),
  },
  'torq-prod': {
    ...TORQ_DEV_USAGE,
    id: 'torq-prod',
    name: 'Pinnacle-Prod',
    color: '#EA231A',
    plan: 'Enterprise',
    metrics: TORQ_DEV_USAGE.metrics.map((m) =>
      m.id === 'workflows'
        ? { ...m, value: '186' }
        : m.id === 'cases'
          ? { ...m, value: '412' }
          : m.id === 'ai'
            ? (() => {
                const ai = getWorkspaceAiCredits('torq-prod');
                return {
                  ...m,
                  value: getAiCreditsMetricValue(ai),
                  progress: { used: ai.used, limit: ai.limit },
                  hint: getAiCreditsMetricHint(ai),
                };
              })()
            : m,
    ),
  },
};

export function getWorkspaceUsage(
  workspaceId: string,
  displayName?: string,
): WorkspaceUsageSnapshot {
  const base = USAGE_BY_WORKSPACE_ID[workspaceId] ?? TORQ_DEV_USAGE;
  const name =
    displayName ?? WORKSPACE_DISPLAY_NAMES[workspaceId] ?? base.name;
  return { ...base, id: workspaceId, name };
}
