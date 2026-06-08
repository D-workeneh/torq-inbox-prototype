'use client';

import type { CSSProperties } from 'react';

export type Phase1SkeletonVariant =
  | 'workflows'
  | 'workflows-designer'
  | 'cases-list'
  | 'cases-detail'
  | 'generic';

function Block({
  style,
  className = 'phase1-skeleton-block',
}: {
  style?: CSSProperties;
  className?: string;
}) {
  return <div className={className} style={style} />;
}

function CasesListSkeleton() {
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px 16px',
          flexShrink: 0,
        }}
      >
        <Block style={{ width: 72, height: 28, borderRadius: 4 }} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Block style={{ width: 120, height: 32, borderRadius: 16 }} />
          <Block style={{ width: 88, height: 32, borderRadius: 16 }} />
          <Block style={{ width: 32, height: 32, borderRadius: 6 }} />
          <Block style={{ width: 32, height: 32, borderRadius: 6 }} />
          <Block style={{ width: 32, height: 32, borderRadius: 6 }} />
          <Block style={{ width: 80, height: 32, borderRadius: 6 }} />
        </div>
      </div>
      <div style={{ flex: 1, padding: '0 24px 24px', overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 16,
            height: '100%',
          }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <Block
              key={i}
              style={{
                borderRadius: 8,
                minHeight: 120,
                animationDelay: `${(i % 5) * 0.08}s`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function WorkflowsSkeleton() {
  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '24px 24px 0',
        }}
      >
        <Block style={{ width: 100, height: 28 }} />
        <Block style={{ width: 96, height: 32, borderRadius: 6 }} />
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '24px 24px 16px', flexWrap: 'wrap' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Block key={i} style={{ width: i === 0 ? 200 : 100, height: 28, borderRadius: 6 }} />
        ))}
      </div>
      <div style={{ padding: '0 24px', flex: 1 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Block
            key={i}
            style={{
              height: 44,
              marginBottom: 8,
              borderRadius: 6,
              animationDelay: `${i * 0.06}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

function WorkflowsDesignerSkeleton() {
  return (
    <>
      <Block style={{ height: 48, borderRadius: 0, marginBottom: 0 }} />
      <div style={{ flex: 1, position: 'relative', background: '#f3f4f6' }}>
        <Block
          style={{
            position: 'absolute',
            left: 16,
            top: 16,
            width: 340,
            height: '70%',
            borderRadius: 12,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 80,
            gap: 12,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Block
              key={i}
              style={{
                width: 260,
                height: 48,
                borderRadius: 8,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function CasesDetailSkeleton() {
  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      <div
        style={{
          width: '34%',
          borderRight: '1px solid #f0f0f0',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <Block style={{ width: '60%', height: 24 }} />
        <Block style={{ width: '40%', height: 16 }} />
        <Block style={{ height: 80, borderRadius: 8 }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <Block key={i} style={{ height: 36, animationDelay: `${i * 0.05}s` }} />
        ))}
      </div>
      <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Block key={i} style={{ width: 72, height: 28, borderRadius: 6 }} />
          ))}
        </div>
        <Block style={{ height: 140, borderRadius: 8 }} />
        <Block style={{ height: 100, borderRadius: 8 }} />
        <Block style={{ flex: 1, minHeight: 120, borderRadius: 8 }} />
      </div>
    </div>
  );
}

function GenericSkeleton() {
  return (
    <>
      <div style={{ padding: '20px 24px' }}>
        <Block style={{ width: 140, height: 28 }} />
      </div>
      <div style={{ padding: '0 24px 24px', flex: 1 }}>
        <Block style={{ height: '100%', minHeight: 200, borderRadius: 8 }} />
      </div>
    </>
  );
}

export function Phase1PageSkeleton({ variant }: { variant: Phase1SkeletonVariant }) {
  return (
    <div
      className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white"
      aria-hidden
    >
      {variant === 'cases-list' && <CasesListSkeleton />}
      {variant === 'workflows' && <WorkflowsSkeleton />}
      {variant === 'workflows-designer' && <WorkflowsDesignerSkeleton />}
      {variant === 'cases-detail' && <CasesDetailSkeleton />}
      {variant === 'generic' && <GenericSkeleton />}
    </div>
  );
}

export function resolvePhase1SkeletonVariant(
  pageId: string,
  caseKey: string | null,
  workflowName: string | null,
): Phase1SkeletonVariant {
  if (pageId === 'workflows' && workflowName) return 'workflows-designer';
  if (pageId === 'workflows') return 'workflows';
  if (pageId === 'cases' && caseKey) return 'cases-detail';
  if (pageId === 'cases') return 'cases-list';
  return 'generic';
}
