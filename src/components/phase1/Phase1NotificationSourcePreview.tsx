'use client';

import { ExternalLink } from 'lucide-react';
import {
  formatCreditsValue,
  getAiUsagePercent,
  getWorkspaceAiCredits,
} from '@/lib/workspaceAiCredits';
import type { Phase1NotifRow } from './types';
import type { Phase1NotificationDrawerContent } from './phase1NotificationDrawerContent';
import { p1Font, p1Text } from './phase1Typography';

const DOT_BG = {
  backgroundColor: '#F3F4F6',
  backgroundImage: 'radial-gradient(circle, #D1D5DB 1px, transparent 1px)',
  backgroundSize: '10px 10px',
};

function PreviewChrome({
  children,
  label,
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div style={{ position: 'relative' }}>
      {label && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 2,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: 0.04,
            textTransform: 'uppercase',
            color: p1Text.tertiary,
            background: 'rgba(255,255,255,0.92)',
            padding: '3px 6px',
            borderRadius: 4,
            border: '1px solid #EBEBEB',
          }}
        >
          {label}
        </div>
      )}
      <button
        type="button"
        aria-label="Expand preview"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          right: 8,
          bottom: 8,
          zIndex: 2,
          width: 28,
          height: 28,
          borderRadius: 6,
          border: '1px solid #E5E7EB',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: p1Text.secondary,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <ExternalLink size={13} strokeWidth={1.75} />
      </button>
      {children}
    </div>
  );
}

function MiniStep({
  label,
  sub,
  iconBg,
  iconText,
  selected,
  failed,
  compact,
}: {
  label: string;
  sub?: string;
  iconBg?: string;
  iconText?: string;
  /** Matches workflow designer focus ring (black, not blue) */
  selected?: boolean;
  failed?: boolean;
  compact?: boolean;
}) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {failed && (
        <span
          style={{
            position: 'absolute',
            top: -5,
            right: -5,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#DC2626',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            fontWeight: 700,
            lineHeight: 1,
            zIndex: 3,
            border: '1.5px solid #fff',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
          }}
          title="Step failed"
          aria-hidden
        >
          ×
        </span>
      )}
      <div
        style={{
          width: compact ? 148 : 168,
          borderRadius: 6,
          border: selected ? '2px solid #090A0B' : '1px solid #E5E7EB',
          background: '#fff',
          boxShadow: selected
            ? '0 0 0 2px rgba(9, 10, 11, 0.12)'
            : '0 1px 2px rgba(0, 0, 0, 0.04)',
          padding: compact ? '5px 8px' : '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
      {iconBg ? (
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            background: iconBg,
            fontSize: 8,
            fontWeight: 700,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {iconText}
        </div>
      ) : null}
      <div style={{ minWidth: 0 }}>
        {sub && (
          <div style={{ fontSize: 9, color: p1Text.tertiary, lineHeight: 1.2 }}>{sub}</div>
        )}
        <div
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: p1Text.primary,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </div>
      </div>
      </div>
    </div>
  );
}

function parseFailedStepName(body?: string): string | null {
  if (!body) return null;
  const m = body.match(/Step "([^"]+)"/);
  return m?.[1] ?? null;
}

function WorkflowCanvasPreview({ row }: { row: Phase1NotifRow }) {
  const failedName = parseFailedStepName(row.body) ?? 'Enrich IP';
  const steps = [
    { type: 'trigger' as const, label: 'On-demand' },
    { type: 'step' as const, label: 'Collect IOCs', iconBg: '#2864FF', iconText: 'C' },
    { type: 'step' as const, label: 'Parse alert', iconBg: '#9333EA', iconText: 'AI' },
    {
      type: 'step' as const,
      label: failedName,
      iconBg: '#9333EA',
      iconText: 'AI',
      failed: true,
      selected: true,
    },
    { type: 'step' as const, label: 'Create case', iconBg: '#2864FF', iconText: 'C', compact: true },
  ];

  return (
    <PreviewChrome label="Workflow · failed step">
      <div
        style={{
          height: 200,
          overflow: 'hidden',
          borderRadius: 8,
          border: '1px solid #EBEBEB',
          ...DOT_BG,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: 'scale(0.92) translateY(28px)',
              transformOrigin: 'center top',
            }}
          >
            <div
              style={{
                width: 148,
                padding: '5px 10px',
                borderRadius: 6,
                background: '#090A0B',
                color: '#fff',
                fontSize: 10,
                fontWeight: 500,
                textAlign: 'center',
                marginBottom: 6,
              }}
            >
              ⚡ Trigger: On-demand
            </div>
            {steps.slice(1).map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 1, height: 10, background: '#D1D5DB' }} />
                <MiniStep
                  label={s.label}
                  sub="Operator"
                  iconBg={s.iconBg}
                  iconText={s.iconText}
                  selected={'selected' in s && s.selected}
                  failed={s.failed}
                  compact={s.compact}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PreviewChrome>
  );
}

function CasePreview({ row }: { row: Phase1NotifRow }) {
  const caseId = row.target.type === 'case' ? row.target.caseKey : '4380';
  return (
    <PreviewChrome label="Case overview">
      <div
        style={{
          height: 200,
          borderRadius: 8,
          border: '1px solid #EBEBEB',
          background: '#FAFAFA',
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#2864FF',
              background: '#EEF3FF',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            #{caseId}
          </span>
          <span style={{ fontSize: 10, color: '#DC2626', fontWeight: 500 }}>High</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: p1Text.primary, lineHeight: 1.3 }}>
          Ransomware alert
        </div>
        <div
          style={{
            flex: 1,
            borderRadius: 6,
            background: '#fff',
            border: '1px solid #EBEBEB',
            padding: 10,
            fontSize: 10,
            color: p1Text.secondary,
            lineHeight: 1.45,
          }}
        >
          Summary and timeline tabs · assignee, SLA, and observables visible in full view.
        </div>
      </div>
    </PreviewChrome>
  );
}

function CaseCommentPreview({ row }: { row: Phase1NotifRow }) {
  return (
    <PreviewChrome label="Case comment">
      <div
        style={{
          height: 200,
          borderRadius: 8,
          border: '1px solid #EBEBEB',
          background: 'linear-gradient(180deg, #F7F8FA 0%, #EEF3FF 100%)',
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            flex: 1,
            background: '#fff',
            borderRadius: 6,
            border: '1px solid #E5E7EB',
            padding: 10,
            fontSize: 11,
            color: p1Text.primary,
            lineHeight: 1.45,
            fontStyle: 'italic',
          }}
        >
          {row.body ?? '"Can you review this IOC?"'}
        </div>
      </div>
    </PreviewChrome>
  );
}

function ExportPreview() {
  return (
    <PreviewChrome label="Case export">
      <div
        style={{
          height: 200,
          borderRadius: 8,
          border: '1px solid #EBEBEB',
          background: '#FAFAFA',
          padding: 14,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 10 }}>Export case data</div>
        <div
          style={{
            height: 8,
            borderRadius: 4,
            background: '#FEE2E2',
            marginBottom: 8,
            overflow: 'hidden',
          }}
        >
          <div style={{ width: '92%', height: '100%', background: '#F87171' }} />
        </div>
        <div style={{ fontSize: 10, color: '#991B1B' }}>File size limit reached (500 MB)</div>
      </div>
    </PreviewChrome>
  );
}

function AiUsagePreview({ row }: { row: Phase1NotifRow }) {
  const snap =
    row.aiCreditsSnapshot ??
    (() => {
      const c = getWorkspaceAiCredits(row.workspaceId);
      return { used: c.used, limit: c.limit };
    })();
  const pct = getAiUsagePercent(snap.used, snap.limit);
  const isCritical = pct >= 100 || row.severity === 'critical';
  return (
    <PreviewChrome label="AI usage">
      <div
        style={{
          height: 200,
          borderRadius: 8,
          border: '1px solid #EBEBEB',
          background: '#FAFAFA',
          padding: 16,
        }}
      >
        <div style={{ fontSize: 11, color: p1Text.secondary, marginBottom: 8 }}>Credits this month</div>
        <div style={{ fontSize: 22, fontWeight: 600, color: isCritical ? '#DC2626' : '#090A0B' }}>
          {pct}%
        </div>
        <p style={{ marginTop: 4, fontSize: 11, color: p1Text.secondary }}>
          {formatCreditsValue(snap.used, snap.limit)}
        </p>
        <div
          style={{
            marginTop: 12,
            height: 10,
            borderRadius: 5,
            background: '#E5E7EB',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              background: isCritical ? '#DC2626' : pct >= 80 ? '#F97316' : '#090A0B',
              borderRadius: 5,
            }}
          />
        </div>
      </div>
    </PreviewChrome>
  );
}

function WorkflowsListPreview() {
  return (
    <PreviewChrome label="Workflows">
      <div
        style={{
          height: 200,
          borderRadius: 8,
          border: '1px solid #EBEBEB',
          background: '#fff',
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {['Malware triage endpoint', 'Phishing response v2', 'Auto-triage v3'].map((name, i) => (
          <div
            key={name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 8px',
              borderRadius: 6,
              background: i === 0 ? '#F7F7F7' : 'transparent',
              border: i === 0 ? '1px solid #EBEBEB' : '1px solid transparent',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i === 0 ? '#16A34A' : '#9CA3AF',
              }}
            />
            <span style={{ fontSize: 10, fontWeight: i === 0 ? 500 : 400, color: p1Text.primary }}>
              {name}
            </span>
          </div>
        ))}
      </div>
    </PreviewChrome>
  );
}

function IntegrationPreview() {
  return (
    <PreviewChrome label="Integration">
      <div
        style={{
          height: 200,
          borderRadius: 8,
          border: '1px solid #EBEBEB',
          background: '#FAFAFA',
          padding: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: '#E8EDF3',
            border: '1px solid #E5E7EB',
          }}
        />
        <div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>CrowdStrike</div>
          <div style={{ fontSize: 10, color: p1Text.tertiary }}>Connector · sharing</div>
        </div>
      </div>
    </PreviewChrome>
  );
}

export function Phase1NotificationSourcePreview({
  row,
  content,
}: {
  row: Phase1NotifRow;
  content: Phase1NotificationDrawerContent;
}) {
  if (content.preview === 'workflow-error') {
    return <WorkflowCanvasPreview row={row} />;
  }
  if (content.preview === 'export') {
    return <ExportPreview />;
  }
  if (content.preview === 'comment') {
    return <CaseCommentPreview row={row} />;
  }
  if (row.target.type === 'case') {
    return <CasePreview row={row} />;
  }
  if (row.avatarIcon === 'ai') {
    return <AiUsagePreview row={row} />;
  }
  if (
    row.avatarIcon === 'share' ||
    row.avatarIcon === 'connector' ||
    row.avatarIcon === 'invite' ||
    row.avatarIcon === 'organization'
  ) {
    return <IntegrationPreview />;
  }
  if (row.target.type === 'workflow' || row.avatarIcon === 'publish') {
    return <WorkflowCanvasPreview row={row} />;
  }
  return <WorkflowsListPreview />;
}
