'use client';

import React from 'react';

/** Torq settings panel — bordered card with optional divided rows */
export function SettingsCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        'rounded-[var(--radius-xl)] border border-[var(--border-level-2)] bg-[var(--surface)] overflow-hidden',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

export function SettingsCardBody({ children, divided = true }: { children: React.ReactNode; divided?: boolean }) {
  return <div className={divided ? 'divide-y divide-[var(--border-level-1)]' : ''}>{children}</div>;
}

/** Label + control row inside a settings card */
export function SettingsCardRow({
  title,
  description,
  control,
  className = '',
}: {
  title: string;
  description?: string;
  control: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={['flex items-start justify-between gap-6 px-4 py-4', className].join(' ')}>
      <div className="min-w-0">
        <p className="text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)]">{title}</p>
        {description && (
          <p className="mt-1 text-[length:var(--font-size-body1)] text-[var(--text-secondary)] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0 pt-0.5">{control}</div>
    </div>
  );
}

export function SettingsEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[length:var(--font-size-body2)] font-semibold uppercase tracking-wide text-[var(--text-tertiary)] mb-2">
      {children}
    </p>
  );
}

export function SettingsBlockTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)]">{title}</h3>
      {description && (
        <p className="mt-1 text-[length:var(--font-size-body1)] text-[var(--text-secondary)]">{description}</p>
      )}
    </div>
  );
}
