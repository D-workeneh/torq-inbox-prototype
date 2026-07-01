'use client';

import type { RefObject } from 'react';
import { Workflow } from 'lucide-react';
import { APP_NAV_SECTIONS, COMING_SOON_ICONS } from '@/lib/appNavConfig';
import { getPhase1CaseDetail, PHASE1_CASE_KEYS } from './caseDetails';
import { Phase1IntegrationDetailView } from './Phase1IntegrationDetailView';
import { Phase1IntegrationsView } from './Phase1IntegrationsView';
import { Phase1MainContent } from './Phase1MainContent';
import {
  Phase1WorkspaceSettingsView,
  type WorkspaceSettingsHandle,
  type WorkspaceSettingsTab,
} from './Phase1WorkspaceSettingsView';
import { p1PageTitle } from './phase1Typography';

function Phase1ComingSoon({ pageId }: { pageId: string }) {
  const item = APP_NAV_SECTIONS.flatMap((s) => s.items).find((i) => i.pageId === pageId);
  const title = item?.label ?? pageId;
  const Icon =
    COMING_SOON_ICONS[pageId as keyof typeof COMING_SOON_ICONS] ?? Workflow;

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--surface)] font-[family-name:var(--font-family)]">
      <div
        className="flex shrink-0 items-center px-6 py-4"
      >
        <h1 style={p1PageTitle}>{title}</h1>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-neutral-100)]">
            <Icon className="h-8 w-8 text-[var(--color-text-tertiary)]" />
          </div>
          <p className="text-[length:var(--font-size-body1)] text-[var(--text-secondary)]">
            This feature is coming soon. Stay tuned for updates.
          </p>
          <span className="rounded-[var(--radius-full)] bg-[var(--royal-1)] px-3 py-1 text-[length:var(--font-size-body2)] font-medium text-[var(--royal)]">
            Coming soon
          </span>
        </div>
      </div>
    </main>
  );
}

export function Phase1ContentArea({
  pageId,
  caseKey,
  workflowName,
  integrationName,
  workspaceName,
  onCloseCase,
  onNavigateCase,
  onIntegrationBack,
  onOpenIntegration,
  settingsTab = 'general',
  settingsViewRef,
}: {
  pageId: string;
  caseKey: string | null;
  workflowName?: string | null;
  integrationName?: string | null;
  workspaceName?: string;
  onCloseCase: () => void;
  onNavigateCase?: (caseKey: string) => void;
  onIntegrationBack?: () => void;
  onOpenIntegration?: (integrationName: string) => void;
  settingsTab?: WorkspaceSettingsTab;
  settingsViewRef?: RefObject<WorkspaceSettingsHandle | null>;
}) {
  if (pageId === 'integrations') {
    if (integrationName) {
      return (
        <Phase1IntegrationDetailView
          integrationName={integrationName}
          onBack={() => onIntegrationBack?.()}
        />
      );
    }
    return <Phase1IntegrationsView onOpenIntegration={(name) => onOpenIntegration?.(name)} />;
  }
  if (pageId === 'workflows') {
    return (
      <Phase1MainContent
        screen="workflows"
        workflowName={workflowName}
        workspaceName={workspaceName}
      />
    );
  }
  if (pageId === 'cases') {
    const caseDetail = caseKey ? getPhase1CaseDetail(caseKey) : null;
    return (
      <Phase1MainContent
        screen="cases"
        caseDetail={caseDetail}
        onCloseCase={onCloseCase}
        onNavigateCase={onNavigateCase}
        caseKeys={PHASE1_CASE_KEYS}
      />
    );
  }
  if (pageId === 'settings') {
    return <Phase1WorkspaceSettingsView ref={settingsViewRef} initialTab={settingsTab} />;
  }
  return <Phase1ComingSoon pageId={pageId} />;
}
