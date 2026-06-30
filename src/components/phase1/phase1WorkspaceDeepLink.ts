import type { Phase1NotifRow } from './types';
import {
  isSharedIntegrationNotif,
  parseSharedIntegrationName,
} from './phase1Integrations';

export type Phase1WorkspaceSessionPatch = {
  currentPage: string;
  activeCaseKey: string | null;
  activeWorkflowName: string | null;
  activeIntegrationName: string | null;
};

export type Phase1WorkspaceDeepLink =
  | {
      workspaceId: string;
      notifId?: string;
      kind: 'content';
      session: Phase1WorkspaceSessionPatch;
    }
  | {
      workspaceId: string;
      notifId?: string;
      kind: 'ai-credits';
    };

export function getWorkspaceSessionFromNotif(row: Phase1NotifRow): Phase1WorkspaceSessionPatch {
  const integrationName =
    row.target.type === 'integration'
      ? row.target.integrationName
      : isSharedIntegrationNotif(row.title)
        ? parseSharedIntegrationName(row.title)
        : null;

  if (integrationName) {
    return {
      currentPage: 'integrations',
      activeCaseKey: null,
      activeWorkflowName: null,
      activeIntegrationName: integrationName,
    };
  }

  if (row.target.type === 'case') {
    return {
      currentPage: 'cases',
      activeCaseKey: row.target.caseKey,
      activeWorkflowName: null,
      activeIntegrationName: null,
    };
  }

  if (row.target.type === 'workflow') {
    return {
      currentPage: 'workflows',
      activeCaseKey: null,
      activeWorkflowName: row.target.workflowName,
      activeIntegrationName: null,
    };
  }

  return {
    currentPage: 'workflows',
    activeCaseKey: null,
    activeWorkflowName: null,
    activeIntegrationName: null,
  };
}

export function parseWorkspaceDeepLink(search: string): Phase1WorkspaceDeepLink | null {
  const raw = search.startsWith('?') ? search.slice(1) : search;
  if (!raw) return null;

  const params = new URLSearchParams(raw);
  const workspaceId = params.get('ws');
  if (!workspaceId) return null;

  const notifId = params.get('n') ?? undefined;

  if (params.get('open') === 'ai-credits') {
    return { workspaceId, notifId, kind: 'ai-credits' };
  }

  return {
    workspaceId,
    notifId,
    kind: 'content',
    session: {
      currentPage: params.get('page') ?? 'workflows',
      activeCaseKey: params.get('case'),
      activeWorkflowName: params.get('workflow'),
      activeIntegrationName: params.get('integration'),
    },
  };
}

export function buildWorkspaceDeepLinkHref(row: Phase1NotifRow): string {
  const params = new URLSearchParams();
  params.set('ws', row.workspaceId);
  params.set('n', row.id);

  if (row.avatarIcon === 'ai') {
    params.set('open', 'ai-credits');
  } else {
    const session = getWorkspaceSessionFromNotif(row);
    params.set('page', session.currentPage);
    if (session.activeCaseKey) params.set('case', session.activeCaseKey);
    if (session.activeWorkflowName) params.set('workflow', session.activeWorkflowName);
    if (session.activeIntegrationName) params.set('integration', session.activeIntegrationName);
  }

  const url = new URL(window.location.pathname, window.location.origin);
  url.search = params.toString();
  return url.toString();
}

export function clearWorkspaceDeepLinkFromUrl() {
  if (typeof window === 'undefined') return;
  window.history.replaceState(null, '', window.location.pathname);
}

/**
 * Opens a URL in a real new browser tab. Uses a programmatic anchor click
 * instead of window.open with a feature string, which Chrome interprets as a
 * popup window request rather than a new tab.
 */
export function openInNewBrowserTab(href: string) {
  if (typeof window === 'undefined') return;
  const a = document.createElement('a');
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
