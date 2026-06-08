'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconLayers } from './phase1/icons';

export type PrototypePhase =
  | 'floating-drawer'
  | 'floating-drawer-preview'
  | 'floating-drawer-action'
  | 'floating-drawer-read-more';

export const PROTOTYPE_PHASE_STORAGE_KEY = 'torq-prototype-phase';

const PHASE_OPTIONS: {
  id: PrototypePhase;
  label: string;
  subtitle?: string;
}[] = [
  { id: 'floating-drawer', label: 'Floating drawer', subtitle: 'Drawer only' },
  {
    id: 'floating-drawer-preview',
    label: 'Floating drawer',
    subtitle: 'Drawer + Preview card',
  },
  {
    id: 'floating-drawer-action',
    label: 'Floating drawer',
    subtitle: 'Drawer + Action',
  },
  {
    id: 'floating-drawer-read-more',
    label: 'Floating drawer',
    subtitle: 'Drawer + Read more',
  },
];

const FAB_BORDER = '#E5E5E5';
const FAB_SHADOW_IDLE = '0 1px 2px rgba(0, 0, 0, 0.05)';
const FAB_SHADOW_HOVER = '0 10px 28px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.06)';

export function loadPrototypePhase(): PrototypePhase {
  if (typeof window === 'undefined') return 'floating-drawer-preview';
  try {
    const stored = localStorage.getItem(PROTOTYPE_PHASE_STORAGE_KEY);
    if (
      stored === 'floating-drawer' ||
      stored === 'floating-drawer-preview' ||
      stored === 'floating-drawer-action' ||
      stored === 'floating-drawer-read-more'
    ) {
      return stored;
    }
    if (stored === 'phase-1-floating-drawer') return 'floating-drawer-preview';
  } catch {
    /* ignore */
  }
  return 'floating-drawer-preview';
}

export function savePrototypePhase(phase: PrototypePhase) {
  try {
    localStorage.setItem(PROTOTYPE_PHASE_STORAGE_KEY, phase);
  } catch {
    /* ignore */
  }
}

export interface PhaseFabProps {
  phase: PrototypePhase;
  onPhaseChange: (phase: PrototypePhase) => void;
}

export function PhaseFab({ phase, onPhaseChange }: PhaseFabProps) {
  const [open, setOpen] = useState(false);
  const [fabHovered, setFabHovered] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  function selectPhase(next: PrototypePhase) {
    onPhaseChange(next);
    savePrototypePhase(next);
    setOpen(false);
  }

  return (
    <div
      ref={rootRef}
      className="fixed z-[90] flex flex-col items-end gap-2 pointer-events-auto"
      style={{ bottom: 24, right: 24 }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Prototype version"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden bg-white py-1"
            style={{
              minWidth: 272,
              border: '1px solid #E5E7EB',
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            }}
          >
            {PHASE_OPTIONS.map((opt) => {
              const selected = phase === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => selectPhase(opt.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '10px 14px',
                    border: 'none',
                    borderLeft: selected ? '3px solid #2563EB' : '3px solid transparent',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: selected ? '#2563EB' : '#6B7280',
                    fontSize: 13,
                    fontWeight: selected ? 600 : 400,
                  }}
                >
                  <span style={{ lineHeight: 1.35 }}>
                    {opt.label}
                    {opt.subtitle ? (
                      <>
                        <br />
                        <span style={{ fontWeight: 400, fontSize: 12, color: '#9CA3AF' }}>
                          {opt.subtitle}
                        </span>
                      </>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        aria-label="Switch prototype version"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setFabHovered(true)}
        onMouseLeave={() => setFabHovered(false)}
        className="flex h-11 w-11 items-center justify-center rounded-full border bg-white transition-[box-shadow,transform] duration-200 ease-out active:scale-[0.97]"
        style={{
          borderColor: FAB_BORDER,
          boxShadow: open || fabHovered ? FAB_SHADOW_HOVER : FAB_SHADOW_IDLE,
        }}
      >
        <IconLayers color="#2563EB" />
      </button>
    </div>
  );
}
