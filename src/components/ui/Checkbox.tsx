'use client';

import React, { useEffect, useRef } from 'react';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  indeterminate?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  size?: 'small' | 'medium' | 'sm' | 'md';
  label?: string;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

type CheckboxSize = 'small' | 'medium';

function normalizeCheckboxSize(size: CheckboxProps['size'] = 'small'): CheckboxSize {
  if (size === 'sm') return 'small';
  if (size === 'md') return 'medium';
  return size ?? 'small';
}

const BOX_SIZE: Record<CheckboxSize, string> = {
  small: 'h-4 w-4',
  medium: 'h-4 w-4',
};

/**
 * Torq Design System — Checkbox (React port of design-system TCheckbox)
 */
export function Checkbox({
  checked,
  onChange,
  indeterminate = false,
  disabled = false,
  readonly = false,
  size = 'small',
  label,
  className = '',
  id,
  'aria-label': ariaLabel,
}: CheckboxProps) {
  const resolvedSize = normalizeCheckboxSize(size);
  const isChecked = checked || indeterminate;
  const inactive = disabled || readonly;

  const box = (
    <span
      role="checkbox"
      aria-checked={indeterminate && !checked ? 'mixed' : checked}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === ' ' && !inactive) {
          e.preventDefault();
          onChange();
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!inactive) onChange();
      }}
      className={[
        BOX_SIZE[resolvedSize],
        'rounded-[var(--radius-sm)] border-[1.5px] flex items-center justify-center shrink-0 transition-[background,border-color] duration-[120ms]',
        inactive ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        isChecked
          ? 'bg-[var(--button-primary-bg-static)] border-[var(--button-primary-bg-static)]'
          : 'bg-[var(--surface)] border-[var(--border-level-3)] hover:border-[var(--neutral-7)]',
        readonly && 'cursor-default',
        className,
      ].join(' ')}
    >
      {indeterminate && <Minus className="h-2 w-2 text-[var(--neutral-1)]" strokeWidth={3} />}
      {!indeterminate && checked && <Check className="h-2 w-2 text-[var(--neutral-1)]" strokeWidth={3} />}
    </span>
  );

  if (!label) return <span id={id}>{box}</span>;

  return (
    <label
      id={id}
      className={[
        'inline-flex items-center gap-2 select-none',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      {box}
      <span
        className={[
          'text-[length:var(--font-size-body1)]',
          disabled ? 'text-[var(--text-disabled)]' : 'text-[var(--text-primary)]',
        ].join(' ')}
      >
        {label}
      </span>
    </label>
  );
}

/** Native checkbox — kept for cases that need a real input (e.g. form submit) */
export function NativeCheckbox({
  checked,
  onChange,
  indeterminate,
  disabled,
  size = 'small',
  className = '',
  id,
  'aria-label': ariaLabel,
}: Omit<CheckboxProps, 'readonly' | 'label'>) {
  const resolvedSize = normalizeCheckboxSize(size);
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
        BOX_SIZE[resolvedSize],
        'rounded-[var(--radius-sm)] border border-[var(--border-level-3)] cursor-pointer shrink-0',
        'accent-[var(--button-primary-bg-static)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-8)]/20',
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

/** @deprecated Prefer Checkbox — same visual, div-based */
export function CheckboxButton({
  checked,
  onChange,
  disabled,
  className = '',
  'aria-label': ariaLabel,
}: CheckboxButtonProps) {
  return (
    <Checkbox
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
    />
  );
}
