/**
 * Shared notification settings (MVP) — persisted for prototype;
 * inbox filter reads the same snapshot for pillar alignment + muted UI.
 */

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

export const THROTTLE_OPTIONS = ['5 min', '10 min', '15 min', '30 min', '60 min'] as const;
export type ThrottleInterval = (typeof THROTTLE_OPTIONS)[number];

export const NOTIF_SETTINGS_STORAGE_KEY = 'torq:notification-settings-v1';
export const NOTIF_SETTINGS_SAVED_EVENT = 'torq:notif-settings-saved';

export type SavedNotificationSettings = {
  version: 1;
  criticalBypass: boolean;
  throttleInterval: string;
  channels: NotifChannelState;
};

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
    const parsed = JSON.parse(raw) as Partial<SavedNotificationSettings>;
    if (parsed.version !== 1 || !parsed.channels || typeof parsed.criticalBypass !== 'boolean') return null;
    return {
      version: 1,
      criticalBypass: parsed.criticalBypass,
      throttleInterval: typeof parsed.throttleInterval === 'string' ? parsed.throttleInterval : '10 min',
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

export function getInitialNotificationSettingsState(): {
  criticalBypass: boolean;
  throttleInterval: ThrottleInterval;
  channels: NotifChannelState;
} {
  const s = loadSavedNotificationSettings();
  if (!s) {
    return { criticalBypass: true, throttleInterval: '10 min', channels: buildDefaultNotifChannels() };
  }
  const throttle: ThrottleInterval = THROTTLE_OPTIONS.includes(s.throttleInterval as ThrottleInterval)
    ? (s.throttleInterval as ThrottleInterval)
    : '10 min';
  return {
    criticalBypass: s.criticalBypass,
    throttleInterval: throttle,
    channels: s.channels,
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
  const throttleRaw = saved?.throttleInterval ?? '10 min';
  const throttle: string = THROTTLE_OPTIONS.includes(throttleRaw as ThrottleInterval) ? throttleRaw : '10 min';
  saveNotificationSettings({
    version: 1,
    criticalBypass: saved?.criticalBypass ?? true,
    throttleInterval: throttle,
    channels,
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIF_SETTINGS_SAVED_EVENT));
  }
}
