'use client';

import { useState } from 'react';
import { CloudUpload, ImageIcon } from 'lucide-react';

function WorkspaceLogoMark() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
      <rect width="40" height="40" rx="6" fill="#090A0B" />
      <rect x="10" y="11" width="20" height="2.75" rx="1.25" fill="#FFFFFF" />
      <rect x="10" y="17.5" width="13" height="2.75" rx="1.25" fill="#FFFFFF" />
      <rect x="10" y="24" width="17" height="2.75" rx="1.25" fill="#FFFFFF" />
    </svg>
  );
}

function LogoPreviewContent({ variant }: { variant: 'workspace' | 'empty' }) {
  if (variant === 'workspace') {
    return (
      <div className="h-full w-full overflow-hidden rounded-[calc(var(--radius-md)-2px)] p-1">
        <WorkspaceLogoMark />
      </div>
    );
  }

  return (
    <>
      <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(-45deg,var(--border-level-2)_0,var(--border-level-2)_1px,transparent_1px,transparent_6px)]" />
      <ImageIcon className="relative h-5 w-5 text-[var(--text-tertiary)]" strokeWidth={1.5} />
    </>
  );
}

function LogoPreviewBox({
  variant,
  uploadLabel,
  onUpload,
}: {
  variant: 'workspace' | 'empty';
  uploadLabel: string;
  onUpload: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isEmpty = variant === 'empty';

  return (
    <button
      type="button"
      aria-label={uploadLabel}
      onClick={onUpload}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={[
        'group relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border bg-[var(--surface)] transition-colors',
        isEmpty
          ? 'border-dashed border-[var(--border-level-3)] bg-[var(--bg-static-2)]'
          : 'border-[var(--border-level-2)]',
        hovered ? 'border-[var(--border-level-3)]' : '',
      ].join(' ')}
    >
      <LogoPreviewContent variant={variant} />
      <span
        className={[
          'absolute inset-0 flex items-center justify-center rounded-[inherit] bg-[rgba(9,10,11,0.45)] text-white transition-opacity duration-150',
          hovered ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        aria-hidden
      >
        <CloudUpload className="h-4 w-4" strokeWidth={1.75} />
      </span>
    </button>
  );
}

function UploadActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-level-2)] bg-[var(--surface)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-level-3)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-primary)]"
    >
      <CloudUpload className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}

function BrandingLogoField({
  title,
  description,
  variant,
}: {
  title: string;
  description: string;
  variant: 'workspace' | 'empty';
}) {
  const uploadLabel = `Upload ${title.toLowerCase()}`;

  function handleUpload() {
    /* prototype — no file picker wired */
  }

  return (
    <div className="flex items-center gap-4 px-4 py-4">
      <LogoPreviewBox variant={variant} uploadLabel={uploadLabel} onUpload={handleUpload} />
      <div className="min-w-0 flex-1">
        <p className="text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)]">{title}</p>
        <p className="mt-1 text-[length:var(--font-size-body2)] text-[var(--text-secondary)] leading-relaxed">
          {description}
        </p>
      </div>
      <UploadActionButton label={uploadLabel} onClick={handleUpload} />
    </div>
  );
}

export function BrandingLogoUploadSection() {
  return (
    <>
      <BrandingLogoField
        title="Workspace logo"
        description="Upload a square image shown in the sidebar, exports, and shared case views."
        variant="workspace"
      />
      <BrandingLogoField
        title="Torq Interact logo"
        description="Upload a PNG or SVG for Interact portals and external case collaboration pages."
        variant="empty"
      />
    </>
  );
}
