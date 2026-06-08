'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import {
  SettingsBlockTitle,
  SettingsCard,
  SettingsCardBody,
  SettingsCardRow,
  SettingsEyebrow,
} from './SettingsPrimitives';
import {
  ALL_NOTIF_TOPIC_IDS,
  NOTIFICATION_MVP_GROUPS,
  NOTIF_SETTINGS_SAVED_EVENT,
  THROTTLE_OPTIONS,
  buildDefaultNotifChannels,
  getInitialNotificationSettingsState,
  saveNotificationSettings,
  type ChannelKey,
  type NotifChannelState,
  type NotifTopicId,
  type SavedNotificationSettings,
  type ThrottleInterval,
} from '@/lib/notificationSettingsStorage';

/** Fixed channel columns so every checkbox shares the same horizontal position */
const CHANNEL_GRID = 'grid grid-cols-[minmax(0,1fr)_80px_80px] items-center';

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

export function NotificationSettingsContent() {
  const init = getInitialNotificationSettingsState();
  const [criticalBypass, setCriticalBypass] = useState(init.criticalBypass);
  const [throttleInterval, setThrottleInterval] = useState<ThrottleInterval>(init.throttleInterval);
  const [channels, setChannels] = useState<NotifChannelState>(() => init.channels);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  function showToast(message: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMsg(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMsg(null);
      toastTimerRef.current = null;
    }, 2800);
  }

  function persistAndBroadcast(payload: SavedNotificationSettings) {
    saveNotificationSettings(payload);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(NOTIF_SETTINGS_SAVED_EVENT));
    }
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
    setChannels((prev) => ({ ...prev, [topic]: { ...prev[topic], [ch]: !prev[topic][ch] } }));
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

  function restoreDefaults() {
    const next = buildDefaultNotifChannels();
    setCriticalBypass(true);
    setThrottleInterval('10 min');
    setChannels(next);
    persistAndBroadcast({
      version: 1,
      criticalBypass: true,
      throttleInterval: '10 min',
      channels: next,
    });
    showToast('Restored to defaults');
  }

  function handleSaveChanges() {
    persistAndBroadcast({
      version: 1,
      criticalBypass,
      throttleInterval,
      channels,
    });
    showToast('Settings saved');
  }

  return (
    <div className="space-y-8 w-full font-[family-name:var(--font-family)]">
      <section>
        <SettingsEyebrow>Noise control</SettingsEyebrow>
        <SettingsCard>
          <SettingsCardBody>
            <SettingsCardRow
              title="Critical severity bypass"
              description="Always deliver critical alerts in real-time, ignoring throttling and quiet hours."
              control={<Toggle on={criticalBypass} onChange={setCriticalBypass} />}
            />
            <SettingsCardRow
              title="Alert throttling"
              description={`Group repeated notifications from the same type that arrive within ${throttleInterval} into one notification. The grouped notification shows how many updates it contains.`}
              control={
                <Select
                  value={throttleInterval}
                  onChange={(e) => setThrottleInterval(e.target.value as ThrottleInterval)}
                  size="small"
                  className="min-w-[120px]"
                  aria-label="Alert throttling interval"
                >
                  {THROTTLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              }
            />
          </SettingsCardBody>
        </SettingsCard>
      </section>

      <section>
        <SettingsBlockTitle
          title="Notification channels"
          description="Choose how you want to be notified for workspace activity."
        />

        <SettingsCard className="border-[var(--border-level-1)]">
          <div
            className={`${CHANNEL_GRID} border-b border-[var(--border-level-1)] bg-[var(--bg-static-2)] px-4 py-2.5`}
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
                  className={`${CHANNEL_GRID} border-b border-[var(--border-level-1)] bg-[var(--bg-static-3)] px-4 py-2.5`}
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
                          className={`${CHANNEL_GRID} border-b border-[var(--border-level-1)] px-4 py-3.5 transition-colors last:border-b-0 hover:bg-[var(--bg-hover-level-1)] ${
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

        <div className="flex justify-end mt-4">
          <Button theme="third" size="small" onClick={restoreDefaults}>
            Restore to default
          </Button>
        </div>
      </section>

      <div className="flex justify-end pt-2 pb-4">
        <Button theme="primary" size="medium" onClick={handleSaveChanges}>
          Save changes
        </Button>
      </div>

      {toastMsg &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="status"
            className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-[var(--radius-md)] border border-[var(--border-level-2)] bg-[var(--surface)] px-4 py-2.5 text-[length:var(--font-size-body1)] font-medium text-[var(--text-primary)] shadow-[var(--shadow-md)]"
          >
            {toastMsg}
          </div>,
          document.body,
        )}
    </div>
  );
}
