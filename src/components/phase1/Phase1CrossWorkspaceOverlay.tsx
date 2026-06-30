'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { APP_WORKSPACES } from '@/lib/appNavConfig';
import { PHASE1_LAYOUT_TOP_OFFSET } from './phase1LayoutConstants';
import { getCrossWorkspaceOverlayLoadMs } from './loading/simulatedLoadTiming';
import { TorqPixelLoader } from './loading/TorqPixelLoader';
import { p1Font, p1Text } from './phase1Typography';

const TAB_ANIM_MS = 720;

export function Phase1CrossWorkspaceOverlay({
  targetWorkspaceId,
  onComplete,
}: {
  targetWorkspaceId: string;
  onComplete: () => void;
}) {
  const ws = APP_WORKSPACES.find((w) => w.id === targetWorkspaceId) ?? APP_WORKSPACES[0];
  const letter = (ws.avatarLetter ?? ws.name[0]).toUpperCase();
  const [phase, setPhase] = useState<'tab' | 'loading'>('tab');
  const [loadMs] = useState(getCrossWorkspaceOverlayLoadMs);

  useEffect(() => {
    const toLoad = window.setTimeout(() => setPhase('loading'), TAB_ANIM_MS);
    const done = window.setTimeout(() => onComplete(), TAB_ANIM_MS + loadMs);
    return () => {
      window.clearTimeout(toLoad);
      window.clearTimeout(done);
    };
  }, [onComplete, loadMs]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed right-0 bottom-0 left-0 z-[200] flex flex-col bg-white"
      style={{ top: PHASE1_LAYOUT_TOP_OFFSET }}
      role="status"
      aria-live="polite"
      aria-label={`Opening ${ws.name} in a new tab`}
    >
      <div className="relative flex flex-1 flex-col items-center justify-center bg-white">
        {phase === 'loading' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-5 px-6 text-center"
          >
            <TorqPixelLoader />
            <div>
              <p
                style={{
                  margin: 0,
                  fontFamily: p1Font.family,
                  fontSize: p1Font.body1,
                  fontWeight: 600,
                  color: p1Text.primary,
                }}
              >
                Opening {ws.name}
              </p>
              <p
                style={{
                  margin: '6px 0 0',
                  fontFamily: p1Font.family,
                  fontSize: p1Font.body2,
                  color: p1Text.secondary,
                }}
              >
                Loading workspace in a new tab…
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-[6px] text-sm font-bold text-white"
                style={{ backgroundColor: ws.color }}
              >
                {letter}
              </span>
              <span
                style={{
                  fontFamily: p1Font.family,
                  fontSize: p1Font.body2,
                  color: p1Text.tertiary,
                }}
              >
                Switching context
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
