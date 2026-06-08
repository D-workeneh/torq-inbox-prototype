'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

/** Torq Switch sizes — matches components-library Switch.vue / Notification center Figma */
export type SwitchSize = 'small' | 'medium' | 'large';

export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'children' | 'type'> {
  on: boolean;
  onChange: (next: boolean) => void;
  size?: SwitchSize;
  disabled?: boolean;
  loading?: boolean;
  /** Optional label (right of switch) */
  label?: string;
  id?: string;
}

type SizeSpec = {
  trackW: number;
  trackH: number;
  thumb: number;
  padding: number;
};

const SIZE: Record<SwitchSize, SizeSpec> = {
  small: { trackW: 28, trackH: 16, thumb: 12, padding: 2 },
  medium: { trackW: 32, trackH: 20, thumb: 16, padding: 2 },
  large: { trackW: 40, trackH: 24, thumb: 20, padding: 2 },
};

/**
 * Torq Design System — Switch
 * Source: Notification center Figma + `@torqio/frontend-modules` Switch (vuetify theme)
 *
 * Off: neutral-4 track, white knob
 * On: royal-5 track, white knob
 */
export function Switch({
  on,
  onChange,
  size = 'medium',
  disabled = false,
  loading = false,
  label,
  id,
  className = '',
  ...rest
}: ToggleProps) {
  const spec = SIZE[size];
  const travel = spec.trackW - spec.padding * 2 - spec.thumb;
  const inactive = disabled || loading;

  const trackBg = inactive
    ? on
      ? 'var(--switch-bg-on-disabled)'
      : 'var(--switch-bg-off-disabled)'
    : on
      ? 'var(--switch-bg-on-idle)'
      : 'var(--switch-bg-off-idle)';

  const knob = (
    <span
      className="block shrink-0 rounded-full bg-[var(--switch-knob-off-idle)] shadow-[0_1px_2px_rgba(9,10,11,0.12)] transition-transform duration-200 ease-in-out"
      style={{
        width: spec.thumb,
        height: spec.thumb,
        transform: on ? `translateX(${travel}px)` : 'translateX(0)',
      }}
    />
  );

  const control = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={on}
      aria-busy={loading}
      disabled={inactive}
      data-testid={id ? `switch-${id}` : undefined}
      onClick={() => !inactive && onChange(!on)}
      className={[
        'relative inline-flex shrink-0 items-center rounded-full transition-[background-color] duration-200 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--royal)]/30 focus-visible:ring-offset-1',
        inactive ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
        className,
      ].join(' ')}
      style={{
        width: spec.trackW,
        height: spec.trackH,
        padding: spec.padding,
        backgroundColor: trackBg,
      }}
      {...rest}
    >
      {loading ? (
        <span
          className="flex items-center justify-center"
          style={{ width: spec.thumb, height: spec.thumb }}
        >
          <Loader2
            className="animate-spin text-[var(--neutral-1)]"
            style={{ width: spec.thumb - 4, height: spec.thumb - 4 }}
          />
        </span>
      ) : (
        knob
      )}
    </button>
  );

  if (!label) return control;

  return (
    <label
      htmlFor={id}
      className={[
        'inline-flex items-center gap-2 select-none',
        inactive ? 'cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      {control}
      <span
        className={[
          size === 'small' ? 'text-[length:var(--font-size-body2)]' : 'text-[length:var(--font-size-body1)]',
          inactive ? 'text-[var(--text-disabled)]' : 'text-[var(--text-primary)]',
        ].join(' ')}
      >
        {label}
      </span>
    </label>
  );
}

/** @deprecated Use Switch */
export const Toggle = Switch;
