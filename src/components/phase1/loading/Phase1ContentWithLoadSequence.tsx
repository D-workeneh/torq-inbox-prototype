'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Phase1ContentArea } from '../Phase1ContentArea';
import { Phase1PageSkeleton, resolvePhase1SkeletonVariant } from './Phase1PageSkeleton';
import { TorqPixelLoader } from './TorqPixelLoader';
import type { SimulatedLoadProfile } from './simulatedLoadTiming';
import { useSimulatedPageLoad } from './useSimulatedPageLoad';

export function Phase1ContentWithLoadSequence({
  pageId,
  caseKey,
  workflowName,
  workspaceId,
  workspaceName,
  loadProfile = 'default',
  onCloseCase,
  onNavigateCase,
}: {
  pageId: string;
  caseKey: string | null;
  workflowName?: string | null;
  workspaceId?: string;
  workspaceName?: string;
  loadProfile?: SimulatedLoadProfile;
  onCloseCase: () => void;
  onNavigateCase?: (caseKey: string) => void;
}) {
  const loadKey = `${workspaceId ?? workspaceName ?? ''}|${pageId}|${caseKey ?? ''}|${workflowName ?? ''}`;
  const loadPhase = useSimulatedPageLoad(loadKey, loadProfile);

  const skeletonVariant = useMemo(
    () => resolvePhase1SkeletonVariant(pageId, caseKey, workflowName ?? null),
    [pageId, caseKey, workflowName],
  );

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
      <AnimatePresence mode="wait">
        {loadPhase === 'spinner' && (
          <motion.div
            key="spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-white"
          >
            <TorqPixelLoader />
          </motion.div>
        )}
        {loadPhase === 'skeleton' && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-20 flex flex-col bg-white"
          >
            <Phase1PageSkeleton variant={skeletonVariant} />
          </motion.div>
        )}
      </AnimatePresence>

      {loadPhase === 'ready' && (
        <motion.div
          key={`content-${loadKey}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        >
          <Phase1ContentArea
            pageId={pageId}
            caseKey={caseKey}
            workflowName={workflowName}
            workspaceName={workspaceName}
            onCloseCase={onCloseCase}
            onNavigateCase={onNavigateCase}
          />
        </motion.div>
      )}
    </div>
  );
}
