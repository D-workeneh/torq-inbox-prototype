'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { CloudUpload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SettingsCard } from '@/components/settings/SettingsPrimitives';
import { UsersSettingsContent } from '@/components/settings/UsersSettingsContent';
import {
  WorkspaceNotificationPolicyContent,
  type NotificationPolicyHandle,
} from '@/components/settings/WorkspaceNotificationPolicyContent';

export type WorkspaceSettingsTab =
  | 'general'
  | 'users'
  | 'security'
  | 'log-export'
  | 'cases'
  | 'socrates-tools'
  | 'notifications';

const TABS: { id: WorkspaceSettingsTab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'users', label: 'Users' },
  { id: 'security', label: 'Security' },
  { id: 'log-export', label: 'Log Export' },
  { id: 'cases', label: 'Cases' },
  { id: 'socrates-tools', label: 'Socrates Tools' },
  { id: 'notifications', label: 'Notifications' },
];

function SettingsTabBar({
  active,
  onChange,
}: {
  active: WorkspaceSettingsTab;
  onChange: (tab: WorkspaceSettingsTab) => void;
}) {
  return (
    <div className="flex gap-8 px-6">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative -mb-px pb-3 pt-4 text-[length:var(--font-size-body1)] transition-colors ${
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

function LogoUploadCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  function handleUpload() {
    /* prototype — no file picker wired */
  }

  return (
    <SettingsCard>
      <div className="px-6 py-5">
        <p className="text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)]">
          {title}
        </p>
        <p className="mt-1 max-w-xl text-[length:var(--font-size-body1)] leading-relaxed text-[var(--text-secondary)]">
          {description}
        </p>
        <div className="mt-4">
          <Button
            theme="secondary"
            size="small"
            leftIcon={<CloudUpload className="h-3.5 w-3.5" strokeWidth={1.75} />}
            onClick={handleUpload}
          >
            Upload
          </Button>
        </div>
      </div>
    </SettingsCard>
  );
}

function GeneralSettingsTab() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <LogoUploadCard
        title="Workspace logo"
        description="Upload a square PNG or SVG file to make it easier to identify your workspace."
      />
      <LogoUploadCard
        title="Torq Interact logo"
        description="Upload a PNG or SVG file for use in Torq Interact."
      />
    </div>
  );
}

function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <p className="text-[length:var(--font-size-body1)] text-[var(--text-tertiary)]">
        {title} — coming soon in prototype
      </p>
    </div>
  );
}

export type WorkspaceSettingsHandle = {
  requestLeave: (onLeave: () => void) => void;
};

export const Phase1WorkspaceSettingsView = forwardRef<
  WorkspaceSettingsHandle,
  { initialTab?: WorkspaceSettingsTab }
>(function Phase1WorkspaceSettingsView({ initialTab = 'general' }, ref) {
  const [activeTab, setActiveTab] = useState<WorkspaceSettingsTab>(initialTab);
  const notificationsPolicyRef = useRef<NotificationPolicyHandle>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  function handleTabChange(tab: WorkspaceSettingsTab) {
    if (activeTab === 'notifications' && tab !== 'notifications') {
      notificationsPolicyRef.current?.requestLeave(() => setActiveTab(tab));
      return;
    }
    setActiveTab(tab);
  }

  useImperativeHandle(
    ref,
    () => ({
      requestLeave(onLeave) {
        if (activeTab === 'notifications') {
          notificationsPolicyRef.current?.requestLeave(onLeave);
          return;
        }
        onLeave();
      },
    }),
    [activeTab],
  );

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--surface)] font-[family-name:var(--font-family)]">
      <SettingsTabBar active={activeTab} onChange={handleTabChange} />

      {activeTab === 'notifications' ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--surface)]">
          <WorkspaceNotificationPolicyContent ref={notificationsPolicyRef} />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--surface)] px-6 py-8">
          {activeTab === 'general' && <GeneralSettingsTab />}
          {activeTab === 'users' && (
            <div className="mx-auto w-full max-w-4xl">
              <UsersSettingsContent />
            </div>
          )}
          {activeTab === 'security' && <PlaceholderTab title="Security" />}
          {activeTab === 'log-export' && <PlaceholderTab title="Log Export" />}
          {activeTab === 'cases' && <PlaceholderTab title="Cases" />}
          {activeTab === 'socrates-tools' && <PlaceholderTab title="Socrates Tools" />}
        </div>
      )}
    </main>
  );
});

export function mapTorqSettingsDetailToWorkspaceTab(
  detail: string,
): WorkspaceSettingsTab | 'notifications' | 'modal' {
  if (detail === 'notifications') return 'notifications';
  if (detail === 'general' || detail === 'preferences' || detail === 'theme') return 'general';
  if (detail === 'users' || detail === 'groups') return 'users';
  if (detail.startsWith('security')) return 'security';
  if (detail === 'log-export') return 'log-export';
  if (detail === 'cases') return 'cases';
  if (detail === 'socrates-tools') return 'socrates-tools';
  return 'modal';
}
