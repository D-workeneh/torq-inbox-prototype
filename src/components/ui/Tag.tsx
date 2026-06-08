'use client';

import React from 'react';
import { X, AlertOctagon, AlertTriangle, AlertCircle, Info } from 'lucide-react';

/** Torq Tag sentiment — COMPONENTS_INVENTORY.md */
export type TagSentiment =
  | 'info'
  | 'positive'
  | 'critical'
  | 'high'
  | 'medium'
  | 'neutral'
  | 'smart';

export type TagProminence = 'mild' | 'strong';

export type TagSize = 'small' | 'medium' | 'large';

/** @deprecated Prefer TagSentiment */
export type TagColor =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'yellow'
  | 'warning'
  | 'error'
  | 'critical'
  | 'info'
  | 'purple';

/** @deprecated Prefer TagProminence */
export type TagAppearance = 'subtle' | 'bordered' | 'surface';

/** @deprecated Use small | medium | large */
export type LegacyTagSize = 'sm' | 'md';

type SentimentTokens = { bg: string; text: string; border: string; dot: string };

const SENTIMENT_MILD: Record<TagSentiment, SentimentTokens> = {
  info: {
    bg: 'var(--tag-bg-info-mild)',
    text: 'var(--tag-text-info)',
    border: 'var(--tag-text-info)',
    dot: 'var(--tag-text-info)',
  },
  positive: {
    bg: 'var(--tag-bg-positive-mild)',
    text: 'var(--tag-text-positive)',
    border: 'var(--tag-text-positive)',
    dot: 'var(--tag-text-positive)',
  },
  critical: {
    bg: 'var(--tag-bg-critical-mild)',
    text: 'var(--tag-text-critical)',
    border: 'var(--tag-text-critical)',
    dot: 'var(--tag-text-critical)',
  },
  high: {
    bg: 'var(--tag-bg-high-mild)',
    text: 'var(--tag-text-high)',
    border: 'var(--tag-text-high)',
    dot: 'var(--tag-text-high)',
  },
  medium: {
    bg: 'var(--tag-bg-medium-mild)',
    text: 'var(--tag-text-medium)',
    border: 'var(--tag-text-medium)',
    dot: 'var(--tag-text-medium)',
  },
  neutral: {
    bg: 'var(--tag-bg-neutral-mild)',
    text: 'var(--tag-text-neutral)',
    border: 'var(--border-level-3)',
    dot: 'var(--tag-text-neutral)',
  },
  smart: {
    bg: 'var(--tag-bg-smart-mild)',
    text: 'var(--tag-text-smart)',
    border: 'var(--tag-text-smart)',
    dot: 'var(--tag-text-smart)',
  },
};

const SENTIMENT_STRONG: Record<TagSentiment, SentimentTokens> = {
  info: { bg: 'var(--badge-bg-blue)', text: 'var(--badge-text-blue)', border: 'var(--badge-text-blue)', dot: 'var(--badge-text-blue)' },
  positive: { bg: 'var(--badge-bg-green)', text: 'var(--badge-text-green)', border: 'var(--badge-text-green)', dot: 'var(--badge-text-green)' },
  critical: { bg: 'var(--badge-bg-red)', text: 'var(--badge-text-red)', border: 'var(--badge-text-red)', dot: 'var(--badge-text-red)' },
  high: { bg: 'var(--badge-bg-orange)', text: 'var(--badge-text-orange)', border: 'var(--badge-text-orange)', dot: 'var(--badge-text-orange)' },
  medium: { bg: 'var(--badge-bg-yellow)', text: 'var(--badge-text-yellow)', border: 'var(--badge-text-yellow)', dot: 'var(--badge-text-yellow)' },
  neutral: { bg: 'var(--badge-bg-neutral)', text: 'var(--badge-text-neutral)', border: 'var(--badge-text-neutral)', dot: 'var(--badge-text-neutral)' },
  smart: { bg: 'var(--badge-bg-teal)', text: 'var(--badge-text-teal)', border: 'var(--badge-text-teal)', dot: 'var(--badge-text-teal)' },
};

const COLOR_TO_SENTIMENT: Record<TagColor, TagSentiment> = {
  neutral: 'neutral',
  primary: 'info',
  info: 'info',
  success: 'positive',
  warning: 'high',
  yellow: 'medium',
  error: 'critical',
  critical: 'critical',
  purple: 'smart',
};

function normalizeSize(size: TagSize | LegacyTagSize = 'small'): TagSize {
  if (size === 'sm') return 'small';
  if (size === 'md') return 'medium';
  return size;
}

function resolveSentiment(
  sentiment?: TagSentiment,
  color?: TagColor,
): TagSentiment {
  if (sentiment) return sentiment;
  if (color) return COLOR_TO_SENTIMENT[color];
  return 'neutral';
}

function resolveProminence(
  prominence?: TagProminence,
  appearance?: TagAppearance,
): TagProminence {
  if (prominence) return prominence;
  if (appearance === 'bordered') return 'mild';
  return 'mild';
}

const SIZE_CLASSES: Record<TagSize, { wrap: string; icon: string; dot: string; remove: string }> = {
  small: {
    wrap: 'h-4 px-1.5 gap-1 rounded-[var(--radius-full)] text-[length:var(--font-size-body3)] font-medium',
    icon: 'h-2.5 w-2.5 shrink-0',
    dot: 'h-1.5 w-1.5 shrink-0 rounded-full',
    remove: 'h-2.5 w-2.5 ml-0.5 opacity-70 hover:opacity-100 shrink-0',
  },
  medium: {
    wrap: 'h-6 px-2 gap-1 rounded-[var(--radius-full)] text-[length:var(--font-size-body2)] font-medium',
    icon: 'h-3 w-3 shrink-0',
    dot: 'h-2 w-2 shrink-0 rounded-full',
    remove: 'h-3 w-3 ml-0.5 opacity-70 hover:opacity-100 shrink-0',
  },
  large: {
    wrap: 'h-7 px-2.5 gap-1.5 rounded-[var(--radius-full)] text-[length:var(--font-size-body1)] font-medium',
    icon: 'h-3.5 w-3.5 shrink-0',
    dot: 'h-2 w-2 shrink-0 rounded-full',
    remove: 'h-3.5 w-3.5 ml-0.5 opacity-70 hover:opacity-100 shrink-0',
  },
};

export interface TagProps {
  sentiment?: TagSentiment;
  prominence?: TagProminence;
  /** @deprecated Use sentiment */
  color?: TagColor;
  /** @deprecated Use prominence; `surface` maps to neutral surface styling */
  appearance?: TagAppearance;
  size?: TagSize | LegacyTagSize;
  icon?: React.ReactNode;
  dot?: boolean;
  onRemove?: () => void;
  className?: string;
  children: React.ReactNode;
}

/**
 * Torq Design System — Tag (React port of components-library Tag / design-system TChip)
 */
export function Tag({
  sentiment,
  prominence,
  color,
  appearance = 'subtle',
  size = 'small',
  icon,
  dot,
  onRemove,
  className = '',
  children,
}: TagProps) {
  const resolvedSentiment = resolveSentiment(sentiment, color);
  const resolvedProminence = resolveProminence(prominence, appearance);
  const resolvedSize = normalizeSize(size);
  const isSurface = appearance === 'surface';
  const showBorder = appearance === 'bordered';

  const tokenMap = resolvedProminence === 'strong' ? SENTIMENT_STRONG : SENTIMENT_MILD;
  const tokens = tokenMap[resolvedSentiment];
  const sz = SIZE_CLASSES[resolvedSize];

  const bg = isSurface ? 'var(--bg-static-3)' : tokens.bg;
  const textColor = isSurface ? 'var(--text-tertiary)' : tokens.text;
  const borderColor = showBorder
    ? `color-mix(in srgb, ${tokens.border} 35%, transparent)`
    : 'transparent';

  return (
    <span
      className={`inline-flex items-center font-[family-name:var(--font-family)] leading-none ${sz.wrap} ${className}`}
      style={{
        backgroundColor: bg,
        color: textColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      {dot && !icon && <span className={sz.dot} style={{ backgroundColor: tokens.dot }} />}
      {icon && <span className={`flex items-center ${sz.icon}`}>{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`flex items-center transition-opacity bg-transparent border-0 p-0 cursor-pointer ${sz.remove}`}
          style={{ color: 'inherit' }}
          aria-label="Remove"
        >
          <X className="h-full w-full" />
        </button>
      )}
    </span>
  );
}

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

const SEVERITY_PRESETS: Record<
  SeverityLevel,
  { sentiment: TagSentiment; Icon: React.ElementType; label: string }
> = {
  critical: { sentiment: 'critical', Icon: AlertOctagon, label: 'Critical' },
  high: { sentiment: 'high', Icon: AlertTriangle, label: 'High' },
  medium: { sentiment: 'medium', Icon: AlertCircle, label: 'Medium' },
  low: { sentiment: 'neutral', Icon: Info, label: 'Low' },
  info: { sentiment: 'info', Icon: Info, label: 'Info' },
};

export interface SeverityTagProps {
  level: SeverityLevel;
  size?: TagSize | LegacyTagSize;
  prominence?: TagProminence;
  /** @deprecated Use prominence */
  appearance?: TagAppearance;
  onRemove?: () => void;
}

export function SeverityTag({
  level,
  size = 'small',
  prominence = 'mild',
  appearance,
  onRemove,
}: SeverityTagProps) {
  const { sentiment, Icon, label } = SEVERITY_PRESETS[level];
  return (
    <Tag
      sentiment={sentiment}
      prominence={prominence}
      appearance={appearance}
      size={size}
      icon={<Icon />}
      onRemove={onRemove}
    >
      {label}
    </Tag>
  );
}

/** Re-export sentiment colors for filter UI icon tinting */
export const SEVERITY_VIZ_COLORS: Record<SeverityLevel, string> = {
  critical: 'var(--viz-critical)',
  high: 'var(--viz-high)',
  medium: 'var(--viz-medium)',
  low: 'var(--viz-neutral)',
  info: 'var(--viz-info)',
};
