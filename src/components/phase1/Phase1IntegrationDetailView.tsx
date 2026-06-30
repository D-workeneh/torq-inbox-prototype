'use client';

import { ArrowLeft, Check, GitBranch, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import {
  findIntegrationCatalogItem,
  getPhase1IntegrationDetail,
} from './phase1Integrations';
import { p1Font, p1Text } from './phase1Typography';

export function Phase1IntegrationDetailView({
  integrationName,
  onBack,
}: {
  integrationName: string;
  onBack: () => void;
}) {
  const detail = getPhase1IntegrationDetail(integrationName);
  const catalog = findIntegrationCatalogItem(integrationName);
  const brandColor = catalog?.color ?? '#4A154B';

  return (
    <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px 0',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: 0,
            border: 'none',
            background: 'transparent',
            fontSize: p1Font.body2,
            fontFamily: p1Font.family,
            color: p1Text.secondary,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={14} strokeWidth={2} aria-hidden />
          Back
        </button>
        <button
          type="button"
          aria-label="Close"
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            border: 'none',
            borderRadius: 6,
            background: 'transparent',
            color: p1Text.secondary,
            cursor: 'pointer',
          }}
        >
          <X size={18} strokeWidth={1.75} />
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 24,
          padding: '20px 24px 24px',
          borderBottom: '1px solid var(--border-level-2)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', gap: 16, minWidth: 0, flex: 1 }}>
          <span
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: brandColor,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: p1Font.family,
              flexShrink: 0,
            }}
          >
            {integrationName.slice(0, 2).toUpperCase()}
          </span>
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                margin: '0 0 8px',
                fontSize: p1Font.h3,
                fontFamily: p1Font.family,
                fontWeight: 600,
                color: p1Text.primary,
              }}
            >
              {detail.title}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: p1Font.body2,
                fontFamily: p1Font.family,
                color: p1Text.secondary,
                lineHeight: 1.5,
                maxWidth: 720,
              }}
            >
              {detail.description}
            </p>
          </div>
        </div>
        <Button variant="dark" size="small" className="shrink-0">
          Add Instance
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: p1Font.family }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-level-2)' }}>
              {['Name', 'Workspace', 'Events', 'Last Event', 'Shared'].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    fontSize: p1Font.body3,
                    fontWeight: 500,
                    color: p1Text.tertiary,
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {detail.instances.map((instance) => (
              <tr key={instance.name} style={{ borderBottom: '1px solid var(--border-level-1)' }}>
                <td style={{ padding: '14px 12px' }}>
                  <span
                    style={{
                      fontSize: p1Font.body2,
                      fontWeight: 500,
                      color: p1Text.primary,
                    }}
                  >
                    {instance.name}
                  </span>
                  {instance.isDefault ? (
                    <Tag color="neutral" appearance="surface" size="small" className="ml-2">
                      Default
                    </Tag>
                  ) : null}
                </td>
                <td
                  style={{
                    padding: '14px 12px',
                    fontSize: p1Font.body2,
                    color: p1Text.secondary,
                  }}
                >
                  {instance.workspace}
                </td>
                <td style={{ padding: '14px 12px' }}>
                  {instance.hasEvents ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        background: '#111827',
                        color: '#FFFFFF',
                      }}
                    >
                      <Check size={12} strokeWidth={3} aria-hidden />
                    </span>
                  ) : null}
                </td>
                <td style={{ padding: '14px 12px' }} />
                <td
                  style={{
                    padding: '14px 12px',
                    fontSize: p1Font.body2,
                    color: p1Text.secondary,
                  }}
                >
                  {instance.sharedStatus ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <GitBranch size={14} strokeWidth={2} aria-hidden />
                      {instance.sharedStatus}
                    </span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
