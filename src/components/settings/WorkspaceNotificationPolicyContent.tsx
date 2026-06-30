'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CircleCheck, Info, Lock, LockOpen, Mail, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { SettingsCard } from '@/components/settings/SettingsPrimitives';
import {
  NOTIF_PREF_CATEGORIES,
  NOTIF_TABLE_BORDER_CLASS,
  NOTIF_TABLE_OUTER_BORDER_CLASS,
  ORG_NOTIF_POLICY_SAVED_EVENT,
  WORKSPACE_NOTIF_POLICY_SAVED_EVENT,
  loadOrgNotifPolicy,
  loadWorkspaceNotifPolicy,
  saveOrgNotifPolicy,
  saveWorkspaceNotifPolicy,
  type NotifPrefCategoryId,
  type NotifPrefChannelKey,
  type NotifPrefWorkspacePolicy,
} from '@/lib/notificationPreferencesModalStorage';

const CHANNEL_GRID = 'grid grid-cols-[minmax(0,1fr)_104px_104px] items-center';

const LOCK_TOOLTIP_ENFORCED = 'Enforced';
const LOCK_TOOLTIP_OPTIONAL = 'Optional';

export type NotificationPolicyScope = 'workspace' | 'organization';

function policiesEqual(a: NotifPrefWorkspacePolicy, b: NotifPrefWorkspacePolicy): boolean {
  for (const cat of NOTIF_PREF_CATEGORIES) {
    for (const channel of ['inapp', 'email'] as const) {
      if (a[cat.id][channel].enabled !== b[cat.id][channel].enabled) return false;
      if (a[cat.id][channel].locked !== b[cat.id][channel].locked) return false;
    }
  }
  return true;
}

function NotificationPolicySaveConfirmModal({
  open,
  scope,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  scope: NotificationPolicyScope;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isOrg = scope === 'organization';
  const titleId = isOrg ? 'org-notif-save-title' : 'workspace-notif-save-title';

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
      data-notif-policy-save-modal
      role="presentation"
    >
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[1] w-full max-w-lg rounded-[var(--radius-md)] border border-[var(--border-level-2)] bg-[var(--surface)] p-6 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2
          id={titleId}
          className="text-[length:var(--font-size-h4)] font-bold text-[var(--text-primary)]"
        >
          {isOrg ? 'Save organization notification policy?' : 'Save workspace notification policy?'}
        </h2>
        <p className="mt-3 text-[length:var(--font-size-body1)] leading-relaxed text-[var(--text-secondary)]">
          {isOrg
            ? 'Saving applies these defaults to every workspace in the organization. Workspace admins and individual users inherit what is set here.'
            : 'Saving applies these notification defaults to every member of this workspace.'}
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[length:var(--font-size-body1)] leading-relaxed text-[var(--text-secondary)]">
          <li>
            <span className="font-semibold text-[var(--text-primary)]">Enforced</span> channels
            override {isOrg ? 'workspace and user' : 'user'} preferences. Affected{' '}
            {isOrg ? 'workspaces and users' : 'users'} will see the setting as locked and cannot
            change it.
          </li>
          <li>
            <span className="font-semibold text-[var(--text-primary)]">Optional</span> channels set
            the {isOrg ? 'organization' : 'workspace'} default.{' '}
            {isOrg
              ? 'Workspaces and users can still customize them unless a workspace admin locks them.'
              : 'Users can still customize them unless they are locked here.'}
          </li>
        </ul>
        <div className="mt-6 flex justify-end gap-2">
          <Button theme="third" size="small" onClick={onCancel}>
            Cancel
          </Button>
          <Button theme="primary" size="medium" onClick={onConfirm}>
            Save changes
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function NotificationPolicySavedToast({ message }: { message: string }) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[10002] flex -translate-x-1/2 items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-level-2)] bg-[var(--surface)] px-4 py-2.5 shadow-[var(--shadow-md)]"
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-teal-500)]/15"
        aria-hidden
      >
        <CircleCheck className="h-4 w-4 text-[var(--color-teal-500)]" strokeWidth={2} />
      </span>
      <span className="text-[length:var(--font-size-body1)] font-medium text-[var(--text-primary)]">
        {message}
      </span>
    </div>,
    document.body,
  );
}

function LockActionButton({
  locked,
  onToggleLock,
  ariaLabel,
}: {
  locked: boolean;
  onToggleLock: () => void;
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
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowTooltip(true), 300);
  }

  function handleLeave() {
    setShowTooltip(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        onClick={onToggleLock}
        aria-label={locked ? `${ariaLabel} — unlock for users` : `${ariaLabel} — lock and enforce`}
        aria-pressed={locked}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] transition-colors ${
          locked
            ? 'bg-[var(--bg-static-2)] text-[var(--text-primary)]'
            : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-primary)]'
        }`}
      >
        {locked ? (
          <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />
        ) : (
          <LockOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
        )}
      </button>
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-sm)] bg-[var(--color-neutral-800)] px-2.5 py-1.5 text-[length:var(--font-size-xs)] text-white shadow-lg"
          >
            {locked ? LOCK_TOOLTIP_ENFORCED : LOCK_TOOLTIP_OPTIONAL}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChannelHeaderCell({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex w-[104px] items-center justify-center gap-1.5 justify-self-center">
      <span className="shrink-0 text-[var(--text-tertiary)]">{icon}</span>
      <span className="text-[length:var(--font-size-body2)] font-semibold text-[var(--text-tertiary)]">
        {label}
      </span>
    </div>
  );
}

function AdminChannelCell({
  enabled,
  locked,
  rowHovered,
  onToggleEnabled,
  onToggleLock,
  ariaLabel,
}: {
  enabled: boolean;
  locked: boolean;
  rowHovered: boolean;
  onToggleEnabled: () => void;
  onToggleLock: () => void;
  ariaLabel: string;
}) {
  const showOpenLock = !locked && rowHovered;

  return (
    <div className="flex w-[104px] items-center justify-center justify-self-center">
      <div className="relative flex items-center">
        {(locked || showOpenLock) && (
          <div className="absolute right-full mr-1.5">
            <LockActionButton
              locked={locked}
              onToggleLock={onToggleLock}
              ariaLabel={ariaLabel}
            />
          </div>
        )}
        <Checkbox
          checked={enabled}
          onChange={onToggleEnabled}
          size="sm"
          aria-label={ariaLabel}
        />
      </div>
    </div>
  );
}

export function NotificationPolicyContent({
  scope = 'workspace',
  showHeader = scope === 'workspace',
}: {
  scope?: NotificationPolicyScope;
  showHeader?: boolean;
}) {
  const isOrg = scope === 'organization';
  const loadPolicy = isOrg ? loadOrgNotifPolicy : loadWorkspaceNotifPolicy;
  const savePolicy = isOrg ? saveOrgNotifPolicy : saveWorkspaceNotifPolicy;
  const savedEvent = isOrg ? ORG_NOTIF_POLICY_SAVED_EVENT : WORKSPACE_NOTIF_POLICY_SAVED_EVENT;

  const [policy, setPolicy] = useState<NotifPrefWorkspacePolicy>(() => loadPolicy());
  const [savedPolicy, setSavedPolicy] = useState<NotifPrefWorkspacePolicy>(() => loadPolicy());
  const [hoveredRowId, setHoveredRowId] = useState<NotifPrefCategoryId | null>(null);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [savedToastMsg, setSavedToastMsg] = useState<string | null>(null);
  const savedToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDirty = !policiesEqual(policy, savedPolicy);

  useEffect(() => {
    return () => {
      if (savedToastTimerRef.current) clearTimeout(savedToastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    function refresh() {
      const loaded = isOrg ? loadOrgNotifPolicy() : loadWorkspaceNotifPolicy();
      setPolicy(loaded);
      setSavedPolicy(loaded);
    }
    window.addEventListener(savedEvent, refresh);
    return () => window.removeEventListener(savedEvent, refresh);
  }, [isOrg, savedEvent]);

  function showSavedToast(message: string) {
    if (savedToastTimerRef.current) clearTimeout(savedToastTimerRef.current);
    setSavedToastMsg(message);
    savedToastTimerRef.current = setTimeout(() => {
      setSavedToastMsg(null);
      savedToastTimerRef.current = null;
    }, 2800);
  }

  function applyDraft(next: NotifPrefWorkspacePolicy) {
    setPolicy(next);
  }

  function persistSaved(next: NotifPrefWorkspacePolicy) {
    setPolicy(next);
    setSavedPolicy(next);
    savePolicy(next);
    setSaveConfirmOpen(false);
    showSavedToast(
      isOrg ? 'Organization notification policy saved' : 'Workspace notification policy saved',
    );
  }

  function toggleEnabled(id: NotifPrefCategoryId, channel: NotifPrefChannelKey) {
    applyDraft({
      ...policy,
      [id]: {
        ...policy[id],
        [channel]: {
          ...policy[id][channel],
          enabled: !policy[id][channel].enabled,
        },
      },
    });
  }

  function toggleLock(id: NotifPrefCategoryId, channel: NotifPrefChannelKey) {
    applyDraft({
      ...policy,
      [id]: {
        ...policy[id],
        [channel]: {
          ...policy[id][channel],
          locked: !policy[id][channel].locked,
        },
      },
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {showHeader && (
        <div>
          <h2 className="text-[length:var(--font-size-h3)] font-normal text-[var(--text-primary)]">
            Notifications
          </h2>
          <p className="mt-1 max-w-2xl text-[length:var(--font-size-body1)] text-[var(--text-secondary)]">
            {isOrg
              ? 'Set default notification channels for all workspaces in your organization. Locked items cascade to every workspace and user.'
              : 'Control how your workspace is notified across Torq. Locked items are enforced for every workspace member; unlocked categories can be customized individually.'}
          </p>
        </div>
      )}

      <SettingsCard className={NOTIF_TABLE_OUTER_BORDER_CLASS}>
        <div className={`${CHANNEL_GRID} h-20 border-b ${NOTIF_TABLE_BORDER_CLASS} bg-[var(--surface)] px-4`}>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[var(--text-tertiary)]" strokeWidth={1.75} />
            <span className="text-[length:var(--font-size-body2)] font-semibold text-[var(--text-tertiary)]">
              Notify me about
            </span>
          </div>
          <ChannelHeaderCell
            label="In-app"
            icon={<Monitor className="h-4 w-4" strokeWidth={1.75} />}
          />
          <ChannelHeaderCell
            label="Email"
            icon={<Mail className="h-4 w-4" strokeWidth={1.75} />}
          />
        </div>

        {NOTIF_PREF_CATEGORIES.map((cat, index) => (
          <div
            key={cat.id}
            className={`${CHANNEL_GRID} h-20 bg-[var(--surface)] px-4 ${
              index < NOTIF_PREF_CATEGORIES.length - 1 ? `border-b ${NOTIF_TABLE_BORDER_CLASS}` : ''
            }`}
            onMouseEnter={() => setHoveredRowId(cat.id)}
            onMouseLeave={() => setHoveredRowId(null)}
          >
            <div className="min-w-0 pr-4">
              <p className="text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)]">
                {cat.label}
              </p>
              <p className="mt-1 text-[length:var(--font-size-body2)] leading-snug text-[var(--text-secondary)]">
                {cat.description}
              </p>
            </div>
            <AdminChannelCell
              enabled={policy[cat.id].inapp.enabled}
              locked={policy[cat.id].inapp.locked}
              rowHovered={hoveredRowId === cat.id}
              onToggleEnabled={() => toggleEnabled(cat.id, 'inapp')}
              onToggleLock={() => toggleLock(cat.id, 'inapp')}
              ariaLabel={`${cat.label} — in-app notifications`}
            />
            <AdminChannelCell
              enabled={policy[cat.id].email.enabled}
              locked={policy[cat.id].email.locked}
              rowHovered={hoveredRowId === cat.id}
              onToggleEnabled={() => toggleEnabled(cat.id, 'email')}
              onToggleLock={() => toggleLock(cat.id, 'email')}
              ariaLabel={`${cat.label} — email notifications`}
            />
          </div>
        ))}
      </SettingsCard>

      <div className="flex items-start gap-3 rounded-[var(--radius-md)] bg-[var(--color-primary-50)] px-4 py-3">
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary-500)]"
          strokeWidth={1.75}
          aria-hidden
        />
        <p className="text-[length:var(--font-size-body2)] leading-snug text-[var(--text-secondary)]">
          {isOrg
            ? 'Enforcing preferences overrides workspace and user settings. Affected workspaces and users will see it as locked.'
            : 'Enforcing preferences overrides any conflicting user setting. Users will see it as locked.'}
        </p>
      </div>

      <div className="flex justify-end pb-2">
        <Button
          theme="primary"
          size="medium"
          disabled={!isDirty}
          onClick={() => setSaveConfirmOpen(true)}
        >
          Save changes
        </Button>
      </div>

      <NotificationPolicySaveConfirmModal
        open={saveConfirmOpen}
        scope={scope}
        onCancel={() => setSaveConfirmOpen(false)}
        onConfirm={() => persistSaved(policy)}
      />

      {savedToastMsg && <NotificationPolicySavedToast message={savedToastMsg} />}
    </div>
  );
}

export function WorkspaceNotificationPolicyContent() {
  return <NotificationPolicyContent scope="workspace" />;
}
