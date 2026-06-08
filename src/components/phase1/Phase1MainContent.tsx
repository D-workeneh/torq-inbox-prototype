'use client';

import type { Phase1CaseDetail, Phase1ContentScreen } from './types';
import { Phase1CaseExpandView } from './Phase1CaseExpandView';
import { Phase1WorkflowDesignerView } from './Phase1WorkflowDesignerView';
import { Phase1WorkflowsView } from './Phase1WorkflowsView';
import { p1Font, p1PageTitle, p1Text } from './phase1Typography';

export function Phase1MainContent({
  screen,
  caseDetail,
  workflowName,
  workspaceName,
  onCloseCase,
  onNavigateCase,
  caseKeys,
}: {
  screen: Phase1ContentScreen;
  caseDetail?: Phase1CaseDetail | null;
  workflowName?: string | null;
  workspaceName?: string;
  onCloseCase?: () => void;
  onNavigateCase?: (caseKey: string) => void;
  caseKeys?: readonly string[];
}) {
  const title = screen === 'cases' ? 'Cases' : 'Workflows';

  if (screen === 'workflows' && workflowName) {
    return (
      <Phase1WorkflowDesignerView
        workflowName={workflowName}
        workspaceName={workspaceName}
      />
    );
  }

  if (screen === 'workflows') {
    return (
      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          background: '#FFFFFF',
        }}
      >
        <Phase1WorkflowsView />
      </main>
    );
  }

  if (caseDetail) {
    return (
      <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--surface)]">
        <Phase1CaseExpandView
          detail={caseDetail}
          onClose={onCloseCase}
          onNavigateCase={onNavigateCase}
          caseKeys={caseKeys}
        />
      </main>
    );
  }

  return (
    <main
      style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        background: '#FFFFFF',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          flexShrink: 0,
        }}
      >
        <h1 style={p1PageTitle}>{title}</h1>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: p1Text.tertiary,
          fontSize: p1Font.body1,
          fontFamily: p1Font.family,
        }}
      >
        Select a case notification from the inbox to open it here
      </div>
    </main>
  );
}
