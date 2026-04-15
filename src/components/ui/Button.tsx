'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant =
  | 'primary'   // Blue fill — main CTA
  | 'secondary' // Border + neutral — secondary action
  | 'danger'    // Red fill — destructive action
  | 'success'   // Teal fill — positive / approve action
  | 'ghost'     // Transparent, blue text — tertiary action
  | 'link';     // No chrome, blue text — inline link-style

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon rendered before the label */
  leftIcon?: React.ReactNode;
  /** Icon rendered after the label */
  rightIcon?: React.ReactNode;
  /** Replaces content with a spinner and disables interaction */
  loading?: boolean;
  /** Stretch to full container width */
  fullWidth?: boolean;
  children?: React.ReactNode;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: [
    'bg-[var(--color-primary-500)] text-white',
    'hover:bg-[var(--color-primary-700)]',
    'active:bg-[var(--color-primary-800)]',
    'disabled:bg-[var(--color-neutral-200)] disabled:text-[var(--color-text-disabled)]',
  ].join(' '),

  secondary: [
    'border border-[var(--color-border-2)] bg-transparent text-[var(--color-text-primary)]',
    'hover:bg-[var(--color-neutral-100)]',
    'active:bg-[var(--color-neutral-150)]',
    'disabled:border-[var(--color-border-1)] disabled:text-[var(--color-text-disabled)] disabled:bg-transparent',
  ].join(' '),

  danger: [
    'bg-[var(--color-red-500)] text-white',
    'hover:bg-[var(--color-red-700)]',
    'active:bg-[var(--color-red-700)]',
    'disabled:bg-[var(--color-neutral-200)] disabled:text-[var(--color-text-disabled)]',
  ].join(' '),

  success: [
    'bg-[var(--color-teal-500)] text-white',
    'hover:bg-[var(--color-teal-600)]',
    'active:bg-[var(--color-teal-700)]',
    'disabled:bg-[var(--color-neutral-200)] disabled:text-[var(--color-text-disabled)]',
  ].join(' '),

  ghost: [
    'bg-transparent text-[var(--color-primary-500)]',
    'hover:bg-[var(--color-primary-50)]',
    'active:bg-[var(--color-primary-100)]',
    'disabled:text-[var(--color-text-disabled)]',
  ].join(' '),

  link: [
    'bg-transparent text-[var(--color-primary-500)] underline-offset-2',
    'hover:underline',
    'disabled:text-[var(--color-text-disabled)]',
  ].join(' '),
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-7 px-3 gap-1.5 rounded-[var(--radius-sm)] text-[var(--font-size-sm)] font-semibold',
  md: 'h-8 px-4 gap-2 rounded-[var(--radius-md)] text-[var(--font-size-base)] font-semibold',
  lg: 'h-10 px-5 gap-2 rounded-[var(--radius-md)] text-[var(--font-size-md)] font-semibold',
};

const ICON_SIZE: Record<ButtonSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-4 w-4',
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Torq Design System — Button
 *
 * Source: Figma "Design-system-next-gen" node 91-361
 *
 * @example
 * <Button variant="primary" leftIcon={<Plus />}>Create workflow</Button>
 * <Button variant="secondary" size="sm">Cancel</Button>
 * <Button variant="danger" loading>Delete</Button>
 */
export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center',
        'transition-colors duration-150',
        'select-none whitespace-nowrap',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)] focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? (
        <Loader2 className={`${ICON_SIZE[size]} animate-spin`} />
      ) : (
        leftIcon && <span className={`shrink-0 flex items-center ${ICON_SIZE[size]}`}>{leftIcon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && rightIcon && (
        <span className={`shrink-0 flex items-center ${ICON_SIZE[size]}`}>{rightIcon}</span>
      )}
    </button>
  );
}
