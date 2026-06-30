'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppSidebar, getSidebarWidth } from '@/components/shell/AppSidebar';
import { resolveWorkspaceIdFromName } from '@/lib/workspaceAiCredits';
import {
  TorqSettingsModal,
  normalizeTorqSettingsSection,
  type TorqSettingsOpenDetail,
  type TorqSettingsSection,
} from '@/components/settings/TorqSettingsPage';
import { NotificationPreferencesModal } from '@/components/settings/NotificationPreferencesModal';
import {
  mapTorqSettingsDetailToWorkspaceTab,
  type WorkspaceSettingsTab,
} from '@/components/phase1/Phase1WorkspaceSettingsView';
import { computePreviewCardPosition } from './computePreviewCardPosition';
import { Phase1ContentWithLoadSequence } from './loading/Phase1ContentWithLoadSequence';
import {
  PHASE1_CHROME_CONTENT_SEPARATOR,
  PHASE1_LAYOUT_TOP_OFFSET,
} from './phase1LayoutConstants';
import type { Phase1BrowserTab } from './types';
import { workspaceLabel } from './phase1InboxWorkspace';
import {
  buildWorkspaceDeepLinkHref,
  clearWorkspaceDeepLinkFromUrl,
  getWorkspaceSessionFromNotif,
  openInNewBrowserTab,
  parseWorkspaceDeepLink,
} from './phase1WorkspaceDeepLink';
import {
  FLOATING_INBOX_CLOSE_MS,
  Phase1FloatingInboxDrawer,
} from './Phase1FloatingInboxDrawer';
import { Phase1InboxPanel } from './Phase1InboxPanel';
import { Phase1NotificationDrawer } from './Phase1NotificationDrawer';
import { PhaseFab, type PrototypePhase } from '@/components/PhaseFab';
import {
  getPhase1BuiltInActionFeedback,
  type Phase1BuiltInActionId,
} from './phase1BuiltInNotifActions';
import { PHASE1_INITIAL_STATES } from './data';
import type { Phase1NotifRow } from './types';
import './phase1.css';

const HOVER_LEAVE_MS = 140;

type WorkspaceViewState = {
  currentPage: string;
  activeCaseKey: string | null;
  activeWorkflowName: string | null;
  activeIntegrationName: string | null;
};

function createDefaultWorkspaceSession(): WorkspaceViewState {
  return {
    currentPage: 'workflows',
    activeCaseKey: null,
    activeWorkflowName: null,
    activeIntegrationName: null,
  };
}

function createInitialWorkspaceSessions(): Record<string, WorkspaceViewState> {
  if (typeof window === 'undefined') {
    return { 'torq-dev': createDefaultWorkspaceSession() };
  }

  const link = parseWorkspaceDeepLink(window.location.search);
  if (!link) {
    return { 'torq-dev': createDefaultWorkspaceSession() };
  }

  return {
    'torq-dev': createDefaultWorkspaceSession(),
    [link.workspaceId]:
      link.kind === 'content' ? link.session : createDefaultWorkspaceSession(),
  };
}

function createInitialBrowserTabs(): Phase1BrowserTab[] {
  if (typeof window === 'undefined') {
    return [{ id: 'tab-torq-dev', workspaceId: 'torq-dev', isActive: true }];
  }

  const link = parseWorkspaceDeepLink(window.location.search);
  if (!link) {
    return [{ id: 'tab-torq-dev', workspaceId: 'torq-dev', isActive: true }];
  }

  return [
    {
      id: `tab-${link.workspaceId}`,
      workspaceId: link.workspaceId,
      isActive: true,
    },
  ];
}

export interface Phase1ExperienceProps {
  phase: PrototypePhase;
  onPhaseChange: (phase: PrototypePhase) => void;
}

export function Phase1Experience({ phase, onPhaseChange }: Phase1ExperienceProps) {
  const showPreviewCard = phase === 'floating-drawer-preview';
  const showRowHoverAction = phase === 'floating-drawer-action';
  const showReadMore = phase === 'floating-drawer-read-more';
  const showBuiltInActions = phase === 'notification-builtin-action';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [currentWorkspace, setCurrentWorkspace] = useState(() => {
    if (typeof window === 'undefined') return 'torq-dev';
    return parseWorkspaceDeepLink(window.location.search)?.workspaceId ?? 'torq-dev';
  });
  const [workspaceSessions, setWorkspaceSessions] = useState(createInitialWorkspaceSessions);
  const [notifStates, setNotifStates] = useState(PHASE1_INITIAL_STATES);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [hoverRow, setHoverRow] = useState<Phase1NotifRow | null>(null);
  const [hoverPlacement, setHoverPlacement] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [previewPinned, setPreviewPinned] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationPrefsOpen, setNotificationPrefsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<WorkspaceSettingsTab>('general');
  const [settingsSection, setSettingsSection] = useState<TorqSettingsSection>('preferences');
  const [settingsAiCreditsWorkspace, setSettingsAiCreditsWorkspace] = useState<string | undefined>();
  const [browserTabs, setBrowserTabs] = useState(createInitialBrowserTabs);
  const deepLinkHandledRef = useRef(false);
  const notifNavTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionToastTimerRef = useRef<number | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const activeSession =
    workspaceSessions[currentWorkspace] ?? createDefaultWorkspaceSession();
  const { currentPage, activeCaseKey, activeWorkflowName, activeIntegrationName } =
    activeSession;

  const patchWorkspaceSession = useCallback(
    (workspaceId: string, patch: Partial<WorkspaceViewState>) => {
      setWorkspaceSessions((sessions) => {
        const base = sessions[workspaceId] ?? createDefaultWorkspaceSession();
        return { ...sessions, [workspaceId]: { ...base, ...patch } };
      });
    },
    [],
  );

  const badge = useMemo(() => {
    const entries = Object.entries(notifStates);
    const count = entries.filter(([, s]) => s === 'unseen' || s === 'seen').length;
    const critical = entries.some(
      ([id, s]) => s === 'unseen' && (id === 'n1' || id === 'n2'),
    );
    return { count, critical };
  }, [notifStates]);

  const clearHoverPreview = useCallback(() => {
    if (hoverLeaveTimerRef.current) {
      clearTimeout(hoverLeaveTimerRef.current);
      hoverLeaveTimerRef.current = null;
    }
    setHoverRow(null);
    setHoverPlacement(null);
    setPreviewPinned(false);
  }, []);

  const scheduleHoverClear = useCallback(() => {
    if (previewPinned) return;
    if (hoverLeaveTimerRef.current) clearTimeout(hoverLeaveTimerRef.current);
    hoverLeaveTimerRef.current = setTimeout(() => {
      setHoverRow(null);
      setHoverPlacement(null);
      hoverLeaveTimerRef.current = null;
    }, HOVER_LEAVE_MS);
  }, [previewPinned]);

  const openWorkspaceSettings = useCallback(
    (tab: WorkspaceSettingsTab = 'general') => {
      setSettingsTab(tab);
      patchWorkspaceSession(currentWorkspace, {
        currentPage: 'settings',
        activeCaseKey: null,
        activeWorkflowName: null,
        activeIntegrationName: null,
      });
      setInboxOpen(false);
      clearHoverPreview();
    },
    [clearHoverPreview, currentWorkspace, patchWorkspaceSession],
  );

  function navigate(pageId: string) {
    patchWorkspaceSession(currentWorkspace, {
      currentPage: pageId,
      activeCaseKey: pageId === 'cases' ? activeCaseKey : null,
      activeWorkflowName: null,
      activeIntegrationName: pageId === 'integrations' ? null : activeIntegrationName,
    });
    clearHoverPreview();
  }

  function applyFullPageFromNotif(row: Phase1NotifRow, workspaceId = currentWorkspace) {
    patchWorkspaceSession(workspaceId, getWorkspaceSessionFromNotif(row));
  }

  function collapseFloatingDrawerAndPreview() {
    setInboxOpen(false);
    clearHoverPreview();
  }

  function schedulePageFromNotif(row: Phase1NotifRow, workspaceId = currentWorkspace) {
    const shouldWaitForInboxClose = inboxOpen;
    collapseFloatingDrawerAndPreview();
    if (notifNavTimerRef.current) {
      clearTimeout(notifNavTimerRef.current);
    }
    if (!shouldWaitForInboxClose) {
      applyFullPageFromNotif(row, workspaceId);
      return;
    }
    notifNavTimerRef.current = setTimeout(() => {
      applyFullPageFromNotif(row, workspaceId);
      notifNavTimerRef.current = null;
    }, FLOATING_INBOX_CLOSE_MS);
  }

  const openAiCreditsSettings = useCallback(
    (workspaceName: string) => {
      setSettingsSection('ai-credits');
      setSettingsAiCreditsWorkspace(resolveWorkspaceIdFromName(workspaceName));
      setSettingsOpen(true);
      setInboxOpen(false);
      clearHoverPreview();
    },
    [clearHoverPreview],
  );

  const openBrowserTab = useCallback((workspaceId: string, options?: { pending?: boolean }) => {
    setWorkspaceSessions((sessions) =>
      sessions[workspaceId]
        ? sessions
        : { ...sessions, [workspaceId]: createDefaultWorkspaceSession() },
    );
    setBrowserTabs((tabs) => {
      const exists = tabs.some((t) => t.workspaceId === workspaceId);
      if (exists) {
        return tabs.map((t) => ({
          ...t,
          isActive: t.workspaceId === workspaceId,
          isPending: t.workspaceId === workspaceId ? options?.pending ?? false : false,
        }));
      }
      return [
        ...tabs.map((t) => ({ ...t, isActive: false, isPending: false })),
        {
          id: `tab-${workspaceId}`,
          workspaceId,
          isActive: true,
          isPending: options?.pending ?? false,
        },
      ];
    });
  }, []);

  const isCrossWorkspace = useCallback(
    (row: Phase1NotifRow) => row.workspaceId !== currentWorkspace,
    [currentWorkspace],
  );

  const showActionToast = useCallback((message: string) => {
    if (actionToastTimerRef.current) {
      window.clearTimeout(actionToastTimerRef.current);
    }
    setActionToast(message);
    actionToastTimerRef.current = window.setTimeout(() => {
      setActionToast(null);
      actionToastTimerRef.current = null;
    }, 3200);
  }, []);

  const openCrossWorkspaceInNewBrowserTab = useCallback(
    (row: Phase1NotifRow) => {
      collapseFloatingDrawerAndPreview();
      setNotifStates((s) => (s[row.id] === 'read' ? s : { ...s, [row.id]: 'read' }));
      window.open(buildWorkspaceDeepLinkHref(row), '_blank', 'noopener,noreferrer');
      showActionToast(`Opened ${workspaceLabel(row.workspaceId)} in a new tab`);
    },
    [showActionToast],
  );

  useLayoutEffect(() => {
    if (deepLinkHandledRef.current) return;
    const link = parseWorkspaceDeepLink(window.location.search);
    if (!link) return;
    deepLinkHandledRef.current = true;

    setCurrentWorkspace(link.workspaceId);
    setWorkspaceSessions((sessions) => {
      const base = sessions[link.workspaceId] ?? createDefaultWorkspaceSession();
      if (link.kind === 'content') {
        return { ...sessions, [link.workspaceId]: { ...base, ...link.session } };
      }
      return sessions[link.workspaceId]
        ? sessions
        : { ...sessions, [link.workspaceId]: base };
    });
    setBrowserTabs([
      {
        id: `tab-${link.workspaceId}`,
        workspaceId: link.workspaceId,
        isActive: true,
      },
    ]);

    if (link.kind === 'ai-credits') {
      setSettingsSection('ai-credits');
      setSettingsAiCreditsWorkspace(link.workspaceId);
      setSettingsOpen(true);
    }

    if (link.notifId) {
      setNotifStates((s) => ({ ...s, [link.notifId!]: 'read' }));
    }

    clearWorkspaceDeepLinkFromUrl();
  }, []);

  function handleBuiltInAction(row: Phase1NotifRow, actionId: Phase1BuiltInActionId) {
    showActionToast(getPhase1BuiltInActionFeedback(actionId, row));
    setNotifStates((s) => ({ ...s, [row.id]: 'read' }));
  }

  function handleInboxSelect(row: Phase1NotifRow) {
    if (isCrossWorkspace(row)) {
      openCrossWorkspaceInNewBrowserTab(row);
      return;
    }

    if (row.avatarIcon === 'ai') {
      openAiCreditsSettings(row.workspace);
      return;
    }

    schedulePageFromNotif(row);
  }

  function handleDrawerPrimaryAction(row: Phase1NotifRow) {
    if (isCrossWorkspace(row)) {
      openCrossWorkspaceInNewBrowserTab(row);
      return;
    }

    if (row.avatarIcon === 'ai') {
      openAiCreditsSettings(row.workspace);
      return;
    }

    schedulePageFromNotif(row);
  }

  function handleRowHover(row: Phase1NotifRow | null, el: HTMLElement | null) {
    if (!showPreviewCard) return;

    if (hoverLeaveTimerRef.current) {
      clearTimeout(hoverLeaveTimerRef.current);
      hoverLeaveTimerRef.current = null;
    }

    if (!row || !el) {
      scheduleHoverClear();
      return;
    }

    const rect = el.getBoundingClientRect();
    setHoverRow(row);
    setHoverPlacement(computePreviewCardPosition(rect));
  }

  function handlePreviewCardEnter() {
    if (hoverLeaveTimerRef.current) {
      clearTimeout(hoverLeaveTimerRef.current);
      hoverLeaveTimerRef.current = null;
    }
    setPreviewPinned(true);
  }

  function handlePreviewCardLeave() {
    setPreviewPinned(false);
    scheduleHoverClear();
  }

  useEffect(() => {
    function onOpenSettings(e: Event) {
      const detail = (e as CustomEvent<TorqSettingsOpenDetail>).detail ?? 'preferences';
      const section =
        typeof detail === 'string'
          ? detail
          : detail.section;

      const mapped = mapTorqSettingsDetailToWorkspaceTab(section);

      if (mapped === 'notifications') {
        setNotificationPrefsOpen(true);
        setInboxOpen(false);
        clearHoverPreview();
        return;
      }

      if (mapped !== 'modal') {
        openWorkspaceSettings(mapped);
        return;
      }

      const normalized = normalizeTorqSettingsSection(section);
      setSettingsSection(normalized);
      if (normalized === 'ai-credits') {
        setSettingsAiCreditsWorkspace(
          typeof detail === 'object' && detail.workspaceName
            ? resolveWorkspaceIdFromName(detail.workspaceName)
            : resolveWorkspaceIdFromName(currentWorkspace),
        );
      } else {
        setSettingsAiCreditsWorkspace(undefined);
      }
      setSettingsOpen(true);
      setInboxOpen(false);
      clearHoverPreview();
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSettingsOpen(false);
        setNotificationPrefsOpen(false);
      }
    }

    window.addEventListener('torq:open-settings', onOpenSettings);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('torq:open-settings', onOpenSettings);
      window.removeEventListener('keydown', onKey);
    };
  }, [clearHoverPreview, currentWorkspace, openWorkspaceSettings]);

  useEffect(() => {
    clearHoverPreview();
    setInboxOpen(false);
  }, [phase, clearHoverPreview]);

  useEffect(() => {
    return () => {
      if (hoverLeaveTimerRef.current) clearTimeout(hoverLeaveTimerRef.current);
      if (notifNavTimerRef.current) clearTimeout(notifNavTimerRef.current);
      if (actionToastTimerRef.current) window.clearTimeout(actionToastTimerRef.current);
    };
  }, []);

  const inboxPanel = (
    <Phase1InboxPanel
      states={notifStates}
      onStatesChange={setNotifStates}
      onNavigate={handleInboxSelect}
      onClose={() => setInboxOpen(false)}
      currentWorkspaceId={currentWorkspace}
      interaction={
        showPreviewCard
          ? 'hover-preview'
          : showRowHoverAction
            ? 'hover-action'
            : showReadMore
              ? 'read-more'
              : showBuiltInActions
                ? 'builtin-action'
                : 'navigate'
      }
      onRowHover={showPreviewCard ? handleRowHover : undefined}
      onBuiltInAction={showBuiltInActions ? handleBuiltInAction : undefined}
      variant="floating"
    />
  );

  const previewPlacement =
    showPreviewCard && hoverRow && hoverPlacement
      ? { mode: 'hover' as const, ...hoverPlacement }
      : null;

  return (
    <div
      className="phase1-root flex h-screen w-full flex-col overflow-hidden bg-[var(--color-surface-primary)]"
      data-prototype-phase={phase}
      style={{
        ['--phase1-chrome-h' as string]: `${PHASE1_LAYOUT_TOP_OFFSET}px`,
        ['--phase1-chrome-separator' as string]: PHASE1_CHROME_CONTENT_SEPARATOR,
      }}
    >
      <div className="flex min-h-0 min-w-0 flex-1">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          currentWorkspace={currentWorkspace}
          onWorkspaceChange={(workspaceId) => {
            setCurrentWorkspace(workspaceId);
            openBrowserTab(workspaceId);
          }}
          onManageOrganization={() => {
            openInNewBrowserTab('/organization');
            setInboxOpen(false);
            clearHoverPreview();
          }}
          onManageNotifications={() => {
            setNotificationPrefsOpen(true);
            setInboxOpen(false);
            clearHoverPreview();
          }}
          onOpenSettings={() => openWorkspaceSettings('general')}
          currentPage={currentPage}
          onNavigate={navigate}
          inboxOpen={inboxOpen}
          onInboxToggle={() => setInboxOpen((o) => !o)}
          inboxUnreadCount={badge.count}
          inboxBadgeCritical={badge.critical}
        />

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {browserTabs.map((tab) => {
              const session =
                workspaceSessions[tab.workspaceId] ?? createDefaultWorkspaceSession();
              const isVisible = tab.workspaceId === currentWorkspace;

              return (
                <div
                  key={tab.workspaceId}
                  className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
                  style={{ display: isVisible ? 'flex' : 'none' }}
                  aria-hidden={!isVisible}
                >
                  <Phase1ContentWithLoadSequence
                    pageId={session.currentPage}
                    caseKey={session.activeCaseKey}
                    workflowName={session.activeWorkflowName}
                    integrationName={session.activeIntegrationName}
                    workspaceId={tab.workspaceId}
                    workspaceName={workspaceLabel(tab.workspaceId)}
                    onCloseCase={() =>
                      patchWorkspaceSession(tab.workspaceId, { activeCaseKey: null })
                    }
                    onNavigateCase={(caseKey) =>
                      patchWorkspaceSession(tab.workspaceId, { activeCaseKey: caseKey })
                    }
                    onIntegrationBack={() =>
                      patchWorkspaceSession(tab.workspaceId, { activeIntegrationName: null })
                    }
                    onOpenIntegration={(name) =>
                      patchWorkspaceSession(tab.workspaceId, {
                        currentPage: 'integrations',
                        activeIntegrationName: name,
                      })
                    }
                    settingsTab={settingsTab}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {inboxOpen && (
          <motion.button
            type="button"
            aria-label="Close inbox"
            key="inbox-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FLOATING_INBOX_CLOSE_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
            className="fixed z-[44] cursor-default border-0 bg-transparent p-0"
            style={{
              top: PHASE1_LAYOUT_TOP_OFFSET,
              right: 0,
              bottom: 0,
              left: getSidebarWidth(sidebarCollapsed),
            }}
            onClick={collapseFloatingDrawerAndPreview}
          />
        )}
      </AnimatePresence>

      <Phase1FloatingInboxDrawer open={inboxOpen} sidebarCollapsed={sidebarCollapsed}>
        {inboxPanel}
      </Phase1FloatingInboxDrawer>

      {showPreviewCard && (
        <Phase1NotificationDrawer
          row={hoverRow}
          placement={previewPlacement}
          onClose={clearHoverPreview}
          onPrimaryAction={handleDrawerPrimaryAction}
          onCardMouseEnter={handlePreviewCardEnter}
          onCardMouseLeave={handlePreviewCardLeave}
          enableEscape={!!hoverRow}
        />
      )}

      {actionToast ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed left-1/2 z-[95] -translate-x-1/2"
          style={{ top: PHASE1_LAYOUT_TOP_OFFSET + 12 }}
        >
          <div
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              background: 'var(--neutral-12)',
              color: '#FFFFFF',
              fontSize: 13,
              fontFamily: 'var(--font-family)',
              boxShadow: '0 8px 24px rgba(9, 10, 11, 0.18)',
              maxWidth: 420,
              textAlign: 'center',
            }}
          >
            {actionToast}
          </div>
        </div>
      ) : null}

      <PhaseFab phase={phase} onPhaseChange={onPhaseChange} />

      <TorqSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialSection={settingsSection}
        initialAiCreditsWorkspace={settingsAiCreditsWorkspace}
        currentWorkspaceId={currentWorkspace}
      />

      <NotificationPreferencesModal
        open={notificationPrefsOpen}
        onClose={() => setNotificationPrefsOpen(false)}
      />
    </div>
  );
}
