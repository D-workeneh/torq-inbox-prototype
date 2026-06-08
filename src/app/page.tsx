'use client';

import { useEffect, useState } from 'react';
import {
  PhaseFab,
  loadPrototypePhase,
  savePrototypePhase,
  type PrototypePhase,
} from '@/components/PhaseFab';
import { Phase1Experience } from '@/components/phase1/Phase1Experience';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<PrototypePhase>('floating-drawer-preview');

  useEffect(() => {
    setMounted(true);
    setPhase(loadPrototypePhase());
  }, []);

  if (!mounted) return null;

  return (
    <Phase1Experience
      phase={phase}
      onPhaseChange={(p) => {
        setPhase(p);
        savePrototypePhase(p);
      }}
    />
  );
}
