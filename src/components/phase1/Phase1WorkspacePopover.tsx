'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/Checkbox';
import { PHASE1_WORKSPACES, type Phase1Workspace } from './data';
import { IconSearch } from './icons';
import { usePortalPos } from './usePortalPos';

function WsCheckbox({ checked, partial }: { checked: boolean; partial?: boolean }) {
  return (
    <Checkbox
      checked={checked && !partial}
      indeterminate={Boolean(partial && !checked)}
      onChange={() => {}}
      size="sm"
      className="pointer-events-none"
      aria-hidden
    />
  );
}

export interface Phase1WorkspacePopoverProps {
  selected: string[];
  onChange: (ids: string[]) => void;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

/** Multi-select workspace filter — mirrors Phase 2 WorkspacePopover */
export function Phase1WorkspacePopover({
  selected,
  onChange,
  onClose,
  anchorEl,
}: Phase1WorkspacePopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [local, setLocal] = useState<string[]>(selected);
  const pos = usePortalPos(anchorEl, 'left');

  useEffect(() => {
    setLocal(selected);
  }, [selected]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      const t = e.target as Node;
      if (ref.current?.contains(t) || anchorEl?.contains(t)) return;
      onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, anchorEl]);

  const allSelected = local.length === 0;
  const filtered = PHASE1_WORKSPACES.filter((ws) =>
    ws.name.toLowerCase().includes(query.toLowerCase()),
  );

  function applyFilter(next: string[]) {
    const resolved = next.length === PHASE1_WORKSPACES.length ? [] : next;
    setLocal(resolved);
    onChange(resolved);
  }

  function toggleAll() {
    applyFilter([]);
  }

  function toggleWs(id: string) {
    const next = local.includes(id) ? local.filter((x) => x !== id) : [...local, id];
    applyFilter(next);
  }

  if (!pos || typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      ref={ref}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.14 }}
      className="w-56 overflow-hidden rounded-md border border-[var(--border-level-2)] bg-[var(--surface)] font-[family-name:var(--font-family)] shadow-xl"
    >
      <div className="flex items-center gap-2 border-b border-[var(--border-level-1)] px-3 py-2.5">
        <IconSearch />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find workspace..."
          className="flex-1 bg-transparent text-[length:var(--font-size-body1)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] outline-none"
        />
      </div>

      <div className="py-1">
        <button
          type="button"
          onClick={toggleAll}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-[length:var(--font-size-body1)] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover-level-2)]"
        >
          <WsCheckbox checked={allSelected} partial={!allSelected && local.length > 0} />
          <span className="flex-1 text-left font-medium">
            All workspaces ({PHASE1_WORKSPACES.length})
          </span>
        </button>

        <div className="mx-3 my-1 border-t border-[var(--border-level-1)]" />

        {filtered.map((ws: Phase1Workspace) => {
          const isChecked = allSelected || local.includes(ws.id);
          return (
            <button
              key={ws.id}
              type="button"
              onClick={() => toggleWs(ws.id)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-[length:var(--font-size-body1)] transition-colors hover:bg-[var(--bg-hover-level-2)]"
            >
              <WsCheckbox checked={isChecked} />
              <span className="flex min-w-0 flex-col items-start">
                <span className="truncate text-[var(--text-primary)]">{ws.name}</span>
                {ws.isCurrent && (
                  <span className="text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">
                    Current workspace
                  </span>
                )}
              </span>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p className="px-3 py-3 text-center text-[length:var(--font-size-body1)] text-[var(--text-tertiary)]">
            No workspaces found
          </p>
        )}
      </div>
    </motion.div>,
    document.body,
  );
}
