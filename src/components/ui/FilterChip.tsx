'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface FilterChipProps {
  familyLabel: string;
  valueSummary?: string;
  icon?: React.ReactNode;
  onEdit?: () => void;
  onRemove: () => void;
  expanded?: boolean;
  chipButtonRef?: React.RefObject<HTMLButtonElement | null>;
  removeLabel: string;
  className?: string;
}

/**
 * Notification center — applied filter family chip
 * Figma: Notification-center node 5899-78350 (white pill, thin border, bold label + values)
 */
export function FilterChip({
  familyLabel,
  valueSummary,
  icon,
  onEdit,
  onRemove,
  expanded = false,
  chipButtonRef,
  removeLabel,
  className = '',
}: FilterChipProps) {
  return (
    <span
      className={[
        'inline-flex h-6 max-w-full min-w-0 items-stretch overflow-hidden rounded-[var(--radius-full)]',
        'border bg-[var(--filter-chip-bg)] text-[length:var(--font-size-body2)] leading-none',
        'transition-[border-color,box-shadow] duration-150',
        expanded
          ? 'border-[var(--border-level-3)] shadow-[0_1px_2px_rgba(9,10,11,0.06)]'
          : 'border-[var(--filter-chip-border)]',
        className,
      ].join(' ')}
    >
      <button
        ref={chipButtonRef}
        type="button"
        onClick={onEdit}
        aria-expanded={expanded}
        className={[
          'inline-flex min-w-0 flex-1 items-center gap-1.5 border-0 bg-transparent py-0 pl-2 pr-1',
          'text-left text-[var(--text-secondary)] cursor-pointer',
          'hover:text-[var(--text-primary)] focus-visible:outline-none',
        ].join(' ')}
      >
        {icon && <span className="flex shrink-0 items-center text-[var(--text-secondary)]">{icon}</span>}
        <span className="min-w-0 truncate">
          <span className="font-bold text-[var(--text-primary)]">{familyLabel}</span>
          {valueSummary ? <span className="font-normal"> {valueSummary}</span> : null}
        </span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label={removeLabel}
        className={[
          'flex w-6 shrink-0 items-center justify-center border-0 bg-transparent pr-1.5 pl-0',
          'text-[var(--text-secondary)] cursor-pointer',
          'hover:text-[var(--text-primary)] focus-visible:outline-none',
        ].join(' ')}
      >
        <X className="h-3 w-3" strokeWidth={2} aria-hidden />
      </button>
    </span>
  );
}

/** Grey card wrapping applied filter chips + add control (Notification center filter bar) */
export function AppliedFiltersBar({
  children,
  trailing,
  className = '',
}: {
  children: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        'group w-full rounded-[var(--radius-xl)] border border-[var(--border-level-2)] bg-[var(--bg-static-2)] p-2',
        className,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{children}</div>
        {trailing}
      </div>
    </div>
  );
}
