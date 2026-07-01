'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Mail, Monitor, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/Checkbox';
import { NotifChannelHeaderCell } from '@/components/settings/NotifChannelHeaderCell';
import { SettingsCard } from '@/components/settings/SettingsPrimitives';
import {
  NOTIF_PREF_CATEGORIES,
  NOTIF_PREF_ENFORCED_TOOLTIP,
  NOTIF_TABLE_BORDER_CLASS,
  NOTIF_TABLE_OUTER_BORDER_CLASS,
  NOTIF_CHANNEL_EMAIL_TOOLTIP,
  NOTIF_CHANNEL_INAPP_TOOLTIP,
  ORG_NOTIF_POLICY_SAVED_EVENT,
  WORKSPACE_NOTIF_POLICY_SAVED_EVENT,
  getEffectiveNotifPolicy,
  loadNotifPrefUserState,
  saveNotifPrefUserState,
  type NotifPrefCategoryId,
  type NotifPrefChannelKey,
  type NotifPrefUserState,
  type NotifPrefWorkspacePolicy,
} from '@/lib/notificationPreferencesModalStorage';

const CHANNEL_GRID = 'grid grid-cols-[minmax(0,1fr)_104px_104px] items-center';

function EnforcedCheckboxCell({
  checked,
  locked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  locked: boolean;
  onChange: () => void;
  ariaLabel: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  function handleEnter() {
    if (!locked) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowTooltip(true), 400);
  }

  function handleLeave() {
    setShowTooltip(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  return (
    <div
      className="relative flex w-[104px] items-center justify-center justify-self-center"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Checkbox
        checked={checked}
        onChange={onChange}
        disabled={locked}
        size="sm"
        aria-label={ariaLabel}
      />
      <AnimatePresence>
        {locked && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            role="tooltip"
            className="pointer-events-none absolute bottom-full z-10 mb-2 w-44 rounded-[var(--radius-sm)] bg-[var(--color-neutral-800)] px-2.5 py-2 text-center text-[length:var(--font-size-xs)] leading-snug text-white shadow-lg"
          >
            {NOTIF_PREF_ENFORCED_TOOLTIP}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function NotificationPreferencesModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [prefs, setPrefs] = useState<NotifPrefUserState>(() => loadNotifPrefUserState());
  const [effectivePolicy, setEffectivePolicy] = useState<NotifPrefWorkspacePolicy>(() =>
    getEffectiveNotifPolicy(),
  );

  useEffect(() => {
    if (open) {
      setEffectivePolicy(getEffectiveNotifPolicy());
      setPrefs(loadNotifPrefUserState());
    }
  }, [open]);

  useEffect(() => {
    function refreshFromPolicy() {
      setEffectivePolicy(getEffectiveNotifPolicy());
      setPrefs(loadNotifPrefUserState());
    }
    window.addEventListener(WORKSPACE_NOTIF_POLICY_SAVED_EVENT, refreshFromPolicy);
    window.addEventListener(ORG_NOTIF_POLICY_SAVED_EVENT, refreshFromPolicy);
    return () => {
      window.removeEventListener(WORKSPACE_NOTIF_POLICY_SAVED_EVENT, refreshFromPolicy);
      window.removeEventListener(ORG_NOTIF_POLICY_SAVED_EVENT, refreshFromPolicy);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function toggleChannel(id: NotifPrefCategoryId, channel: NotifPrefChannelKey) {
    if (effectivePolicy[id][channel].locked) return;

    setPrefs((prev) => {
      const next = {
        ...prev,
        [id]: {
          ...prev[id],
          [channel]: !prev[id][channel],
        },
      };
      saveNotifPrefUserState(next);
      return next;
    });
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-[640px] flex-col rounded-[var(--radius-xl)] bg-[var(--surface)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-preferences-title"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification preferences"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-primary)]"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>

        <div className="px-6 pb-8 pt-6">
          <h2
            id="notification-preferences-title"
            className="text-[length:var(--font-size-h3)] font-normal text-[var(--text-primary)]"
          >
            Notification preferences
          </h2>
          <p className="mt-1 text-[length:var(--font-size-body1)] text-[var(--text-secondary)]">
            Choose and manage how you want to be notified.
          </p>
        </div>

        <div className="px-6 pb-6">
          <SettingsCard className={NOTIF_TABLE_OUTER_BORDER_CLASS}>
            <div
              className={`${CHANNEL_GRID} h-20 border-b ${NOTIF_TABLE_BORDER_CLASS} bg-[var(--surface)] px-4`}
            >
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[var(--text-tertiary)]" strokeWidth={1.75} />
                <span className="text-[length:var(--font-size-body2)] font-semibold text-[var(--text-tertiary)]">
                  Notify me about
                </span>
              </div>
              <NotifChannelHeaderCell
                label="In-app"
                icon={<Monitor className="h-4 w-4" strokeWidth={1.75} />}
                tooltip={NOTIF_CHANNEL_INAPP_TOOLTIP}
              />
              <NotifChannelHeaderCell
                label="Email"
                icon={<Mail className="h-4 w-4" strokeWidth={1.75} />}
                tooltip={NOTIF_CHANNEL_EMAIL_TOOLTIP}
              />
            </div>

            {NOTIF_PREF_CATEGORIES.map((cat, index) => (
              <div
                key={cat.id}
                className={`${CHANNEL_GRID} h-20 bg-[var(--surface)] px-4 ${
                  index < NOTIF_PREF_CATEGORIES.length - 1 ? `border-b ${NOTIF_TABLE_BORDER_CLASS}` : ''
                }`}
              >
                <div className="min-w-0 pr-4">
                  <p className="text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)]">
                    {cat.label}
                  </p>
                  <p className="mt-1 text-[length:var(--font-size-body2)] leading-snug text-[var(--text-secondary)]">
                    {cat.description}
                  </p>
                </div>
                <EnforcedCheckboxCell
                  checked={prefs[cat.id].inapp}
                  locked={effectivePolicy[cat.id].inapp.locked}
                  onChange={() => toggleChannel(cat.id, 'inapp')}
                  ariaLabel={`${cat.label} — in-app notifications`}
                />
                <EnforcedCheckboxCell
                  checked={prefs[cat.id].email}
                  locked={effectivePolicy[cat.id].email.locked}
                  onChange={() => toggleChannel(cat.id, 'email')}
                  ariaLabel={`${cat.label} — email notifications`}
                />
              </div>
            ))}
          </SettingsCard>
        </div>
      </motion.div>
    </div>
  );
}
