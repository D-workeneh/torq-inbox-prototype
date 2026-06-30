'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PHASE1_INTEGRATION_CATALOG } from './phase1Integrations';
import { p1Font, p1PageTitle, p1Text } from './phase1Typography';

const FILTER_H = 28;

export function Phase1IntegrationsView({
  onOpenIntegration,
}: {
  onOpenIntegration: (integrationName: string) => void;
}) {
  const [query, setQuery] = useState('');
  const triggers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PHASE1_INTEGRATION_CATALOG.filter(
      (item) =>
        item.category === 'trigger' &&
        (!q || item.name.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 24px 0',
          flexShrink: 0,
        }}
      >
        <h1 style={p1PageTitle}>Integrations</h1>
        <Button variant="dark" size="small">
          Create
        </Button>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '24px 24px 16px',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', width: 200 }}>
          <Search
            className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--text-tertiary)]"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            style={{
              width: '100%',
              height: FILTER_H,
              paddingLeft: 28,
              paddingRight: 10,
              fontSize: p1Font.body2,
              fontFamily: p1Font.family,
              border: '1px solid var(--border-level-2)',
              borderRadius: 6,
              boxSizing: 'border-box',
            }}
          />
        </div>
        {['Type: All', 'Shared: All', 'Activators: All'].map((label) => (
          <button
            key={label}
            type="button"
            style={{
              height: FILTER_H,
              padding: '0 10px',
              fontSize: p1Font.body2,
              fontFamily: p1Font.family,
              border: '1px solid var(--border-level-2)',
              borderRadius: 6,
              background: '#FFFFFF',
              color: p1Text.secondary,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8">
        <div style={{ marginBottom: 16 }}>
          <h2
            style={{
              margin: '0 0 4px',
              fontSize: p1Font.body1,
              fontFamily: p1Font.family,
              fontWeight: 600,
              color: p1Text.primary,
            }}
          >
            Triggers
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: p1Font.body2,
              fontFamily: p1Font.family,
              color: p1Text.secondary,
              lineHeight: 1.45,
            }}
          >
            The source of the event (payload) that will trigger a workflow.{' '}
            <span style={{ color: '#2563EB' }}>Learn more</span>
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(108px, 1fr))',
            gap: 12,
          }}
        >
          {triggers.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpenIntegration(item.name)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minHeight: 108,
                padding: 12,
                border: '1px solid var(--border-level-2)',
                borderRadius: 8,
                background: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: item.color,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: p1Font.family,
                }}
              >
                {item.name.slice(0, 2).toUpperCase()}
              </span>
              <span
                style={{
                  fontSize: p1Font.body3,
                  fontFamily: p1Font.family,
                  fontWeight: 500,
                  color: p1Text.primary,
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}
              >
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
