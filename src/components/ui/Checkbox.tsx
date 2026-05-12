'use client';

import React, { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps {
  checked: boolean;
  /** Fired when the user toggles (native `change`); no event argument for simpler wiring */
  onChange: () => void;
  indeterminate?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  id?: string;
  'aria-label'?: string;
}

const sizeClass: Record<NonNullable<CheckboxProps['size']>, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
};

/**
 * Native checkbox with optional **indeterminate** (e.g. “select column” headers).
 * Uses `accent-color` + primary tokens so checked / indeterminate match brand blue.
 */
export function Checkbox({
  checked,
  onChange,
  indeterminate,
  disabled,
  size = 'sm',
  className = '',
  id,
  'aria-label': ariaLabel,
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = Boolean(indeterminate && !checked);
    }
  }, [indeterminate, checked]);

  return (
    <input
      id={id}
      ref={ref}
      type="checkbox"
      role="checkbox"
      aria-checked={indeterminate && !checked ? 'mixed' : checked}
      aria-label={ariaLabel}
      checked={checked}
      disabled={disabled}
      onChange={() => onChange()}
      className={[
        sizeClass[size],
        'rounded-[3px] border border-[var(--color-border-3)] cursor-pointer shrink-0',
        'accent-[var(--color-primary-500)] text-[var(--color-primary-500)]',
        'focus:ring-2 focus:ring-[var(--color-primary-500)]/25 focus:outline-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        className,
      ].join(' ')}
    />
  );
}

export interface CheckboxButtonProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * Square checkbox button (custom) — checked state matches **primary blue** toggles.
 */
export function CheckboxButton({ checked, onChange, disabled, className = '', 'aria-label': ariaLabel }: CheckboxButtonProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => {
        if (!disabled) onChange();
      }}
      className={[
        'h-4 w-4 rounded-[3px] border flex items-center justify-center shrink-0 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]/30',
        disabled && checked
          ? 'cursor-not-allowed border-[var(--color-primary-300)] bg-[var(--color-primary-100)] text-[var(--color-primary-500)]'
          : disabled
            ? 'opacity-40 cursor-not-allowed border-[var(--color-border-2)] bg-[var(--color-surface-secondary)]'
            : checked
              ? 'bg-[var(--color-primary-500)] border-[var(--color-primary-500)] hover:bg-[var(--color-primary-700)] hover:border-[var(--color-primary-700)]'
              : 'bg-white border-[var(--color-border-3)] hover:border-[var(--color-primary-300)]',
        className,
      ].join(' ')}
    >
      {checked && <Check className={`h-2.5 w-2.5 ${disabled ? 'text-[var(--color-primary-500)]' : 'text-white'}`} strokeWidth={3} />}
    </button>
  );
}
