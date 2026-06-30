/**
 * Shared notification settings (MVP) — persisted for prototype;
 * inbox filter reads the same snapshot for pillar alignment + muted UI.
 */

import {
  loadOrgNotificationSettings,
} from '@/lib/orgNotificationSettingsStorage';

export type NotifPillar = 'platform' | 'hypersoc' | 'hyperautomation' | 'socrates';

export type ChannelKey = 'inapp' | 'email';

export type NotifTopicId =
  | 'plat-maintenance'
  | 'plat-product'
  | 'soc-queue'
  | 'soc-escalation'
  | 'auto-failed'
  | 'auto-runner'
  | 'auto-template'
  | 'auto-success'
  | 'soc-ai-approval'
  | 'soc-ai-task'
  | 'soc-ai-confidence';

export type NotifChannelState = Record<NotifTopicId, Record<ChannelKey, boolean>>;

export type NotifChannelItem = {
  id: NotifTopicId;
  label: string;
  description?: string;
  disableInApp?: boolean;
  disableEmail?: boolean;
};

export const NOTIFICATION_MVP_GROUPS: { id: NotifPillar; label: string; items: NotifChannelItem[] }[] = [
  {
    id: 'platform',
    label: 'Platform',
    items: [
      { id: 'plat-maintenance', label: 'Scheduled maintenance', description: 'Advance notice for planned downtime and upgrades.' },
      { id: 'plat-product', label: 'Product announcements', description: 'New features and important product updates.' },
    ],
  },
  {
    id: 'hypersoc',
    label: 'HyperSOC',
    items: [
      { id: 'soc-queue', label: 'Queue assignments', description: 'When a case or queue item is assigned to you.' },
      { id: 'soc-escalation', label: 'Escalations', description: 'When an incident is escalated or severity changes.' },
    ],
  },
  {
    id: 'hyperautomation',
    label: 'Hyperautomation',
    items: [
      { id: 'auto-failed', label: 'Failed executions', description: 'Workflow runs that failed to complete.', disableInApp: true, disableEmail: true },
      { id: 'auto-runner', label: 'Runner health', description: 'Alerts when a runner goes offline or degrades.', disableInApp: true, disableEmail: true },
      { id: 'auto-template', label: 'Template updates', description: 'When a shared template you use is updated.' },
      { id: 'auto-success', label: 'Successful completions', description: 'When long-running workflows finish successfully.' },
    ],
  },
  {
    id: 'socrates',
    label: 'Socrates AI',
    items: [
      { id: 'soc-ai-approval', label: 'Approval requests', description: 'When Socrates needs your sign-off on an action.' },
      { id: 'soc-ai-task', label: 'Task completions', description: 'When an automated Socrates task finishes.' },
      { id: 'soc-ai-confidence', label: 'Confidence alerts', description: 'When confidence drops below your threshold.' },
    ],
  },
];

export const ALL_NOTIF_TOPIC_IDS: NotifTopicId[] = NOTIFICATION_MVP_GROUPS.flatMap((g) => g.items.map((i) => i.id));

export function buildDefaultNotifChannels(): NotifChannelState {
  const state = {} as Partial<NotifChannelState>;
  NOTIFICATION_MVP_GROUPS.forEach((g) =>
    g.items.forEach((item) => {
      const emailOn = !item.disableEmail && (item.id.startsWith('plat') || item.id === 'soc-ai-approval' || item.id === 'soc-queue');
      const inappOn = !item.disableInApp;
      state[item.id] = { inapp: inappOn, email: emailOn };
    }),
  );
  return state as NotifChannelState;
}

export const SMART_GROUPING_OCCURRENCE_OPTIONS = ['2', '3', '4', '5'] as const;
export type SmartGroupingOccurrences = (typeof SMART_GROUPING_OCCURRENCE_OPTIONS)[number];

export const SMART_GROUPING_WINDOW_OPTIONS = [
  '5 minutes',
  '10 minutes',
  '15 minutes',
  '30 minutes',
  '60 minutes',
] as const;
export type SmartGroupingWindow = (typeof SMART_GROUPING_WINDOW_OPTIONS)[number];

/** @deprecated Legacy throttle labels — migrated to smart grouping window */
export const THROTTLE_OPTIONS = ['5 min', '10 min', '15 min', '30 min', '60 min'] as const;
export type ThrottleInterval = (typeof THROTTLE_OPTIONS)[number];

const LEGACY_THROTTLE_TO_WINDOW: Record<string, SmartGroupingWindow> = {
  '5 min': '5 minutes',
  '10 min': '10 minutes',
  '15 min': '15 minutes',
  '30 min': '30 minutes',
  '60 min': '60 minutes',
};

export const NOTIF_SETTINGS_STORAGE_KEY = 'torq:notification-settings-v1';
export const NOTIF_SETTINGS_SAVED_EVENT = 'torq:notif-settings-saved';

export type SavedNotificationSettings = {
  version: 1;
  smartGroupingOccurrences: string;
  smartGroupingWindow: string;
  /** When true, end users cannot change smart grouping on My preferences */
  smartGroupingLocked?: boolean;
  userSmartGroupingOccurrences?: string;
  userSmartGroupingWindow?: string;
  channels: NotifChannelState;
};

export function normalizeSmartGroupingOccurrences(value: unknown): SmartGroupingOccurrences {
  const str = typeof value === 'string' ? value : '3';
  return SMART_GROUPING_OCCURRENCE_OPTIONS.includes(str as SmartGroupingOccurrences)
    ? (str as SmartGroupingOccurrences)
    : '3';
}

export function normalizeSmartGroupingWindow(value: unknown, legacyThrottle?: unknown): SmartGroupingWindow {
  if (typeof value === 'string' && SMART_GROUPING_WINDOW_OPTIONS.includes(value as SmartGroupingWindow)) {
    return value as SmartGroupingWindow;
  }
  if (typeof legacyThrottle === 'string' && LEGACY_THROTTLE_TO_WINDOW[legacyThrottle]) {
    return LEGACY_THROTTLE_TO_WINDOW[legacyThrottle];
  }
  return '5 minutes';
}

export function mergeChannelsWithDefaults(partial: Partial<NotifChannelState> | undefined): NotifChannelState {
  const base = buildDefaultNotifChannels();
  if (!partial) return base;
  const out = { ...base };
  (Object.keys(base) as NotifTopicId[]).forEach((id) => {
    const p = partial[id];
    if (p && typeof p.inapp === 'boolean' && typeof p.email === 'boolean') {
      out[id] = { inapp: p.inapp, email: p.email };
    }
  });
  return out;
}

export function loadSavedNotificationSettings(): SavedNotificationSettings | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(NOTIF_SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedNotificationSettings> & {
      criticalBypass?: boolean;
      throttleInterval?: string;
    };
    if (parsed.version !== 1 || !parsed.channels) return null;
    return {
      version: 1,
      smartGroupingOccurrences: normalizeSmartGroupingOccurrences(parsed.smartGroupingOccurrences),
      smartGroupingWindow: normalizeSmartGroupingWindow(
        parsed.smartGroupingWindow,
        parsed.throttleInterval,
      ),
      smartGroupingLocked: parsed.smartGroupingLocked === true,
      userSmartGroupingOccurrences: parsed.userSmartGroupingOccurrences
        ? normalizeSmartGroupingOccurrences(parsed.userSmartGroupingOccurrences)
        : undefined,
      userSmartGroupingWindow: parsed.userSmartGroupingWindow
        ? normalizeSmartGroupingWindow(parsed.userSmartGroupingWindow)
        : undefined,
      channels: mergeChannelsWithDefaults(parsed.channels as Partial<NotifChannelState>),
    };
  } catch {
    return null;
  }
}

export function saveNotificationSettings(data: SavedNotificationSettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(NOTIF_SETTINGS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function getWorkspaceSavedState(): {
  smartGroupingOccurrences: SmartGroupingOccurrences;
  smartGroupingWindow: SmartGroupingWindow;
  smartGroupingLocked: boolean;
  userSmartGroupingOccurrences: SmartGroupingOccurrences;
  userSmartGroupingWindow: SmartGroupingWindow;
  channels: NotifChannelState;
} {
  const s = loadSavedNotificationSettings();
  if (!s) {
    return {
      smartGroupingOccurrences: '3',
      smartGroupingWindow: '5 minutes',
      smartGroupingLocked: false,
      userSmartGroupingOccurrences: '3',
      userSmartGroupingWindow: '5 minutes',
      channels: buildDefaultNotifChannels(),
    };
  }
  const policyOccurrences = normalizeSmartGroupingOccurrences(s.smartGroupingOccurrences);
  const policyWindow = normalizeSmartGroupingWindow(s.smartGroupingWindow);
  return {
    smartGroupingOccurrences: policyOccurrences,
    smartGroupingWindow: policyWindow,
    smartGroupingLocked: s.smartGroupingLocked === true,
    userSmartGroupingOccurrences: normalizeSmartGroupingOccurrences(
      s.userSmartGroupingOccurrences ?? s.smartGroupingOccurrences,
    ),
    userSmartGroupingWindow: normalizeSmartGroupingWindow(
      s.userSmartGroupingWindow ?? s.smartGroupingWindow,
    ),
    channels: s.channels,
  };
}

export type SmartGroupingLockSource = 'organization' | 'workspace' | null;

export type SmartGroupingViewState = {
  occurrences: SmartGroupingOccurrences;
  window: SmartGroupingWindow;
  valuesReadOnly: boolean;
  lockEngaged: boolean;
  canToggleLock: boolean;
  lockInheritedFrom: SmartGroupingLockSource;
};

function resolveOrgSmartGrouping() {
  const org = loadOrgNotificationSettings();
  if (!org) return null;
  return {
    occurrences: normalizeSmartGroupingOccurrences(org.smartGroupingOccurrences),
    window: normalizeSmartGroupingWindow(org.smartGroupingWindow),
    locked: org.smartGroupingLocked === true,
  };
}

/** Workspace policy tab — workspace admin view */
export function getWorkspacePolicySmartGroupingState(): SmartGroupingViewState {
  const ws = getWorkspaceSavedState();
  const org = resolveOrgSmartGrouping();

  if (org?.locked) {
    return {
      occurrences: org.occurrences,
      window: org.window,
      valuesReadOnly: true,
      lockEngaged: true,
      canToggleLock: false,
      lockInheritedFrom: 'organization',
    };
  }

  if (org) {
    return {
      occurrences: ws.smartGroupingOccurrences,
      window: ws.smartGroupingWindow,
      valuesReadOnly: false,
      lockEngaged: ws.smartGroupingLocked,
      canToggleLock: true,
      lockInheritedFrom: null,
    };
  }

  return {
    occurrences: ws.smartGroupingOccurrences,
    window: ws.smartGroupingWindow,
    valuesReadOnly: false,
    lockEngaged: ws.smartGroupingLocked,
    canToggleLock: true,
    lockInheritedFrom: null,
  };
}

/** My preferences tab — end user view */
export function getUserSmartGroupingState(): SmartGroupingViewState {
  const ws = getWorkspaceSavedState();
  const org = resolveOrgSmartGrouping();

  if (org?.locked) {
    return {
      occurrences: org.occurrences,
      window: org.window,
      valuesReadOnly: true,
      lockEngaged: true,
      canToggleLock: false,
      lockInheritedFrom: 'organization',
    };
  }

  if (ws.smartGroupingLocked) {
    return {
      occurrences: ws.smartGroupingOccurrences,
      window: ws.smartGroupingWindow,
      valuesReadOnly: true,
      lockEngaged: true,
      canToggleLock: false,
      lockInheritedFrom: 'workspace',
    };
  }

  return {
    occurrences: ws.userSmartGroupingOccurrences,
    window: ws.userSmartGroupingWindow,
    valuesReadOnly: false,
    lockEngaged: false,
    canToggleLock: false,
    lockInheritedFrom: null,
  };
}

/** Organization admin view */
export function getOrgSmartGroupingState(): SmartGroupingViewState {
  const org = resolveOrgSmartGrouping();
  const occurrences = org?.occurrences ?? '3';
  const window = org?.window ?? '5 minutes';
  return {
    occurrences,
    window,
    valuesReadOnly: false,
    lockEngaged: org?.locked ?? false,
    canToggleLock: true,
    lockInheritedFrom: null,
  };
}

/** User/workspace settings — org policy cascades into smart grouping + workspace policy channels */
export function getInitialNotificationSettingsState(): {
  smartGroupingOccurrences: SmartGroupingOccurrences;
  smartGroupingWindow: SmartGroupingWindow;
  channels: NotifChannelState;
  orgPolicyActive: boolean;
} {
  const ws = getWorkspaceSavedState();
  const org = loadOrgNotificationSettings();
  if (!org) {
    return { ...ws, orgPolicyActive: false };
  }
  return {
    smartGroupingOccurrences: normalizeSmartGroupingOccurrences(org.smartGroupingOccurrences),
    smartGroupingWindow: normalizeSmartGroupingWindow(org.smartGroupingWindow),
    channels: org.enforced ? org.channels : mergeChannelsWithDefaults({ ...org.channels, ...ws.channels }),
    orgPolicyActive: true,
  };
}

export function pillarInAppDelivering(channels: NotifChannelState, pillarId: NotifPillar): boolean {
  const grp = NOTIFICATION_MVP_GROUPS.find((g) => g.id === pillarId);
  if (!grp) return true;
  return grp.items.some((item) => !item.disableInApp && channels[item.id]?.inapp === true);
}

export function enablePillarInApp(channels: NotifChannelState, pillarId: NotifPillar): NotifChannelState {
  const grp = NOTIFICATION_MVP_GROUPS.find((g) => g.id === pillarId);
  if (!grp) return channels;
  const next = { ...channels };
  for (const item of grp.items) {
    if (!item.disableInApp) {
      next[item.id] = { ...next[item.id], inapp: true };
    }
  }
  return next;
}

export function saveQuickEnablePillar(pillarId: NotifPillar): void {
  const saved = loadSavedNotificationSettings();
  const base = mergeChannelsWithDefaults(saved?.channels);
  const channels = enablePillarInApp(base, pillarId);
  saveNotificationSettings({
    version: 1,
    smartGroupingOccurrences: saved?.smartGroupingOccurrences ?? '3',
    smartGroupingWindow: saved?.smartGroupingWindow ?? '5 minutes',
    smartGroupingLocked: saved?.smartGroupingLocked,
    userSmartGroupingOccurrences: saved?.userSmartGroupingOccurrences,
    userSmartGroupingWindow: saved?.userSmartGroupingWindow,
    channels,
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIF_SETTINGS_SAVED_EVENT));
  }
}
