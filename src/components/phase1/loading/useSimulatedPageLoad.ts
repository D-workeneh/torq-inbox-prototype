'use client';

import { useEffect, useState } from 'react';
import {
  getSimulatedLoadDurations,
  type SimulatedLoadProfile,
} from './simulatedLoadTiming';

export type SimulatedLoadPhase = 'spinner' | 'skeleton' | 'ready';

export function useSimulatedPageLoad(
  loadKey: string,
  profile: SimulatedLoadProfile = 'default',
): SimulatedLoadPhase {
  const [phase, setPhase] = useState<SimulatedLoadPhase>('spinner');

  useEffect(() => {
    setPhase('spinner');
    const { spinnerMs, skeletonMs } = getSimulatedLoadDurations(profile);
    const skeletonTimer = window.setTimeout(() => setPhase('skeleton'), spinnerMs);
    const readyTimer = window.setTimeout(
      () => setPhase('ready'),
      spinnerMs + skeletonMs,
    );
    return () => {
      window.clearTimeout(skeletonTimer);
      window.clearTimeout(readyTimer);
    };
  }, [loadKey, profile]);

  return phase;
}
