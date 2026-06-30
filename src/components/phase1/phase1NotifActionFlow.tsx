'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import type { Phase1BuiltInActionId } from './phase1BuiltInNotifActions';
import { getPhase1BuiltInActionResultLabel } from './phase1BuiltInNotifActions';
import type { Phase1NotifRow } from './types';
import { p1Font } from './phase1Typography';

export const PHASE1_NOTIF_ACTION_COUNTDOWN_MS = 5000;
export const PHASE1_NOTIF_ACTION_EXECUTING_MS = 800;

const UNDO_RING_COLOR = '#EA231A';
const REJECT_RESULT_COLOR = '#EA231A';
const SUCCESS_RESULT_COLOR = '#29CA88';
const UNDO_RING_TRACK = 'var(--border-level-2)';

export type Phase1NotifActionPhase = 'idle' | 'countdown' | 'executing';

/** Rounded-rect red ring that drains clockwise — label becomes Undo. */
export function Phase1CountdownUndoButton({
  progress,
  onUndo,
}: {
  /** 1 = full ring, 0 = empty */
  progress: number;
  onUndo: () => void;
}) {
  const deg = progress * 360;
  const ring = 1.5;

  return (
    <div
      style={{
        display: 'inline-flex',
        padding: ring,
        borderRadius: `calc(var(--radius-sm) + ${ring}px)`,
        background: `conic-gradient(
          from -90deg,
          ${UNDO_RING_COLOR} 0deg,
          ${UNDO_RING_COLOR} ${deg}deg,
          ${UNDO_RING_TRACK} ${deg}deg,
          ${UNDO_RING_TRACK} 360deg
        )`,
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onUndo();
        }}
        className="flex h-8 cursor-pointer items-center justify-center border-0 bg-[var(--surface)] px-3 text-[length:var(--font-size-body1)] font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover-level-1)] select-none"
        style={{
          borderRadius: 'var(--radius-sm)',
          fontFamily: p1Font.family,
        }}
        aria-label="Undo action"
      >
        Undo
      </button>
    </div>
  );
}

export function usePhase1NotifActionCountdown(
  onCommit: (actionId: Phase1BuiltInActionId) => void,
) {
  const [actionPhase, setActionPhase] = useState<Phase1NotifActionPhase>('idle');
  const [pendingAction, setPendingAction] = useState<Phase1BuiltInActionId | null>(null);
  const [countdownProgress, setProgress] = useState(1);

  const phaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const execTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);

  useEffect(
    () => () => {
      if (phaseTimer.current) clearTimeout(phaseTimer.current);
      if (execTimer.current) clearTimeout(execTimer.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  function clearTimers() {
    if (phaseTimer.current) clearTimeout(phaseTimer.current);
    if (execTimer.current) clearTimeout(execTimer.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }

  function startCountdown(actionId: Phase1BuiltInActionId) {
    setActionPhase('countdown');
    setPendingAction(actionId);
    setProgress(1);

    startRef.current = performance.now();
    function tick(now: number) {
      const elapsed = now - startRef.current;
      const p = Math.max(0, 1 - elapsed / PHASE1_NOTIF_ACTION_COUNTDOWN_MS);
      setProgress(p);
      if (p > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);

    phaseTimer.current = setTimeout(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setActionPhase('executing');
      setProgress(0);

      execTimer.current = setTimeout(() => {
        setActionPhase('idle');
        setPendingAction(null);
        onCommit(actionId);
      }, PHASE1_NOTIF_ACTION_EXECUTING_MS);
    }, PHASE1_NOTIF_ACTION_COUNTDOWN_MS);
  }

  function handleUndo() {
    clearTimers();
    setActionPhase('idle');
    setPendingAction(null);
    setProgress(1);
  }

  return {
    actionPhase,
    pendingAction,
    countdownProgress,
    startCountdown,
    handleUndo,
  };
}

export function Phase1NotifActionResult({
  row,
  actionId,
}: {
  row: Phase1NotifRow;
  actionId: Phase1BuiltInActionId;
}) {
  const isReject = actionId === 'reject';
  const ResultIcon = isReject ? X : Check;

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}
      onClick={(e) => e.stopPropagation()}
    >
      <ResultIcon
        className="h-3.5 w-3.5 shrink-0"
        strokeWidth={2.5}
        aria-hidden
        style={{ color: isReject ? REJECT_RESULT_COLOR : SUCCESS_RESULT_COLOR }}
      />
      <span
        style={{
          fontSize: p1Font.body2,
          fontFamily: p1Font.family,
          fontWeight: 500,
          color: 'var(--neutral-8)',
        }}
      >
        {getPhase1BuiltInActionResultLabel(actionId, row)}
      </span>
    </div>
  );
}

export function Phase1NotifActionExecuting() {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}
      onClick={(e) => e.stopPropagation()}
    >
      <Loader2
        className="h-4 w-4 shrink-0 animate-spin text-[var(--neutral-6)]"
        aria-hidden
      />
      <span
        style={{
          fontSize: p1Font.body2,
          fontFamily: p1Font.family,
          color: 'var(--neutral-6)',
        }}
      >
        Processing…
      </span>
    </div>
  );
}
