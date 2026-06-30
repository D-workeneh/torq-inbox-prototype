'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  SettingsBlockTitle,
  SettingsCard,
} from './SettingsPrimitives';
import {
  ALL_NOTIF_TOPIC_IDS,
  NOTIFICATION_MVP_GROUPS,
  NOTIF_SETTINGS_SAVED_EVENT,
  getInitialNotificationSettingsState,
  getWorkspaceSavedState,
  loadSavedNotificationSettings,
  saveNotificationSettings,
  type ChannelKey,
  type NotifChannelState,
  type NotifTopicId,
  type SavedNotificationSettings,
} from '@/lib/notificationSettingsStorage';
import { NOTIF_TABLE_BORDER_CLASS, NOTIF_TABLE_OUTER_BORDER_CLASS } from '@/lib/notificationPreferencesModalStorage';
import {
  ORG_NOTIF_SETTINGS_SAVED_EVENT,
  getOrgNotificationSettingsState,
  loadOrgNotificationSettings,
  saveOrgNotificationSettings,
  type SavedOrgNotificationSettings,
} from '@/lib/orgNotificationSettingsStorage';

const CHANNEL_GRID = 'grid grid-cols-[minmax(0,1fr)_80px_80px] items-center';

type SettingsTab = 'my-preferences' | 'workspace-policy';

export type NotificationSettingsScope = 'workspace' | 'organization';

function ChannelCheckboxCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-[80px] items-center justify-center justify-self-center">
      {children}
    </div>
  );
}

function ChannelHeaderCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <ChannelCheckboxCell>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[length:var(--font-size-body2)] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
          {label}
        </span>
        {children}
      </div>
    </ChannelCheckboxCell>
  );
}

function SettingsTabs({
  active,
  onChange,
}: {
  active: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}) {
  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'my-preferences', label: 'My preferences' },
    { id: 'workspace-policy', label: 'Workspace policy' },
  ];

  return (
    <div className="-mt-1 mb-8 flex gap-8 border-b border-[var(--border-level-1)]">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative -mb-px pb-3 text-[length:var(--font-size-body1)] transition-colors ${
              isActive
                ? 'font-semibold text-[var(--text-primary)]'
                : 'font-normal text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--text-primary)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function NotificationSettingsContent({
  scope = 'workspace',
}: {
  scope?: NotificationSettingsScope;
}) {
  const isOrg = scope === 'organization';
  const effective = getInitialNotificationSettingsState();
  const orgState = getOrgNotificationSettingsState();

  const [activeTab, setActiveTab] = useState<SettingsTab>('my-preferences');
  const [channels, setChannels] = useState<NotifChannelState>(() =>
    isOrg ? orgState.channels : effective.channels,
  );

  const showTabs = !isOrg;
  const isMyPreferences = showTabs && activeTab === 'my-preferences';

  function syncChannelsFromStorage() {
    if (isOrg) {
      setChannels(getOrgNotificationSettingsState().channels);
      return;
    }
    setChannels(getWorkspaceSavedState().channels);
  }

  useEffect(() => {
    function refreshFromStorage() {
      syncChannelsFromStorage();
    }

    window.addEventListener(NOTIF_SETTINGS_SAVED_EVENT, refreshFromStorage);
    window.addEventListener(ORG_NOTIF_SETTINGS_SAVED_EVENT, refreshFromStorage);
    return () => {
      window.removeEventListener(NOTIF_SETTINGS_SAVED_EVENT, refreshFromStorage);
      window.removeEventListener(ORG_NOTIF_SETTINGS_SAVED_EVENT, refreshFromStorage);
    };
  }, [isOrg]);

  useEffect(() => {
    if (isOrg) return;
    syncChannelsFromStorage();
  }, [activeTab, isOrg]);

  function persistWorkspace(payload: SavedNotificationSettings) {
    saveNotificationSettings(payload);
    window.dispatchEvent(new CustomEvent(NOTIF_SETTINGS_SAVED_EVENT));
  }

  function persistOrg(payload: SavedOrgNotificationSettings) {
    saveOrgNotificationSettings(payload);
  }

  function workspaceSmartGroupingSnapshot() {
    const ws = getWorkspaceSavedState();
    const existing = loadSavedNotificationSettings();
    return {
      smartGroupingOccurrences: ws.smartGroupingOccurrences,
      smartGroupingWindow: ws.smartGroupingWindow,
      smartGroupingLocked: ws.smartGroupingLocked,
      userSmartGroupingOccurrences:
        existing?.userSmartGroupingOccurrences ?? ws.userSmartGroupingOccurrences,
      userSmartGroupingWindow: existing?.userSmartGroupingWindow ?? ws.userSmartGroupingWindow,
    };
  }

  function orgSmartGroupingSnapshot() {
    const org = getOrgNotificationSettingsState();
    return {
      smartGroupingLocked: org.smartGroupingLocked,
      smartGroupingOccurrences: org.smartGroupingOccurrences,
      smartGroupingWindow: org.smartGroupingWindow,
    };
  }

  function persistChannels(next: NotifChannelState) {
    if (isOrg) {
      persistOrg({
        version: 1,
        enforced: loadOrgNotificationSettings()?.enforced ?? true,
        ...orgSmartGroupingSnapshot(),
        channels: next,
      });
      return;
    }

    persistWorkspace({
      version: 1,
      ...workspaceSmartGroupingSnapshot(),
      channels: next,
    });
  }

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initMap: Record<string, boolean> = {};
    NOTIFICATION_MVP_GROUPS.forEach((g) => {
      initMap[g.id] = false;
    });
    return initMap;
  });

  function itemMeta(id: NotifTopicId) {
    for (const g of NOTIFICATION_MVP_GROUPS) {
      const it = g.items.find((x) => x.id === id);
      if (it) return it;
    }
    return undefined;
  }

  function toggleChannel(topic: NotifTopicId, ch: ChannelKey) {
    const meta = itemMeta(topic);
    if (ch === 'inapp' && meta?.disableInApp) return;
    if (ch === 'email' && meta?.disableEmail) return;
    setChannels((prev) => {
      const next = { ...prev, [topic]: { ...prev[topic], [ch]: !prev[topic][ch] } };
      persistChannels(next);
      return next;
    });
  }

  function toggleGroupExpanded(groupId: string) {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  }

  function leafStatesForChannel(ch: ChannelKey) {
    return ALL_NOTIF_TOPIC_IDS.map((id) => {
      const m = itemMeta(id);
      if (ch === 'inapp' && m?.disableInApp) return null;
      if (ch === 'email' && m?.disableEmail) return null;
      return channels[id][ch];
    }).filter((v): v is boolean => v !== null);
  }

  function allLeafOn(ch: ChannelKey) {
    const s = leafStatesForChannel(ch);
    return s.length > 0 && s.every(Boolean);
  }

  function someLeafOn(ch: ChannelKey) {
    return leafStatesForChannel(ch).some(Boolean);
  }

  function setAllLeafChannel(ch: ChannelKey, value: boolean) {
    setChannels((prev) => {
      const next = { ...prev };
      ALL_NOTIF_TOPIC_IDS.forEach((id) => {
        const m = itemMeta(id);
        if (ch === 'inapp' && m?.disableInApp) return;
        if (ch === 'email' && m?.disableEmail) return;
        next[id] = { ...next[id], [ch]: value };
      });
      persistChannels(next);
      return next;
    });
  }

  function setGroupLeafChannel(groupId: string, ch: ChannelKey, value: boolean) {
    const grp = NOTIFICATION_MVP_GROUPS.find((g) => g.id === groupId);
    if (!grp) return;
    setChannels((prev) => {
      const next = { ...prev };
      grp.items.forEach((item) => {
        if (ch === 'inapp' && item.disableInApp) return;
        if (ch === 'email' && item.disableEmail) return;
        next[item.id] = { ...next[item.id], [ch]: value };
      });
      persistChannels(next);
      return next;
    });
  }

  function groupLeafStates(groupId: string, ch: ChannelKey) {
    const grp = NOTIFICATION_MVP_GROUPS.find((g) => g.id === groupId);
    if (!grp) return [];
    return grp.items
      .map((item) => {
        if (ch === 'inapp' && item.disableInApp) return null;
        if (ch === 'email' && item.disableEmail) return null;
        return channels[item.id][ch];
      })
      .filter((v): v is boolean => v !== null);
  }

  function groupAllOn(groupId: string, ch: ChannelKey) {
    const s = groupLeafStates(groupId, ch);
    if (s.length === 0) return false;
    return s.every(Boolean);
  }

  function groupSomeOn(groupId: string, ch: ChannelKey) {
    return groupLeafStates(groupId, ch).some(Boolean);
  }

  const channelDescription = isOrg
    ? 'Set default notification channels for all workspaces in your organization.'
    : isMyPreferences
      ? 'Choose how you want to be notified for workspace activity.'
      : 'Set default notification channels for everyone in this workspace.';

  return (
    <div className="w-full space-y-8 font-[family-name:var(--font-family)]">
      {isOrg && (
        <div className="rounded-xl border border-[var(--color-primary-100)] bg-[var(--color-primary-50)] px-4 py-3 text-[length:var(--font-size-body2)] text-[var(--color-text-secondary)]">
          Organization policies cascade to all workspaces and users. Workspace admins and individual users inherit these settings.
        </div>
      )}

      {showTabs && <SettingsTabs active={activeTab} onChange={setActiveTab} />}

      <section>
        <SettingsBlockTitle title="Notification channels" description={channelDescription} />

        <SettingsCard className={NOTIF_TABLE_OUTER_BORDER_CLASS}>
          <div
            className={`${CHANNEL_GRID} border-b ${NOTIF_TABLE_BORDER_CLASS} bg-[var(--bg-static-2)] px-4 py-2.5`}
          >
            <span className="text-[length:var(--font-size-body2)] font-semibold text-[var(--text-tertiary)]">
              Notify me about
            </span>
            <ChannelHeaderCell label="In-App">
              <Checkbox
                checked={allLeafOn('inapp')}
                indeterminate={!allLeafOn('inapp') && someLeafOn('inapp')}
                onChange={() => setAllLeafChannel('inapp', !allLeafOn('inapp'))}
                size="sm"
                aria-label="Select all in-app notifications"
              />
            </ChannelHeaderCell>
            <ChannelHeaderCell label="Email">
              <Checkbox
                checked={allLeafOn('email')}
                indeterminate={!allLeafOn('email') && someLeafOn('email')}
                onChange={() => setAllLeafChannel('email', !allLeafOn('email'))}
                size="sm"
                aria-label="Select all email notifications"
              />
            </ChannelHeaderCell>
          </div>

          {NOTIFICATION_MVP_GROUPS.map((grp, gi) => {
            const open = expandedGroups[grp.id];
            const isLastGroup = gi === NOTIFICATION_MVP_GROUPS.length - 1;
            return (
              <div key={grp.id}>
                <div
                  className={`${CHANNEL_GRID} border-b ${NOTIF_TABLE_BORDER_CLASS} bg-[var(--bg-static-3)] px-4 py-2.5`}
                >
                  <button
                    type="button"
                    onClick={() => toggleGroupExpanded(grp.id)}
                    className="flex min-w-0 items-center gap-2 rounded-[var(--radius-sm)] py-1 pl-1 text-left transition-colors hover:bg-[var(--bg-hover-level-1)]"
                  >
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 text-[var(--text-tertiary)] transition-transform ${open ? 'rotate-90' : ''}`}
                    />
                    <span className="text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)]">
                      {grp.label}
                    </span>
                  </button>
                  <ChannelCheckboxCell>
                    <Checkbox
                      checked={groupAllOn(grp.id, 'inapp')}
                      indeterminate={!groupAllOn(grp.id, 'inapp') && groupSomeOn(grp.id, 'inapp')}
                      onChange={() => setGroupLeafChannel(grp.id, 'inapp', !groupAllOn(grp.id, 'inapp'))}
                      size="sm"
                      aria-label={`${grp.label} — toggle all in-app`}
                    />
                  </ChannelCheckboxCell>
                  <ChannelCheckboxCell>
                    <Checkbox
                      checked={groupAllOn(grp.id, 'email')}
                      indeterminate={!groupAllOn(grp.id, 'email') && groupSomeOn(grp.id, 'email')}
                      onChange={() => setGroupLeafChannel(grp.id, 'email', !groupAllOn(grp.id, 'email'))}
                      size="sm"
                      aria-label={`${grp.label} — toggle all email`}
                    />
                  </ChannelCheckboxCell>
                </div>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      {grp.items.map((item, ii) => (
                        <div
                          key={item.id}
                          className={`${CHANNEL_GRID} border-b ${NOTIF_TABLE_BORDER_CLASS} px-4 py-3.5 transition-colors last:border-b-0 hover:bg-[var(--bg-hover-level-1)] ${
                            ii === grp.items.length - 1 && isLastGroup ? 'border-b-0' : ''
                          }`}
                        >
                          <div className="min-w-0 pl-7">
                            <p className="text-[length:var(--font-size-body1)] font-medium text-[var(--text-primary)]">
                              {item.label}
                            </p>
                            {item.description && (
                              <p className="mt-0.5 text-[length:var(--font-size-body2)] leading-relaxed text-[var(--text-tertiary)]">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <ChannelCheckboxCell>
                            <Checkbox
                              checked={channels[item.id].inapp}
                              disabled={item.disableInApp}
                              onChange={() => toggleChannel(item.id, 'inapp')}
                              size="sm"
                              aria-label={`${item.label} — in-app`}
                            />
                          </ChannelCheckboxCell>
                          <ChannelCheckboxCell>
                            <Checkbox
                              checked={channels[item.id].email}
                              disabled={item.disableEmail}
                              onChange={() => toggleChannel(item.id, 'email')}
                              size="sm"
                              aria-label={`${item.label} — email`}
                            />
                          </ChannelCheckboxCell>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </SettingsCard>
      </section>
    </div>
  );
}
