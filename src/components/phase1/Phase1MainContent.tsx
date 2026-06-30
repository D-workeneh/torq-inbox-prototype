'use client';

import type { Phase1CaseDetail, Phase1ContentScreen } from './types';
import { Phase1CaseExpandView } from './Phase1CaseExpandView';
import { Phase1CasesView } from './Phase1CasesView';
import { Phase1WorkflowDesignerView } from './Phase1WorkflowDesignerView';
import { Phase1WorkflowsView } from './Phase1WorkflowsView';

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

  if (screen === 'cases' && !caseDetail) {
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
        <Phase1CasesView workspaceName={workspaceName} onOpenCase={onNavigateCase} />
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

  return null;
}
