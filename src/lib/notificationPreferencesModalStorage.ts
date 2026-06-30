/** Notification preference table borders (inside + outside) */
export const NOTIF_TABLE_BORDER_CLASS = 'border-[#DDDEE5]';
export const NOTIF_TABLE_OUTER_BORDER_CLASS = '!border-[#DDDEE5]';

export type NotifPrefCategoryId =
  | 'workflows'
  | 'cases'
  | 'case-exports'
  | 'ai-credits'
  | 'sharing'
  | 'invitation';

export type NotifPrefChannelKey = 'inapp' | 'email';

export type NotifPrefChannelDef = {
  defaultOn: boolean;
  locked: boolean;
};

export type NotifPrefCategoryDef = {
  id: NotifPrefCategoryId;
  label: string;
  description: string;
  inapp: NotifPrefChannelDef;
  email: NotifPrefChannelDef;
};

export type NotifPrefUserState = Record<
  NotifPrefCategoryId,
  Record<NotifPrefChannelKey, boolean>
>;

export type NotifPrefPolicyChannel = {
  enabled: boolean;
  locked: boolean;
};

export type NotifPrefWorkspacePolicy = Record<
  NotifPrefCategoryId,
  Record<NotifPrefChannelKey, NotifPrefPolicyChannel>
>;

/** Same shape as workspace policy; used for org-wide defaults. */
export type NotifPrefOrgPolicy = NotifPrefWorkspacePolicy;

export const NOTIF_PREF_CATEGORIES: NotifPrefCategoryDef[] = [
  {
    id: 'workflows',
    label: 'Workflows',
    description: 'Workflow run failures and publish/approval requests.',
    inapp: { defaultOn: true, locked: false },
    email: { defaultOn: true, locked: false },
  },
  {
    id: 'cases',
    label: 'Cases',
    description: '@Mentions on cases assigned to you.',
    inapp: { defaultOn: true, locked: false },
    email: { defaultOn: true, locked: false },
  },
  {
    id: 'case-exports',
    label: 'Case Exports',
    description: 'Data export ready, failed, or file-too-large notices.',
    inapp: { defaultOn: true, locked: false },
    email: { defaultOn: true, locked: false },
  },
  {
    id: 'ai-credits',
    label: 'AI Credits & Licensing',
    description: 'AI credit limit exceeded, approaching, and monthly usage reports.',
    inapp: { defaultOn: true, locked: false },
    email: { defaultOn: true, locked: false },
  },
  {
    id: 'sharing',
    label: 'Sharing & Collaboration',
    description: 'Shared resource access approved, denied, or revoked for your workspace.',
    inapp: { defaultOn: true, locked: false },
    email: { defaultOn: true, locked: false },
  },
  {
    id: 'invitation',
    label: 'Invitation',
    description: 'Organization and account invitations. Torq users only.',
    inapp: { defaultOn: true, locked: false },
    email: { defaultOn: true, locked: false },
  },
];

export const NOTIF_PREF_ENFORCED_TOOLTIP =
  'This setting is enforced by your workspace admin.';

const USER_STORAGE_KEY = 'torq-notification-preferences-modal-v2';
const WORKSPACE_POLICY_STORAGE_KEY = 'torq-workspace-notification-policy-v2';
const ORG_POLICY_STORAGE_KEY = 'torq-org-notification-policy-v2';

export const WORKSPACE_NOTIF_POLICY_SAVED_EVENT = 'torq:workspace-notif-policy-saved';
export const ORG_NOTIF_POLICY_SAVED_EVENT = 'torq:org-notif-policy-saved';

export function buildDefaultWorkspaceNotifPolicy(): NotifPrefWorkspacePolicy {
  return Object.fromEntries(
    NOTIF_PREF_CATEGORIES.map((cat) => [
      cat.id,
      {
        inapp: { enabled: cat.inapp.defaultOn, locked: cat.inapp.locked },
        email: { enabled: cat.email.defaultOn, locked: cat.email.locked },
      },
    ]),
  ) as NotifPrefWorkspacePolicy;
}

export function loadWorkspaceNotifPolicy(): NotifPrefWorkspacePolicy {
  const defaults = buildDefaultWorkspaceNotifPolicy();
  if (typeof window === 'undefined') return defaults;

  try {
    const raw = window.localStorage.getItem(WORKSPACE_POLICY_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<NotifPrefWorkspacePolicy>;
    return mergePolicyWithDefaults(parsed, defaults);
  } catch {
    return defaults;
  }
}

export function saveWorkspaceNotifPolicy(policy: NotifPrefWorkspacePolicy): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(WORKSPACE_POLICY_STORAGE_KEY, JSON.stringify(policy));
    window.dispatchEvent(new CustomEvent(WORKSPACE_NOTIF_POLICY_SAVED_EVENT));
  } catch {
    /* ignore */
  }
}

function mergePolicyWithDefaults(
  parsed: Partial<NotifPrefWorkspacePolicy>,
  defaults: NotifPrefWorkspacePolicy,
): NotifPrefWorkspacePolicy {
  const merged = { ...defaults };
  for (const cat of NOTIF_PREF_CATEGORIES) {
    const saved = parsed[cat.id];
    if (!saved) continue;
    for (const channel of ['inapp', 'email'] as const) {
      const savedChannel = saved[channel];
      if (
        savedChannel &&
        typeof savedChannel.enabled === 'boolean' &&
        typeof savedChannel.locked === 'boolean'
      ) {
        merged[cat.id][channel] = savedChannel;
      }
    }
  }
  return merged;
}

export function loadOrgNotifPolicy(): NotifPrefOrgPolicy {
  const defaults = buildDefaultWorkspaceNotifPolicy();
  if (typeof window === 'undefined') return defaults;

  try {
    const raw = window.localStorage.getItem(ORG_POLICY_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<NotifPrefOrgPolicy>;
    return mergePolicyWithDefaults(parsed, defaults);
  } catch {
    return defaults;
  }
}

export function saveOrgNotifPolicy(policy: NotifPrefOrgPolicy): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ORG_POLICY_STORAGE_KEY, JSON.stringify(policy));
    window.dispatchEvent(new CustomEvent(ORG_NOTIF_POLICY_SAVED_EVENT));
  } catch {
    /* ignore */
  }
}

export function isWorkspaceChannelLocked(
  policy: NotifPrefWorkspacePolicy,
  id: NotifPrefCategoryId,
  channel: NotifPrefChannelKey,
): boolean {
  return policy[id][channel].locked;
}

export function buildDefaultNotifPrefUserState(): NotifPrefUserState {
  const policy = buildDefaultWorkspaceNotifPolicy();
  return Object.fromEntries(
    NOTIF_PREF_CATEGORIES.map((cat) => [
      cat.id,
      {
        inapp: policy[cat.id].inapp.enabled,
        email: policy[cat.id].email.enabled,
      },
    ]),
  ) as NotifPrefUserState;
}

export function loadNotifPrefUserState(): NotifPrefUserState {
  const policy = loadWorkspaceNotifPolicy();
  const defaults = buildDefaultNotifPrefUserState();
  if (typeof window === 'undefined') return defaults;

  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      return mergeUserStateWithPolicy(defaults, policy);
    }
    const parsed = JSON.parse(raw) as Partial<NotifPrefUserState>;
    const merged = { ...defaults };
    for (const cat of NOTIF_PREF_CATEGORIES) {
      const saved = parsed[cat.id];
      if (!saved) continue;
      if (!policy[cat.id].inapp.locked && typeof saved.inapp === 'boolean') {
        merged[cat.id].inapp = saved.inapp;
      }
      if (!policy[cat.id].email.locked && typeof saved.email === 'boolean') {
        merged[cat.id].email = saved.email;
      }
    }
    return mergeUserStateWithPolicy(merged, policy);
  } catch {
    return mergeUserStateWithPolicy(defaults, policy);
  }
}

function mergeUserStateWithPolicy(
  state: NotifPrefUserState,
  policy: NotifPrefWorkspacePolicy,
): NotifPrefUserState {
  const next = { ...state };
  for (const cat of NOTIF_PREF_CATEGORIES) {
    next[cat.id] = { ...next[cat.id] };
    if (policy[cat.id].inapp.locked) {
      next[cat.id].inapp = policy[cat.id].inapp.enabled;
    }
    if (policy[cat.id].email.locked) {
      next[cat.id].email = policy[cat.id].email.enabled;
    }
  }
  return next;
}

export function saveNotifPrefUserState(state: NotifPrefUserState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}
