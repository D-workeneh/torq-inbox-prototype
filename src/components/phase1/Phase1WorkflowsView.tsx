'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { ChevronDown, ChevronUp, Globe, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PHASE1_WORKFLOW_GROUPS } from './data';
import {
  IconChevronDown,
  WorkflowStatusGlobeIcon,
  WorkflowStatusGlobeLinkedIcon,
  WorkflowStatusProgressIcon,
} from './icons';
import { Phase1UserAvatar } from './phase1Avatars';
import type {
  Phase1Workflow,
  Phase1WorkflowGroup,
  Phase1WorkflowStatusIcon,
} from './types';
import { p1Font, p1PageTitle, p1Text } from './phase1Typography';

const FILTER_H = 28;
const FILTER_RADIUS = 6;

const filterFieldBase: CSSProperties = {
  height: FILTER_H,
  fontSize: p1Font.body2,
  fontFamily: p1Font.family,
  border: '1px solid var(--border-level-2)',
  borderRadius: FILTER_RADIUS,
  boxSizing: 'border-box',
};

/** Matches design-system WorkflowGroup / WorkflowRow grid */
const ROW_GRID =
  '40px 44px minmax(0, 1fr) minmax(0, 180px) minmax(0, 180px) minmax(0, 170px) 88px 100px 36px';

const tagPillStyle: CSSProperties = {
  display: 'inline-block',
  fontSize: p1Font.body3,
  fontFamily: p1Font.family,
  fontWeight: 500,
  color: p1Text.secondary,
  background: 'var(--bg-static-3)',
  border: '1px solid var(--border-level-1)',
  borderRadius: 4,
  padding: '2px 6px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  width: 'max-content',
  maxWidth: '100%',
  flex: 'none',
};

const STATUS_BAR: Record<Phase1Workflow['statusBar'], string> = {
  success: '#16A34A',
  warning: '#F97316',
  error: '#DC2626',
};

function WfCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      style={{
        width: 16,
        height: 16,
        borderRadius: 3,
        border: checked ? '1px solid #111827' : '1px solid #D1D5DB',
        background: checked ? '#111827' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        padding: 0,
      }}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path
            d="M2 5l2.5 2.5L8 3"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

function resolveStatusIcon(wf: Phase1Workflow): Phase1WorkflowStatusIcon {
  if (wf.statusIcon) return wf.statusIcon;
  if (wf.statusBar === 'warning') return 'progress';
  if (wf.state === 'inactive') return 'globe-linked';
  return 'globe';
}

function WorkflowStatusIndicator({ wf }: { wf: Phase1Workflow }) {
  const kind = resolveStatusIcon(wf);
  if (kind === 'progress') return <WorkflowStatusProgressIcon size={20} />;
  if (kind === 'globe-linked') return <WorkflowStatusGlobeLinkedIcon size={20} />;
  return <WorkflowStatusGlobeIcon size={20} />;
}

function TagsCell({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return <span style={{ fontSize: p1Font.body2, color: p1Text.tertiary }}>—</span>;
  }

  const visibleTags = tags.slice(0, 2);
  const moreTags = tags.length - visibleTags.length;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        minWidth: 0,
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      {visibleTags.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          title={tag}
          style={{
            ...tagPillStyle,
            maxWidth:
              visibleTags.length > 1
                ? `min(9rem, calc((100% - ${moreTags > 0 ? 28 : 4}px) / ${visibleTags.length}))`
                : 'min(9rem, 100%)',
          }}
        >
          {tag}
        </span>
      ))}
      {moreTags > 0 && (
        <span
          style={{
            fontSize: p1Font.body3,
            fontFamily: p1Font.family,
            color: p1Text.tertiary,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          +{moreTags}
        </span>
      )}
    </div>
  );
}

function UserCell({
  name,
  initials,
  avatarColor,
  avatarUrl,
  timestamp,
}: {
  name: string;
  initials: string;
  avatarColor: string;
  avatarUrl?: string;
  timestamp: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
      <Phase1UserAvatar
        name={name}
        initials={initials}
        avatarColor={avatarColor}
        avatarUrl={avatarUrl}
      />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: p1Font.body2,
            fontFamily: p1Font.family,
            fontWeight: 600,
            color: p1Text.primary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: p1Font.body3,
            fontFamily: p1Font.family,
            color: p1Text.tertiary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {timestamp}
        </div>
      </div>
    </div>
  );
}

function WorkflowRow({
  wf,
  selected,
  onToggle,
}: {
  wf: Phase1Workflow;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      role="row"
      style={{
        display: 'grid',
        gridTemplateColumns: ROW_GRID,
        alignItems: 'center',
        minHeight: 44,
        borderBottom: '1px solid var(--border-level-1)',
        background: '#fff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <WfCheckbox checked={selected} onChange={onToggle} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <span
          style={{
            width: 3,
            height: 28,
            borderRadius: 2,
            background: STATUS_BAR[wf.statusBar],
            flexShrink: 0,
          }}
          aria-hidden
        />
        <WorkflowStatusIndicator wf={wf} />
      </div>

      <div style={{ padding: '0 8px', minWidth: 0 }}>
        <span
          style={{
            fontSize: p1Font.body1,
            fontFamily: p1Font.family,
            fontWeight: 500,
            color: p1Text.secondary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
          }}
        >
          {wf.name}
        </span>
      </div>

      <div style={{ padding: '0 8px', minWidth: 0, overflow: 'hidden' }}>
        <TagsCell tags={wf.tags} />
      </div>

      <div style={{ padding: '0 8px', minWidth: 0 }}>
        {wf.triggeredBy.avatarUrl && wf.triggeredBy.initials && wf.triggeredBy.avatarColor ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <Phase1UserAvatar
              name={wf.triggeredBy.label}
              initials={wf.triggeredBy.initials}
              avatarColor={wf.triggeredBy.avatarColor}
              avatarUrl={wf.triggeredBy.avatarUrl}
            />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: p1Font.body2,
                  fontFamily: p1Font.family,
                  fontWeight: 500,
                  color: p1Text.primary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {wf.triggeredBy.label}
              </div>
              {wf.triggeredBy.timestamp && (
                <div
                  style={{
                    fontSize: p1Font.body3,
                    fontFamily: p1Font.family,
                    color: p1Text.tertiary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {wf.triggeredBy.timestamp}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: p1Font.body2,
                fontFamily: p1Font.family,
                fontWeight: 500,
                color: p1Text.primary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {wf.triggeredBy.label}
            </div>
            {wf.triggeredBy.timestamp && (
              <div
                style={{
                  fontSize: p1Font.body3,
                  fontFamily: p1Font.family,
                  color: p1Text.tertiary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {wf.triggeredBy.timestamp}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ padding: '0 8px', minWidth: 0 }}>
        <UserCell {...wf.lastModifiedBy} />
      </div>

      <div style={{ padding: '0 8px' }}>
        {wf.shared ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: p1Font.body2,
              fontFamily: p1Font.family,
              color: p1Text.secondary,
            }}
          >
            <Globe className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Shared
          </span>
        ) : null}
      </div>

      <div style={{ padding: '0 8px', fontSize: p1Font.body2, fontFamily: p1Font.family, color: p1Text.primary }}>
        {wf.executions7d > 0 ? wf.executions7d : ''}
      </div>

      <div style={{ width: 36 }} aria-hidden />
    </div>
  );
}

function TableHeader() {
  const th: CSSProperties = {
    padding: '0 8px',
    fontSize: p1Font.body2,
    fontFamily: p1Font.family,
    fontWeight: 600,
    color: p1Text.tertiary,
    whiteSpace: 'nowrap',
  };

  return (
    <div
      role="row"
      style={{
        display: 'grid',
        gridTemplateColumns: ROW_GRID,
        alignItems: 'center',
        height: 36,
        borderBottom: '1px solid var(--border-level-2)',
        background: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 1,
      }}
    >
      <div />
      <div />
      <div style={th}>Name</div>
      <div style={th}>Tags</div>
      <div style={th}>Triggered by</div>
      <div style={th}>Last modified by</div>
      <div style={th}>Shared</div>
      <div style={{ ...th, flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2, display: 'flex' }}>
        <span>Executions (last</span>
        <span style={{ fontWeight: 400, fontSize: p1Font.body3 }}>7d)</span>
      </div>
      <div />
    </div>
  );
}

function WorkflowGroupCard({
  group,
  expanded,
  onToggle,
  selectedIds,
  onToggleRow,
}: {
  group: Phase1WorkflowGroup;
  expanded: boolean;
  onToggle: () => void;
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
}) {
  const count = group.workflows.length || group.itemCount || 0;

  return (
    <section
      style={{
        background: '#fff',
        border: '1px solid var(--border-level-2)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginBottom: 12,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 44,
          padding: '0 12px',
          border: 'none',
          borderBottom: expanded ? '1px solid var(--border-level-2)' : '1px solid transparent',
          background: '#fff',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span
            style={{
              fontSize: p1Font.body1,
              fontFamily: p1Font.family,
              fontWeight: 600,
              color: p1Text.primary,
            }}
          >
            {group.name}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 20,
              height: 20,
              padding: '0 6px',
              borderRadius: 100,
              fontSize: p1Font.body3,
              fontFamily: p1Font.family,
              fontWeight: 600,
              background: 'var(--badge-bg-neutral)',
              color: 'var(--badge-text-neutral)',
            }}
          >
            {count}
          </span>
        </div>
        <ChevronUp
          className="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]"
          style={{
            transform: expanded ? undefined : 'rotate(180deg)',
            transition: 'transform 0.15s',
          }}
          aria-hidden
        />
      </button>

      {expanded && (
        <div role="table" style={{ width: '100%', overflowX: 'auto' }}>
          <TableHeader />
          {group.workflows.length > 0 ? (
            group.workflows.map((wf) => (
              <WorkflowRow
                key={wf.id}
                wf={wf}
                selected={selectedIds.has(wf.id)}
                onToggle={() => onToggleRow(wf.id)}
              />
            ))
          ) : (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                fontSize: p1Font.body1,
                fontFamily: p1Font.family,
                color: p1Text.tertiary,
                fontStyle: 'italic',
              }}
            >
              {count} workflow{count !== 1 ? 's' : ''} in this group
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function Phase1WorkflowsView() {
  const [searchVal, setSearchVal] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PHASE1_WORKFLOW_GROUPS.map((g) => [g.id, g.expanded ?? false])),
  );

  const filteredGroups = useMemo(() => {
    const q = searchVal.trim().toLowerCase();
    if (!q) return PHASE1_WORKFLOW_GROUPS;
    return PHASE1_WORKFLOW_GROUPS.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.workflows.some((w) => w.name.toLowerCase().includes(q)),
    );
  }, [searchVal]);

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 24px 0',
          flexShrink: 0,
        }}
      >
        <h1 style={p1PageTitle}>Workflows</h1>
        <div className="inline-flex items-center">
          <Button variant="dark" size="small" className="!rounded-r-none">
            Create
          </Button>
          <Button
            variant="dark"
            size="small"
            aria-label="Create options"
            className="!rounded-l-none !border-l !border-white/20 !px-2"
          >
            <ChevronDown className="h-3 w-3" strokeWidth={2} aria-hidden />
          </Button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
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
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search"
            style={{
              ...filterFieldBase,
              width: '100%',
              padding: '0 10px 0 28px',
              outline: 'none',
              color: p1Text.primary,
              background: 'var(--bg-static-2, #FAFAFA)',
            }}
          />
        </div>
        {(['State', 'Triggered from', 'Shared', 'Tags'] as const).map((label) => (
          <button
            key={label}
            type="button"
            style={{
              ...filterFieldBase,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '0 8px',
              background: '#FFFFFF',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {label === 'Tags' ? (
              <span style={{ color: p1Text.tertiary }}>{label}</span>
            ) : (
              <>
                <span style={{ color: p1Text.tertiary }}>{label}:</span>
                <span style={{ fontWeight: 600, color: p1Text.primary }}>All</span>
              </>
            )}
            <IconChevronDown />
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px 24px 24px' }}>
        {filteredGroups.map((group) => (
          <WorkflowGroupCard
            key={group.id}
            group={group}
            expanded={expandedGroups[group.id] ?? false}
            onToggle={() =>
              setExpandedGroups((prev) => ({ ...prev, [group.id]: !prev[group.id] }))
            }
            selectedIds={selectedIds}
            onToggleRow={toggleRow}
          />
        ))}
      </div>
    </>
  );
}
