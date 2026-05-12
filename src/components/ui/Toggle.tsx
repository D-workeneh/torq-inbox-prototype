'use client';

import React from 'react';

export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'children' | 'type'> {
  /** Controlled on state */
  on: boolean;
  onChange: (next: boolean) => void;
}

/**
 * Pill switch — **on** state uses brand primary blue (design system).
 */
export function Toggle({ on, onChange, className = '', ...rest }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={[
        'relative inline-flex h-5 w-10 shrink-0 rounded-full border transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]/30',
        on
          ? 'bg-[var(--color-primary-500)] border-[var(--color-primary-500)] hover:bg-[var(--color-primary-700)] hover:border-[var(--color-primary-700)]'
          : 'bg-[var(--color-neutral-250)] border-[var(--color-border-3)]',
        className,
      ].join(' ')}
      {...rest}
    >
      <span
        className={[
          'pointer-events-none absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
          on ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  );
}
