'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppSidebar, getSidebarWidth } from '@/components/shell/AppSidebar';
import { resolveWorkspaceIdFromName } from '@/lib/workspaceAiCredits';
import {
  TorqSettingsModal,
  normalizeTorqSettingsSection,
  type TorqSettingsOpenDetail,
  type TorqSettingsSection,
} from '@/components/settings/TorqSettingsPage';
import { computePreviewCardPosition } from './computePreviewCardPosition';
import type { SimulatedLoadProfile } from './loading/simulatedLoadTiming';
import { Phase1ContentWithLoadSequence } from './loading/Phase1ContentWithLoadSequence';
import { Phase1CrossWorkspaceOverlay } from './Phase1CrossWorkspaceOverlay';
import { workspaceLabel } from './phase1InboxWorkspace';
import { Phase1FloatingInboxDrawer } from './Phase1FloatingInboxDrawer';
import { Phase1InboxPanel } from './Phase1InboxPanel';
import { Phase1NotificationDrawer } from './Phase1NotificationDrawer';
import { PhaseFab, type PrototypePhase } from '@/components/PhaseFab';
import { PHASE1_INITIAL_STATES } from './data';
import type { Phase1NotifRow } from './types';
import './phase1.css';

const HOVER_LEAVE_MS = 140;

export interface Phase1ExperienceProps {
  phase: PrototypePhase;
  onPhaseChange: (phase: PrototypePhase) => void;
}

export function Phase1Experience({ phase, onPhaseChange }: Phase1ExperienceProps) {
  const showPreviewCard = phase === 'floating-drawer-preview';
  const showRowHoverAction = phase === 'floating-drawer-action';
  const showReadMore = phase === 'floating-drawer-read-more';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [currentWorkspace, setCurrentWorkspace] = useState('torq-dev');
  const [currentPage, setCurrentPage] = useState('workflows');
  const [notifStates, setNotifStates] = useState(PHASE1_INITIAL_STATES);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [activeCaseKey, setActiveCaseKey] = useState<string | null>(null);
  const [activeWorkflowName, setActiveWorkflowName] = useState<string | null>(null);
  const [hoverRow, setHoverRow] = useState<Phase1NotifRow | null>(null);
  const [hoverPlacement, setHoverPlacement] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [previewPinned, setPreviewPinned] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<TorqSettingsSection>('preferences');
  const [settingsAiCreditsWorkspace, setSettingsAiCreditsWorkspace] = useState<string | undefined>();
  const [crossWorkspaceTargetId, setCrossWorkspaceTargetId] = useState<string | null>(null);
  const [contentLoadProfile, setContentLoadProfile] = useState<SimulatedLoadProfile>('default');
  const crossWorkspaceLandRef = useRef<(() => void) | null>(null);
  const hoverLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  function navigate(pageId: string) {
    setCurrentPage(pageId);
    if (pageId !== 'cases') {
      setActiveCaseKey(null);
    }
    setActiveWorkflowName(null);
    clearHoverPreview();
  }

  function applyFullPageFromNotif(row: Phase1NotifRow) {
    if (row.target.type === 'case') {
      setCurrentPage('cases');
      setActiveCaseKey(row.target.caseKey);
      setActiveWorkflowName(null);
    } else if (row.target.type === 'workflow') {
      setCurrentPage('workflows');
      setActiveCaseKey(null);
      setActiveWorkflowName(row.target.workflowName);
    } else {
      setCurrentPage('workflows');
      setActiveCaseKey(null);
      setActiveWorkflowName(null);
    }
  }

  function collapseFloatingDrawerAndPreview() {
    setInboxOpen(false);
    clearHoverPreview();
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

  const finishCrossWorkspaceTransition = useCallback(() => {
    const land = crossWorkspaceLandRef.current;
    const targetId = crossWorkspaceTargetId;
    crossWorkspaceLandRef.current = null;
    setCrossWorkspaceTargetId(null);
    if (targetId) {
      setCurrentWorkspace(targetId);
      setContentLoadProfile('workspace-switch');
    }
    land?.();
    window.setTimeout(() => setContentLoadProfile('default'), 1600);
  }, [crossWorkspaceTargetId]);

  const beginCrossWorkspaceNavigation = useCallback(
    (row: Phase1NotifRow, land: () => void) => {
      setInboxOpen(false);
      clearHoverPreview();
      crossWorkspaceLandRef.current = land;
      setCrossWorkspaceTargetId(row.workspaceId);
    },
    [clearHoverPreview],
  );

  const isCrossWorkspace = useCallback(
    (row: Phase1NotifRow) => row.workspaceId !== currentWorkspace,
    [currentWorkspace],
  );

  const landFromNotif = useCallback(
    (row: Phase1NotifRow) => {
      if (row.avatarIcon === 'ai') {
        openAiCreditsSettings(row.workspace);
        return;
      }
      applyFullPageFromNotif(row);
    },
    [openAiCreditsSettings],
  );

  function handleInboxSelect(row: Phase1NotifRow) {
    if (isCrossWorkspace(row)) {
      beginCrossWorkspaceNavigation(row, () => landFromNotif(row));
      return;
    }

    if (row.avatarIcon === 'ai') {
      openAiCreditsSettings(row.workspace);
      return;
    }

    applyFullPageFromNotif(row);
    collapseFloatingDrawerAndPreview();
  }

  function handleDrawerPrimaryAction(row: Phase1NotifRow) {
    if (isCrossWorkspace(row)) {
      beginCrossWorkspaceNavigation(row, () => landFromNotif(row));
      return;
    }

    if (row.avatarIcon === 'ai') {
      openAiCreditsSettings(row.workspace);
      return;
    }

    applyFullPageFromNotif(row);
    collapseFloatingDrawerAndPreview();
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
      if (typeof detail === 'string') {
        const section = normalizeTorqSettingsSection(detail);
        setSettingsSection(section);
        if (section === 'ai-credits') {
          setSettingsAiCreditsWorkspace(resolveWorkspaceIdFromName(currentWorkspace));
        } else {
          setSettingsAiCreditsWorkspace(undefined);
        }
      } else {
        const section = normalizeTorqSettingsSection(detail.section);
        setSettingsSection(section);
        if (section === 'ai-credits' && detail.workspaceName) {
          setSettingsAiCreditsWorkspace(resolveWorkspaceIdFromName(detail.workspaceName));
        } else if (section !== 'ai-credits') {
          setSettingsAiCreditsWorkspace(undefined);
        }
      }
      setSettingsOpen(true);
      setInboxOpen(false);
      clearHoverPreview();
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSettingsOpen(false);
    }

    window.addEventListener('torq:open-settings', onOpenSettings);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('torq:open-settings', onOpenSettings);
      window.removeEventListener('keydown', onKey);
    };
  }, [clearHoverPreview, currentWorkspace]);

  useEffect(() => {
    clearHoverPreview();
    setInboxOpen(false);
  }, [phase, clearHoverPreview]);

  useEffect(() => {
    return () => {
      if (hoverLeaveTimerRef.current) clearTimeout(hoverLeaveTimerRef.current);
    };
  }, []);

  const previewPlacement =
    showPreviewCard && hoverRow && hoverPlacement
      ? { mode: 'hover' as const, ...hoverPlacement }
      : null;

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
              : 'navigate'
      }
      onRowHover={showPreviewCard ? handleRowHover : undefined}
      variant="floating"
    />
  );

  return (
    <div
      className="phase1-root h-screen w-full overflow-hidden bg-[var(--color-surface-primary)]"
      data-prototype-phase={phase}
    >
      <div className="flex h-full min-w-0">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          currentWorkspace={currentWorkspace}
          onWorkspaceChange={setCurrentWorkspace}
          currentPage={currentPage}
          onNavigate={navigate}
          inboxOpen={inboxOpen}
          onInboxToggle={() => setInboxOpen((o) => !o)}
          inboxUnreadCount={badge.count}
          inboxBadgeCritical={badge.critical}
        />

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {!crossWorkspaceTargetId && (
              <Phase1ContentWithLoadSequence
                pageId={currentPage}
                caseKey={activeCaseKey}
                workflowName={activeWorkflowName}
                workspaceId={currentWorkspace}
                workspaceName={workspaceLabel(currentWorkspace)}
                loadProfile={contentLoadProfile}
                onCloseCase={() => setActiveCaseKey(null)}
                onNavigateCase={setActiveCaseKey}
              />
            )}
          </div>
        </div>
      </div>

      {inboxOpen && (
        <button
          type="button"
          aria-label="Close inbox"
          className="fixed z-[44] cursor-default border-0 bg-transparent p-0"
          style={{
            top: 0,
            right: 0,
            bottom: 0,
            left: getSidebarWidth(sidebarCollapsed),
          }}
          onClick={collapseFloatingDrawerAndPreview}
        />
      )}

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

      <PhaseFab phase={phase} onPhaseChange={onPhaseChange} />

      <TorqSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialSection={settingsSection}
        initialAiCreditsWorkspace={settingsAiCreditsWorkspace}
        currentWorkspaceId={currentWorkspace}
      />

      <AnimatePresence>
        {crossWorkspaceTargetId && (
          <Phase1CrossWorkspaceOverlay
            key={crossWorkspaceTargetId}
            targetWorkspaceId={crossWorkspaceTargetId}
            onComplete={finishCrossWorkspaceTransition}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
