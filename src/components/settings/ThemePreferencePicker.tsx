'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Monitor, Moon, Sun, Zap } from 'lucide-react';

export type ThemeMode = 'light' | 'dark' | 'system' | 'torq';

const THEME_OPTIONS: {
  id: ThemeMode;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
  { id: 'torq', label: 'Torq', icon: Zap },
];

const PINK_LIGHT_PATHS = [
  'M188 38 L202 22 L194 22 L214 6',
  'M222 40 L236 26 L228 26 L248 10',
  'M252 36 L262 24 L256 24 L272 8',
  'M200 42 L208 32 L204 32 L216 18',
];

function TorqPinkLights({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 280 44" preserveAspectRatio="none">
        {PINK_LIGHT_PATHS.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            stroke="#ff2d9a"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 5px rgba(255, 45, 154, 0.85))' }}
            initial={{ opacity: 0.35, pathLength: 0.85 }}
            animate={{
              opacity: [0.35, 1, 0.45, 1, 0.35],
              pathLength: [0.85, 1, 0.9, 1, 0.85],
            }}
            transition={{
              duration: 0.55 + i * 0.08,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.1,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function ThemePreferencePicker({
  value,
  onChange,
}: {
  value: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}) {
  const [open, setOpen] = useState(false);
  const [torqHovered, setTorqHovered] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = THEME_OPTIONS.find((o) => o.id === value) ?? THEME_OPTIONS[2];
  const SelectedIcon = selected.icon;

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function pick(mode: ThemeMode) {
    onChange(mode);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex min-w-[148px] items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-level-2)] bg-[var(--surface)] px-3 py-2 text-[length:var(--font-size-body1)] text-[var(--text-primary)] transition-colors hover:border-[var(--border-level-3)] hover:bg-[var(--bg-hover-level-2)]"
      >
        <SelectedIcon className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" strokeWidth={1.75} />
        <span className="flex-1 text-left">{selected.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--text-tertiary)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label="Interface theme"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-level-2)] bg-[var(--surface)] py-1 shadow-[var(--shadow-md)]"
          >
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = value === opt.id;
              const isTorq = opt.id === 'torq';

              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => pick(opt.id)}
                  onMouseEnter={() => isTorq && setTorqHovered(true)}
                  onMouseLeave={() => isTorq && setTorqHovered(false)}
                  className={[
                    'relative mx-1 flex w-[calc(100%-8px)] items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-left transition-colors',
                    isSelected
                      ? 'bg-[var(--bg-active-level-1)] text-[var(--text-primary)] font-medium'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-primary)]',
                    isTorq && torqHovered ? 'ring-1 ring-[var(--neutral-12)]' : '',
                  ].join(' ')}
                >
                  <TorqPinkLights visible={isTorq && torqHovered} />
                  <Icon className="relative z-[1] h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span className="relative z-[1] text-[length:var(--font-size-body1)]">{opt.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
