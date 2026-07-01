'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function NotifChannelHeaderCell({
  label,
  icon,
  tooltip,
}: {
  label: string;
  icon: React.ReactNode;
  tooltip: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  function handleEnter() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowTooltip(true), 300);
  }

  function handleLeave() {
    setShowTooltip(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  return (
    <div
      className="relative flex w-[104px] items-center justify-center gap-1.5 justify-self-center"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span className="shrink-0 text-[var(--text-tertiary)]">{icon}</span>
      <span className="text-[length:var(--font-size-body2)] font-semibold text-[var(--text-tertiary)]">
        {label}
      </span>
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            role="tooltip"
            className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 w-44 -translate-x-1/2 rounded-[var(--radius-sm)] bg-[var(--color-neutral-800)] px-2.5 py-2 text-center text-[length:var(--font-size-xs)] leading-snug text-white shadow-lg"
          >
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
