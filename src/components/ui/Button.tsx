'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

/** Torq Button themes — see design-system/COMPONENTS_INVENTORY.md */
export type ButtonTheme = 'primary' | 'secondary' | 'third' | 'danger';

/** @deprecated Use ButtonTheme. Legacy names are normalized internally. */
export type ButtonVariant =
  | ButtonTheme
  | 'tertiary'
  | 'dark'
  | 'ghost'
  | 'link'
  | 'success';

export type ButtonSize = 'small' | 'medium' | 'large';

/** @deprecated Use small | medium | large */
export type LegacyButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Torq `theme` prop */
  theme?: ButtonTheme;
  /** Alias for `theme` — legacy API */
  variant?: ButtonVariant;
  size?: ButtonSize | LegacyButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

function normalizeTheme(variant?: ButtonVariant, theme?: ButtonTheme): ButtonTheme {
  const v = theme ?? variant ?? 'primary';
  switch (v) {
    case 'tertiary':
    case 'ghost':
    case 'link':
      return 'third';
    case 'dark':
      return 'primary';
    case 'success':
      return 'primary';
    default:
      return v;
  }
}

function normalizeSize(size: ButtonSize | LegacyButtonSize = 'medium'): ButtonSize {
  if (size === 'sm') return 'small';
  if (size === 'md') return 'medium';
  if (size === 'lg') return 'large';
  return size;
}

const THEME_CLASSES: Record<ButtonTheme, string> = {
  primary: [
    'bg-[var(--button-primary-bg-static)] text-[var(--text-on-primary)] border border-transparent',
    'hover:bg-[var(--button-primary-bg-hover)]',
    'active:bg-[var(--button-primary-bg-active)]',
  ].join(' '),
  secondary: [
    'bg-[var(--button-secondary-bg-static)] text-[var(--button-secondary-content)]',
    'border border-[var(--button-secondary-border)]',
    'hover:bg-[var(--button-secondary-bg-hover)] hover:border-[var(--button-secondary-border)]',
    'active:bg-[var(--button-secondary-bg-active)] active:border-[var(--button-secondary-border)]',
    'disabled:bg-[var(--button-secondary-bg-static)] disabled:text-[var(--button-secondary-content-disabled)]',
    'disabled:border-[var(--button-secondary-border-disabled)]',
  ].join(' '),
  third: [
    'bg-transparent text-[var(--text-primary)] border border-transparent',
    'hover:bg-[var(--button-third-bg-hover)]',
    'active:bg-[var(--bg-active-level-1)]',
    'disabled:text-[var(--text-disabled)]',
  ].join(' '),
  danger: [
    'bg-[var(--button-danger-bg-static)] text-[var(--text-on-primary)] border border-transparent',
    'hover:bg-[var(--button-danger-bg-hover)]',
    'active:bg-[var(--button-danger-bg-hover)]',
  ].join(' '),
};

const VARIANT_EXTRA: Partial<Record<ButtonVariant, string>> = {
  ghost: 'text-[var(--royal)] hover:bg-[var(--royal-1)]',
  link: 'text-[var(--royal)] underline-offset-2 hover:underline px-0 min-h-0 h-auto',
  success: [
    'bg-[var(--forest)] text-[var(--text-on-primary)] border border-transparent',
    'hover:brightness-95 active:brightness-90',
  ].join(' '),
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  small:
    'h-8 min-w-[76px] px-3 gap-2 rounded-[var(--radius-md)] text-[length:var(--font-size-body2)] font-medium capitalize',
  medium:
    'h-9 px-3 gap-2 rounded-[var(--radius-md)] text-[length:var(--font-size-body1)] font-medium capitalize',
  large:
    'h-12 px-4 gap-2 rounded-[var(--radius-md)] text-[length:var(--font-size-body0)] font-medium capitalize',
};

/** Notification center secondary (Figma tq text button — small) */
const SECONDARY_SMALL_CLASSES =
  'h-8 min-w-[76px] px-3 gap-2 rounded-[var(--radius-md)] text-[length:var(--font-size-body2)] font-medium normal-case';

const ICON_SIZE: Record<ButtonSize, string> = {
  small: 'h-3 w-3',
  medium: 'h-3 w-3',
  large: 'h-4 w-4',
};

/**
 * Torq Design System — Button (React port of design-system TButton / components-library Button)
 *
 * Secondary small matches Notification center Figma: white fill, neutral-4 stroke, 32px, 6px radius, sentence case.
 */
export function Button({
  theme,
  variant,
  size = 'medium',
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const resolvedTheme = normalizeTheme(variant, theme);
  const resolvedSize = normalizeSize(size);
  const rawVariant = variant ?? theme ?? 'primary';
  const isDisabled = disabled || loading;
  const extra = VARIANT_EXTRA[rawVariant as ButtonVariant];
  const isNotificationSecondary = resolvedTheme === 'secondary' && resolvedSize === 'small';

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center',
        'font-[family-name:var(--font-family)]',
        'transition-[background,border-color,color] duration-[120ms]',
        'select-none whitespace-nowrap',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-8)]/30 focus-visible:ring-offset-1',
        isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        isNotificationSecondary ? SECONDARY_SMALL_CLASSES : SIZE_CLASSES[resolvedSize],
        rawVariant === 'success' ? VARIANT_EXTRA.success : THEME_CLASSES[resolvedTheme],
        extra ?? '',
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? (
        <Loader2 className={`${ICON_SIZE[resolvedSize]} animate-spin shrink-0`} />
      ) : (
        leftIcon && <span className={`shrink-0 flex items-center ${ICON_SIZE[resolvedSize]}`}>{leftIcon}</span>
      )}
      {children != null && children !== '' && <span>{children}</span>}
      {!loading && rightIcon && (
        <span className={`shrink-0 flex items-center ${ICON_SIZE[resolvedSize]}`}>{rightIcon}</span>
      )}
    </button>
  );
}
