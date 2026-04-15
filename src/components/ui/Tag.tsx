'use client';

import React from 'react';
import { X, AlertOctagon, AlertTriangle, AlertCircle, Info } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TagColor =
  | 'neutral'   // Grey — Low severity / default
  | 'primary'   // Blue — Info / brand
  | 'success'   // Teal — positive, active, approved
  | 'yellow'    // Yellow — Medium severity
  | 'warning'   // Orange — High severity / caution
  | 'error'     // Red — error, failed
  | 'critical'  // Red bold — Critical severity
  | 'info'      // Blue (primary) — informational
  | 'purple';   // Purple — AI / special

export type TagAppearance =
  | 'subtle'    // Light tinted background, no border (default)
  | 'bordered'  // Border + light tinted background
  | 'surface';  // Neutral grey surface, no color (for workspace chips, etc.)

export type TagSize = 'sm' | 'md';

export interface TagProps {
  color?: TagColor;
  appearance?: TagAppearance;
  size?: TagSize;
  /** Icon rendered before the label (pass a Lucide icon element) */
  icon?: React.ReactNode;
  /** Show a small colored dot before the label (alternative to icon) */
  dot?: boolean;
  /** Makes the tag removable — renders an × button */
  onRemove?: () => void;
  className?: string;
  children: React.ReactNode;
}

// ─── Color token map ──────────────────────────────────────────────────────────

type ColorTokens = {
  text: string;
  bg: string;
  border: string;
  dot: string;
};

const COLOR_TOKENS: Record<TagColor, ColorTokens> = {
  neutral: {
    text: 'var(--color-text-secondary)',
    bg: 'var(--color-neutral-100)',
    border: 'var(--color-border-2)',
    dot: 'var(--color-neutral-400)',
  },
  primary: {
    text: 'var(--color-primary-500)',
    bg: 'var(--color-primary-100)',
    border: 'var(--color-primary-300)',
    dot: 'var(--color-primary-500)',
  },
  success: {
    text: 'var(--color-teal-500)',
    bg: 'var(--color-teal-50)',
    border: 'var(--color-teal-300)',
    dot: 'var(--color-teal-500)',
  },
  warning: {
    text: 'var(--color-orange-500)',
    bg: 'var(--color-orange-50)',
    border: 'var(--color-orange-300)',
    dot: 'var(--color-orange-500)',
  },
  yellow: {
    text: 'var(--color-yellow-800)',
    bg: 'var(--color-yellow-50)',
    border: 'var(--color-yellow-300)',
    dot: 'var(--color-yellow-700)',
  },
  error: {
    text: 'var(--color-red-500)',
    bg: 'var(--color-red-50)',
    border: 'var(--color-red-300)',
    dot: 'var(--color-red-500)',
  },
  critical: {
    text: 'var(--color-red-500)',
    bg: 'var(--color-red-50)',
    border: 'var(--color-red-300)',
    dot: 'var(--color-red-500)',
  },
  info: {
    text: 'var(--color-primary-500)',
    bg: 'var(--color-primary-50)',
    border: 'var(--color-primary-300)',
    dot: 'var(--color-primary-500)',
  },
  purple: {
    text: 'var(--color-purple-500)',
    bg: 'var(--color-purple-50)',
    border: 'var(--color-purple-300)',
    dot: 'var(--color-purple-500)',
  },
};

const SIZE_CLASSES: Record<TagSize, { wrap: string; icon: string; dot: string; remove: string }> = {
  sm: {
    wrap: 'px-1.5 py-0.5 gap-1 rounded-[var(--radius-sm)] text-[var(--font-size-xs)] font-medium',
    icon: 'h-2.5 w-2.5 shrink-0',
    dot: 'h-1.5 w-1.5 shrink-0 rounded-full',
    remove: 'h-2.5 w-2.5 ml-0.5 opacity-60 hover:opacity-100 shrink-0',
  },
  md: {
    wrap: 'px-2 py-0.5 gap-1.5 rounded-[var(--radius-sm)] text-[var(--font-size-sm)] font-medium',
    icon: 'h-3 w-3 shrink-0',
    dot: 'h-2 w-2 shrink-0 rounded-full',
    remove: 'h-3 w-3 ml-0.5 opacity-60 hover:opacity-100 shrink-0',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Torq Design System — Tag / Badge / Chip
 *
 * Source: Figma "Design-system-next-gen" node 13372-1092
 *
 * @example
 * <Tag color="error" appearance="bordered" icon={<AlertOctagon />}>Critical</Tag>
 * <Tag color="success">Active</Tag>
 * <Tag color="neutral" appearance="surface" icon={<Building2 />}>Acme Corp</Tag>
 * <Tag color="primary" onRemove={() => {}}>Workflow Failed</Tag>
 */
export function Tag({
  color = 'neutral',
  appearance = 'subtle',
  size = 'sm',
  icon,
  dot,
  onRemove,
  className = '',
  children,
}: TagProps) {
  const tokens = COLOR_TOKENS[color];
  const sz = SIZE_CLASSES[size];

  // Surface appearance ignores color tokens — always grey
  const isSurface = appearance === 'surface';

  const bg = isSurface ? 'var(--color-surface-tertiary)' : tokens.bg;
  const textColor = isSurface ? 'var(--color-text-tertiary)' : tokens.text;
  const borderColor = appearance === 'bordered' ? tokens.border : 'transparent';

  return (
    <span
      className={`inline-flex items-center ${sz.wrap} ${className}`}
      style={{
        backgroundColor: bg,
        color: textColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      {dot && !icon && (
        <span className={sz.dot} style={{ backgroundColor: tokens.dot }} />
      )}
      {icon && (
        <span className={`flex items-center ${sz.icon}`}>{icon}</span>
      )}
      <span className="leading-none">{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className={`flex items-center transition-opacity ${sz.remove}`}
          aria-label="Remove"
        >
          <X className="h-full w-full" />
        </button>
      )}
    </span>
  );
}

// ─── SeverityTag ──────────────────────────────────────────────────────────────
// Convenience component — maps a severity level to the correct color + icon.
// Source: Figma "Notification-center" node 5328-57298
//
// Usage:
//   <SeverityTag level="critical" />   → red  + AlertOctagon
//   <SeverityTag level="high" />       → orange + AlertTriangle
//   <SeverityTag level="medium" />     → yellow + AlertCircle
//   <SeverityTag level="low" />        → grey  + Info
//   <SeverityTag level="info" />       → blue  + Info

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

type SeverityPreset = { color: TagColor; Icon: React.ElementType; label: string };

const SEVERITY_PRESETS: Record<SeverityLevel, SeverityPreset> = {
  critical: { color: 'critical', Icon: AlertOctagon,  label: 'Critical' },
  high:     { color: 'warning',  Icon: AlertTriangle, label: 'High'     },
  medium:   { color: 'yellow',   Icon: AlertCircle,   label: 'Medium'   },
  low:      { color: 'neutral',  Icon: Info,          label: 'Low'      },
  info:     { color: 'info',     Icon: Info,          label: 'Info'     },
};

export interface SeverityTagProps {
  level: SeverityLevel;
  size?: TagSize;
  /** 'bordered' (default) shows an outline — matches Figma spec */
  appearance?: TagAppearance;
  onRemove?: () => void;
}

/**
 * Torq Design System — SeverityTag
 *
 * Source: Figma "Notification-center" node 5328-57298
 *
 * @example
 * <SeverityTag level="critical" />
 * <SeverityTag level="high" size="md" />
 * <SeverityTag level="medium" onRemove={() => {}} />
 */
export function SeverityTag({ level, size = 'sm', appearance = 'bordered', onRemove }: SeverityTagProps) {
  const { color, Icon, label } = SEVERITY_PRESETS[level];
  return (
    <Tag color={color} appearance={appearance} size={size} icon={<Icon />} onRemove={onRemove}>
      {label}
    </Tag>
  );
}
