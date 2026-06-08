/** Torq DS typography tokens — design-system/src/assets/tokens.css */

import type { CSSProperties } from 'react';

export const p1Font = {
  family: 'var(--font-family)',
  special: 'var(--font-size-special)',
  h1: 'var(--font-size-h1)',
  h2: 'var(--font-size-h2)',
  h3: 'var(--font-size-h3)',
  h4: 'var(--font-size-h4)',
  body0: 'var(--font-size-body0)',
  body1: 'var(--font-size-body1)',
  body2: 'var(--font-size-body2)',
  body3: 'var(--font-size-body3)',
} as const;

export const p1Text = {
  primary: 'var(--text-primary)',
  secondary: 'var(--text-secondary)',
  tertiary: 'var(--text-tertiary)',
  placeholder: 'var(--text-placeholder)',
} as const;

/** Main content page title — text-h2 / neutral-12 (24px regular, 32px line-height) */
export const p1PageTitle: CSSProperties = {
  margin: 0,
  fontSize: p1Font.h2,
  fontFamily: p1Font.family,
  fontWeight: 400,
  color: 'var(--neutral-12)',
  lineHeight: '32px',
  letterSpacing: 0,
};
