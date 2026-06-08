'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export type SelectSize = 'small' | 'medium' | 'large';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: SelectSize;
}

const SIZE_CLASSES: Record<SelectSize, string> = {
  small: 'h-8 px-3 text-[length:var(--font-size-body2)]',
  medium: 'h-9 px-3 text-[length:var(--font-size-body1)]',
  large: 'h-12 px-4 text-[length:var(--font-size-body0)]',
};

/**
 * Torq Design System — select (React port of EmbeddedSelect / FilterSelect sizing)
 */
export function Select({ size = 'medium', className = '', children, disabled, ...rest }: SelectProps) {
  return (
    <div className={`relative inline-flex ${disabled ? 'opacity-40' : ''}`}>
      <select
        disabled={disabled}
        className={[
          'appearance-none rounded-[var(--radius-md)] border border-[var(--border-level-3)]',
          'bg-[var(--surface)] text-[var(--text-primary)] font-[family-name:var(--font-family)]',
          'pr-8 outline-none transition-[border-color] duration-[120ms]',
          'hover:border-[var(--neutral-7)]',
          'focus:border-[var(--neutral-12)] focus:ring-1 focus:ring-[var(--neutral-12)]/10',
          'disabled:cursor-not-allowed',
          SIZE_CLASSES[size],
          className,
        ].join(' ')}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]"
        aria-hidden
      />
    </div>
  );
}
