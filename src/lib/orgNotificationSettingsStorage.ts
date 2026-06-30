import {
  NOTIF_SETTINGS_SAVED_EVENT,
  buildDefaultNotifChannels,
  mergeChannelsWithDefaults,
  normalizeSmartGroupingOccurrences,
  normalizeSmartGroupingWindow,
  type NotifChannelState,
  type SavedNotificationSettings,
  type SmartGroupingOccurrences,
  type SmartGroupingWindow,
} from '@/lib/notificationSettingsStorage';

export const ORG_NOTIF_SETTINGS_STORAGE_KEY = 'torq:org-notification-settings-v1';
export const ORG_NOTIF_SETTINGS_SAVED_EVENT = 'torq:org-notif-settings-saved';

export type SavedOrgNotificationSettings = SavedNotificationSettings & {
  enforced: boolean;
  smartGroupingLocked?: boolean;
};

export function loadOrgNotificationSettings(): SavedOrgNotificationSettings | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ORG_NOTIF_SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedOrgNotificationSettings>;
    if (parsed.version !== 1 || !parsed.channels) return null;
    return {
      version: 1,
      enforced: parsed.enforced !== false,
      smartGroupingLocked: parsed.smartGroupingLocked === true || parsed.enforced === true,
      smartGroupingOccurrences: normalizeSmartGroupingOccurrences(parsed.smartGroupingOccurrences),
      smartGroupingWindow: normalizeSmartGroupingWindow(parsed.smartGroupingWindow),
      channels: mergeChannelsWithDefaults(parsed.channels as Partial<NotifChannelState>),
    };
  } catch {
    return null;
  }
}

export function saveOrgNotificationSettings(data: SavedOrgNotificationSettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ORG_NOTIF_SETTINGS_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(ORG_NOTIF_SETTINGS_SAVED_EVENT));
    window.dispatchEvent(new CustomEvent(NOTIF_SETTINGS_SAVED_EVENT));
  } catch {
    /* ignore */
  }
}

export function getOrgNotificationSettingsState(): {
  smartGroupingOccurrences: SmartGroupingOccurrences;
  smartGroupingWindow: SmartGroupingWindow;
  smartGroupingLocked: boolean;
  channels: NotifChannelState;
  enforced: boolean;
} {
  const org = loadOrgNotificationSettings();
  if (!org) {
    return {
      smartGroupingOccurrences: '3',
      smartGroupingWindow: '5 minutes',
      smartGroupingLocked: false,
      channels: buildDefaultNotifChannels(),
      enforced: false,
    };
  }
  return {
    smartGroupingOccurrences: org.smartGroupingOccurrences as SmartGroupingOccurrences,
    smartGroupingWindow: org.smartGroupingWindow as SmartGroupingWindow,
    smartGroupingLocked: org.smartGroupingLocked === true,
    channels: org.channels,
    enforced: org.enforced,
  };
}

export function hasOrgNotificationPolicy(): boolean {
  return loadOrgNotificationSettings() !== null;
}
