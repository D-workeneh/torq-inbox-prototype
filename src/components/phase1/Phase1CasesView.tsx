'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import {
  Building2,
  Clock,
  FileText,
  Globe2,
  Lock,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconChevronDown } from './icons';
import { Phase1UserAvatar } from './phase1Avatars';
import {
  PHASE1_CASE_BOARD_COLUMNS,
  type Phase1CaseBoardCard,
  type Phase1CaseBoardColumn,
} from './casesBoardData';
import type { Phase1CasePriority } from './types';
import { p1Font, p1PageTitle, p1Text } from './phase1Typography';

const FILTER_H = 28;
const FILTER_RADIUS = 6;
const COLUMN_W = 280;

const filterFieldBase: CSSProperties = {
  height: FILTER_H,
  fontSize: p1Font.body2,
  fontFamily: p1Font.family,
  border: '1px solid var(--border-level-2)',
  borderRadius: FILTER_RADIUS,
  boxSizing: 'border-box',
};

const PRIORITY_STYLE: Record<
  Phase1CasePriority,
  { bg: string; color: string; label: string }
> = {
  critical: { bg: '#FEE2E2', color: '#DC2626', label: 'Critical' },
  high: { bg: '#FFEDD5', color: '#EA580C', label: 'High' },
  medium: { bg: '#FEF3C7', color: '#D97706', label: 'Medium' },
  low: { bg: '#F3F4F6', color: '#6B7280', label: 'Low' },
};

const FILTER_ROW_1 = [
  'All Cases',
  'Sort by: Severity',
  'Severity',
  'Tag',
  'Assignee',
  'Group assignee',
  'Resolution SLA: All',
] as const;

const FILTER_ROW_2 = [
  'Category',
  'Workspace',
  'State',
  'Tasks: All cases',
  'Created: Any time',
  'Updated: Any time',
  'Reviewer',
  'Review conclusion',
  'Access: All',
] as const;

function FilterPill({ label }: { label: string }) {
  const hasValue = label.includes(':');
  const [left, right] = hasValue ? label.split(/:\s*/) : [label, null];

  return (
    <button
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
        color: p1Text.primary,
      }}
    >
      {label === 'Sort by: Severity' ? (
        <>
          <SlidersHorizontal className="h-3 w-3 text-[var(--text-tertiary)]" strokeWidth={2} />
          <span style={{ color: p1Text.tertiary }}>Sort by:</span>
          <span style={{ fontWeight: 600 }}>Severity</span>
        </>
      ) : hasValue && right ? (
        <>
          <span style={{ color: p1Text.tertiary }}>{left}:</span>
          <span style={{ fontWeight: 600 }}>{right}</span>
        </>
      ) : (
        <span style={{ fontWeight: label === 'All Cases' ? 600 : 400, color: p1Text.primary }}>
          {label}
        </span>
      )}
      <IconChevronDown />
    </button>
  );
}

function HeaderIconButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        border: '1px solid var(--border-level-2)',
        borderRadius: 6,
        background: '#FFFFFF',
        cursor: 'pointer',
        color: p1Text.secondary,
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

function WorkspaceScopeToggle({
  scope,
  onChange,
  workspaceName,
}: {
  scope: 'all' | 'workspace';
  onChange: (scope: 'all' | 'workspace') => void;
  workspaceName: string;
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid var(--border-level-2)',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#FFFFFF',
      }}
    >
      <button
        type="button"
        onClick={() => onChange('all')}
        style={{
          border: 'none',
          padding: '6px 14px',
          fontSize: p1Font.body2,
          fontFamily: p1Font.family,
          fontWeight: scope === 'all' ? 600 : 400,
          cursor: 'pointer',
          background: scope === 'all' ? '#090A0B' : 'transparent',
          color: scope === 'all' ? '#FFFFFF' : p1Text.secondary,
        }}
      >
        All Workspaces
      </button>
      <button
        type="button"
        onClick={() => onChange('workspace')}
        style={{
          border: 'none',
          padding: '6px 14px',
          fontSize: p1Font.body2,
          fontFamily: p1Font.family,
          fontWeight: scope === 'workspace' ? 600 : 400,
          cursor: 'pointer',
          background: scope === 'workspace' ? '#090A0B' : 'transparent',
          color: scope === 'workspace' ? '#FFFFFF' : p1Text.secondary,
        }}
      >
        {workspaceName}
      </button>
    </div>
  );
}

function CaseCard({
  card,
  onOpen,
}: {
  card: Phase1CaseBoardCard;
  onOpen: (caseKey: string) => void;
}) {
  const priority = PRIORITY_STYLE[card.priority];

  return (
    <button
      type="button"
      onClick={() => onOpen(card.caseKey)}
      style={{
        display: 'block',
        width: '100%',
        height: 'auto',
        flexShrink: 0,
        textAlign: 'left',
        border: '1px solid var(--border-level-2)',
        borderRadius: 8,
        background: '#FFFFFF',
        padding: 0,
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(9, 10, 11, 0.04)',
      }}
    >
      {card.restricted && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            background: '#FEF9C3',
            borderBottom: '1px solid #FDE68A',
            fontSize: p1Font.body3,
            fontFamily: p1Font.family,
            fontWeight: 500,
            color: '#854D0E',
          }}
        >
          <Lock className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
          Restricted
        </div>
      )}

      <div style={{ padding: '10px 12px 12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: p1Font.body3,
                fontFamily: p1Font.family,
                fontWeight: 600,
                background: priority.bg,
                color: priority.color,
                flexShrink: 0,
              }}
            >
              {priority.label}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontSize: p1Font.body3,
                fontFamily: p1Font.family,
                color: card.slaOverdue ? '#DC2626' : p1Text.tertiary,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <Clock className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
              {card.slaElapsed} | {card.slaRemaining}
            </span>
          </div>
          <span
            style={{
              fontSize: p1Font.body3,
              fontFamily: p1Font.family,
              color: p1Text.tertiary,
              flexShrink: 0,
            }}
          >
            {card.displayId}
          </span>
        </div>

        <div
          style={{
            fontSize: p1Font.body1,
            fontFamily: p1Font.family,
            fontWeight: 600,
            color: p1Text.primary,
            marginBottom: 8,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {card.title}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            marginBottom: card.tags?.length ? 8 : 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: p1Font.body3,
              fontFamily: p1Font.family,
              color: p1Text.secondary,
            }}
          >
            <Building2 className="h-3 w-3 shrink-0 text-[var(--text-tertiary)]" strokeWidth={2} />
            {card.workspace}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: p1Font.body3,
              fontFamily: p1Font.family,
              color: p1Text.secondary,
            }}
          >
            <Users className="h-3 w-3 shrink-0 text-[var(--text-tertiary)]" strokeWidth={2} />
            {card.team}
          </div>
        </div>

        {card.tags && card.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
            {card.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: p1Font.body3,
                  fontFamily: p1Font.family,
                  color: p1Text.secondary,
                  background: 'var(--bg-static-3)',
                  border: '1px solid var(--border-level-1)',
                  borderRadius: 4,
                  padding: '2px 6px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: p1Font.body3,
              fontFamily: p1Font.family,
              color: p1Text.tertiary,
              lineHeight: 1.35,
              minWidth: 0,
              flex: 1,
            }}
          >
            Created: {card.createdAt}
          </span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {card.assignees.map((a, i) => (
              <div
                key={`${a.initials}-${i}`}
                style={{ marginLeft: i > 0 ? -6 : 0, zIndex: card.assignees.length - i }}
              >
                <Phase1UserAvatar
                  name={a.initials}
                  initials={a.initials}
                  avatarColor={a.color}
                  avatarUrl={a.avatarUrl}
                  size={22}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

function KanbanColumn({
  column,
  onOpenCase,
}: {
  column: Phase1CaseBoardColumn;
  onOpenCase: (caseKey: string) => void;
}) {
  return (
    <div
      style={{
        width: COLUMN_W,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 4px 12px',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: p1Font.body1,
            fontFamily: p1Font.family,
            fontWeight: 600,
            color: p1Text.primary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}
          title={column.label}
        >
          {column.label}
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
            background: 'var(--badge-bg-neutral, #F3F4F6)',
            color: 'var(--badge-text-neutral, #6B7280)',
            flexShrink: 0,
          }}
        >
          {column.count}
        </span>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          paddingRight: 4,
          minHeight: 0,
        }}
      >
        {column.cards.length === 0 ? (
          <div
            style={{
              border: '1px dashed var(--border-level-2)',
              borderRadius: 8,
              padding: 24,
              textAlign: 'center',
              fontSize: p1Font.body2,
              fontFamily: p1Font.family,
              color: p1Text.tertiary,
            }}
          >
            No cases
          </div>
        ) : (
          column.cards.map((card) => (
            <CaseCard key={`${column.id}-${card.caseKey}-${card.displayId}`} card={card} onOpen={onOpenCase} />
          ))
        )}
      </div>
    </div>
  );
}

export function Phase1CasesView({
  workspaceName = 'torq-dev',
  onOpenCase,
}: {
  workspaceName?: string;
  onOpenCase?: (caseKey: string) => void;
}) {
  const [searchVal, setSearchVal] = useState('');
  const [workspaceScope, setWorkspaceScope] = useState<'all' | 'workspace'>('all');

  const filteredColumns = useMemo(() => {
    const q = searchVal.trim().toLowerCase();
    if (!q) return PHASE1_CASE_BOARD_COLUMNS;

    return PHASE1_CASE_BOARD_COLUMNS.map((col) => ({
      ...col,
      cards: col.cards.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.displayId.toLowerCase().includes(q) ||
          c.team.toLowerCase().includes(q) ||
          c.tags?.some((t) => t.toLowerCase().includes(q)),
      ),
      count:
        col.count === '999+'
          ? col.count
          : col.cards.filter(
              (c) =>
                c.title.toLowerCase().includes(q) ||
                c.displayId.toLowerCase().includes(q) ||
                c.team.toLowerCase().includes(q) ||
                c.tags?.some((t) => t.toLowerCase().includes(q)),
            ).length,
    }));
  }, [searchVal]);

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px 0',
          flexShrink: 0,
          gap: 16,
        }}
      >
        <h1 style={p1PageTitle}>Cases</h1>

        <WorkspaceScopeToggle
          scope={workspaceScope}
          onChange={setWorkspaceScope}
          workspaceName={workspaceName}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <HeaderIconButton label="Add document">
            <FileText className="h-4 w-4" strokeWidth={1.75} />
          </HeaderIconButton>
          <HeaderIconButton label="View settings">
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
          </HeaderIconButton>
          <HeaderIconButton label="Global settings">
            <Globe2 className="h-4 w-4" strokeWidth={1.75} />
          </HeaderIconButton>
          <HeaderIconButton label="Refresh">
            <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
          </HeaderIconButton>
          <Button
            theme="third"
            size="small"
            style={{
              border: '1px solid var(--border-level-2)',
              background: '#FFFFFF',
              color: p1Text.primary,
              fontWeight: 600,
            }}
          >
            Create
          </Button>
        </div>
      </div>

      <div style={{ padding: '16px 24px 0', flexShrink: 0 }}>
        <div style={{ position: 'relative', width: 220, marginBottom: 8 }}>
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]"
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
              height: 32,
              padding: '0 10px 0 32px',
              outline: 'none',
              color: p1Text.primary,
              background: 'var(--bg-static-2, #FAFAFA)',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginBottom: 6,
          }}
        >
          {FILTER_ROW_1.map((label) => (
            <FilterPill key={label} label={label} />
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            alignItems: 'center',
            paddingBottom: 12,
          }}
        >
          {FILTER_ROW_2.map((label) => (
            <FilterPill key={label} label={label} />
          ))}
          <button
            type="button"
            aria-label="Add filter"
            style={{
              ...filterFieldBase,
              width: FILTER_H,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#FFFFFF',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <Plus className="h-3.5 w-3.5 text-[var(--text-tertiary)]" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '0 24px 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 16,
            height: '100%',
            minWidth: 'min-content',
          }}
        >
          {filteredColumns.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              onOpenCase={(caseKey) => onOpenCase?.(caseKey)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
