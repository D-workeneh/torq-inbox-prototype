'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Brain,
  Building2,
  ChevronDown,
  Flag,
  GitBranch,
  Link2,
  List,
  Lock,
  MessageCircle,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Send,
  Filter,
  Sparkles,
  Tag as TagIcon,
  User,
  Workflow,
  X,
} from 'lucide-react';
import { Tag } from '@/components/ui/Tag';
import type {
  Phase1CaseDetail,
  Phase1CasePriority,
  Phase1TimelineEvent,
  Phase1TimelineIcon,
} from './types';
import { PHASE1_CASE_KEYS } from './caseDetails';
import { p1Font, p1Text } from './phase1Typography';

const iconBtn: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  border: '1px solid var(--border-level-2)',
  borderRadius: 6,
  background: 'var(--surface)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  flexShrink: 0,
};

const PRIORITY_META: Record<
  Phase1CasePriority,
  { label: string; dot: string }
> = {
  low: { label: 'Low', dot: '#9CA3AF' },
  medium: { label: 'Medium', dot: '#F59E0B' },
  high: { label: 'High', dot: '#EA580C' },
  critical: { label: 'Critical', dot: '#DC2626' },
};

const TIMELINE_ICONS: Record<Phase1TimelineIcon, typeof Flag> = {
  flag: Flag,
  lock: Lock,
  user: User,
  link: Link2,
  workflow: Workflow,
  branch: GitBranch,
};

function groupTimelineByDate(events: Phase1TimelineEvent[]) {
  const groups: { dateLabel: string; events: Phase1TimelineEvent[] }[] = [];
  for (const ev of events) {
    const last = groups[groups.length - 1];
    if (last?.dateLabel === ev.dateLabel) {
      last.events.push(ev);
    } else {
      groups.push({ dateLabel: ev.dateLabel, events: [ev] });
    }
  }
  return groups;
}

export interface Phase1CaseExpandViewProps {
  detail: Phase1CaseDetail;
  onClose?: () => void;
  onNavigateCase?: (caseKey: string) => void;
  caseKeys?: readonly string[];
}

export function Phase1CaseExpandView({
  detail,
  onClose,
  onNavigateCase,
  caseKeys = PHASE1_CASE_KEYS,
}: Phase1CaseExpandViewProps) {
  const [overviewTab, setOverviewTab] = useState('overview');
  const [sidebarTab, setSidebarTab] = useState<'timeline' | 'custom' | 'socrates'>('timeline');
  const [securityOpen, setSecurityOpen] = useState(true);
  const [comment, setComment] = useState('');

  const caseIndex = caseKeys.indexOf(detail.caseKey);
  const hasPrev = caseIndex > 0;
  const hasNext = caseIndex >= 0 && caseIndex < caseKeys.length - 1;

  const timelineGroups = useMemo(
    () => groupTimelineByDate(detail.timeline),
    [detail.timeline],
  );

  const overviewTabs = useMemo(
    () => [
      { id: 'overview', label: 'Overview' },
      { id: 'observables', label: 'Observables', count: detail.tabCounts.observables },
      { id: 'notes', label: 'Notes', count: detail.tabCounts.notes },
      { id: 'attachments', label: 'Attachments', count: detail.tabCounts.attachments },
      { id: 'linked', label: 'Linked cases', count: detail.tabCounts.linkedCases },
      { id: 'events', label: 'Events', count: detail.tabCounts.events },
      { id: 'runbook', label: 'Runbook' },
    ],
    [detail.tabCounts],
  );

  const priority = PRIORITY_META[detail.priority];

  function goPrev() {
    if (hasPrev && onNavigateCase) onNavigateCase(caseKeys[caseIndex - 1]!);
  }

  function goNext() {
    if (hasNext && onNavigateCase) onNavigateCase(caseKeys[caseIndex + 1]!);
  }

  return (
    <div
      className="relative flex h-full min-h-0 min-w-0 flex-col bg-[var(--surface)] font-[family-name:var(--font-family)]"
      data-case-key={detail.caseKey}
    >
      {/* Global header */}
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--border-level-2)] px-3 py-2 sm:gap-3 sm:px-4 lg:px-5">
        <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            aria-label="Expand case panel"
            style={iconBtn}
            className="hidden sm:flex"
          >
            <PanelLeft size={16} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Previous case"
            style={iconBtn}
            disabled={!hasPrev}
            onClick={goPrev}
            className="disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp size={16} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next case"
            style={iconBtn}
            disabled={!hasNext}
            onClick={goNext}
            className="disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowDown size={16} aria-hidden />
          </button>
          <span className="truncate font-mono text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)]">
            {detail.displayId}
          </span>
        </div>

        {detail.restricted && (
          <div className="order-3 flex w-full justify-center sm:order-none sm:w-auto sm:flex-1 sm:justify-center">
            <span
              className="inline-flex items-center gap-1.5 rounded-md border border-[#FDE68A] bg-[#FEF9C3] px-3 py-1 text-[length:var(--font-size-body2)] font-medium text-[#92400E]"
              role="status"
            >
              <Lock size={14} className="shrink-0" aria-hidden />
              Restricted
            </span>
          </div>
        )}

        {!detail.restricted && <div className="hidden flex-1 sm:block" />}

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold text-white"
            style={{ background: detail.assigneeColor }}
            title="Current user"
          >
            {detail.assigneeInitials}
          </span>
          <button type="button" aria-label="More actions" style={iconBtn}>
            <MoreHorizontal size={16} />
          </button>
          {onClose && (
            <button type="button" aria-label="Close case" onClick={onClose} style={iconBtn}>
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Two panels side-by-side (always; each column scrolls independently) */}
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(260px,34%)_minmax(0,1fr)] overflow-hidden">
        {/* Left panel — metadata + timeline */}
        <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden border-r border-[var(--border-level-2)] bg-[var(--surface)]">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <h1
              className="m-0 text-[length:var(--font-size-h3)] font-semibold leading-tight text-[var(--text-primary)]"
              style={{ fontFamily: p1Font.family }}
            >
              {detail.title}
            </h1>

            <div className="mt-2 space-y-0.5 text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">
              <p className="m-0">
                <span className="text-[var(--text-secondary)]">Opened:</span> {detail.openedAt}
              </p>
              <p className="m-0">
                <span className="text-[var(--text-secondary)]">Edited:</span> {detail.editedAt}
              </p>
            </div>

            {/* Status row */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-level-2)] bg-[var(--surface)] px-2.5 py-1.5 text-[length:var(--font-size-body2)] text-[var(--text-primary)] hover:bg-[var(--bg-hover-level-2)]"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: priority.dot }}
                  aria-hidden
                />
                {priority.label}
                <ChevronDown size={14} className="text-[var(--text-tertiary)]" aria-hidden />
              </button>

              {detail.slaElapsed !== '—' && (
                <span className="text-[length:var(--font-size-body2)]">
                  <span className="font-medium text-[#DC2626]">{detail.slaElapsed}</span>
                  {detail.slaRemaining !== '—' && (
                    <>
                      <span className="mx-1 text-[var(--text-tertiary)]">|</span>
                      <span className="font-medium text-[#EA580C]">{detail.slaRemaining}</span>
                    </>
                  )}
                </span>
              )}

              <Tag
                color="neutral"
                appearance="surface"
                size="small"
                icon={<Building2 className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />}
              >
                {detail.teamTag}
              </Tag>
            </div>

            {/* Action row */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex max-w-[140px] items-center gap-1 truncate rounded-md border border-[var(--border-level-2)] bg-[var(--surface)] px-2.5 py-1.5 text-[length:var(--font-size-body2)] text-[var(--text-primary)] hover:bg-[var(--bg-hover-level-2)] sm:max-w-[180px]"
              >
                <span className="truncate">{detail.substateLabel}</span>
                <ChevronDown size={14} className="shrink-0 text-[var(--text-tertiary)]" aria-hidden />
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md border border-[var(--border-level-2)] bg-[var(--surface)] px-2.5 py-1.5 text-[length:var(--font-size-body2)] text-[var(--text-primary)] hover:bg-[var(--bg-hover-level-2)]"
              >
                <Workflow size={14} className="text-[var(--text-tertiary)]" aria-hidden />
                <span className="max-w-[100px] truncate sm:max-w-none">{detail.capLabel}</span>
                <ChevronDown size={14} className="text-[var(--text-tertiary)]" aria-hidden />
              </button>
              <div className="flex items-center gap-1">
                <button type="button" aria-label="Tags" style={iconBtn}>
                  <TagIcon size={15} />
                </button>
                <button type="button" aria-label="Branching" style={iconBtn}>
                  <GitBranch size={15} />
                </button>
                <button type="button" aria-label="Flag" style={iconBtn}>
                  <Flag size={15} />
                </button>
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--surface)] text-[10px] font-semibold text-white"
                  style={{ background: detail.assigneeColor }}
                >
                  {detail.assigneeInitials}
                </span>
                <span
                  className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--neutral-8)] text-[10px] font-semibold text-white"
                >
                  D
                </span>
              </div>
            </div>

            {/* Sidebar tabs */}
            <div
              role="tablist"
              aria-label="Case sidebar"
              className="mt-5 flex gap-4 border-b border-[var(--border-level-1)]"
            >
              {(
                [
                  { id: 'timeline' as const, label: 'Timeline' },
                  { id: 'custom' as const, label: 'Custom Fields' },
                  { id: 'socrates' as const, label: 'Socrates', icon: Brain },
                ] as const
              ).map((tab) => {
                const active = sidebarTab === tab.id;
                const Icon = 'icon' in tab ? tab.icon : null;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSidebarTab(tab.id)}
                    className="relative shrink-0 border-0 bg-transparent pb-2.5 pt-1 text-[length:var(--font-size-body2)] transition-colors"
                    style={{
                      fontWeight: active ? 600 : 400,
                      color: active ? p1Text.primary : p1Text.tertiary,
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {Icon && <Icon size={14} aria-hidden />}
                      {tab.label}
                    </span>
                    {active && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[var(--neutral-12)]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sidebar tab panels */}
            <div className="mt-4">
              {sidebarTab === 'timeline' && (
                <div role="tabpanel">
                  {timelineGroups.map((group) => (
                    <div key={group.dateLabel} className="mb-4">
                      <p className="mb-2 text-[length:var(--font-size-body2)] font-medium text-[var(--text-secondary)]">
                        {group.dateLabel}
                      </p>
                      <ul className="m-0 list-none p-0">
                        {group.events.map((item, idx) => {
                          const Icon = TIMELINE_ICONS[item.icon];
                          const isLast = idx === group.events.length - 1;
                          return (
                            <li key={item.id} className="relative flex gap-3">
                              {!isLast && (
                                <span
                                  className="absolute left-4 top-9 bottom-0 w-px bg-[var(--border-level-2)]"
                                  aria-hidden
                                />
                              )}
                              <span className="relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-static-3)]">
                                <Icon size={14} className="text-[var(--text-tertiary)]" />
                              </span>
                              <div className="min-w-0 flex-1 pb-4">
                                <p className="m-0 text-[length:var(--font-size-body2)] font-medium leading-snug text-[var(--text-primary)]">
                                  {item.title}
                                </p>
                                <p className="mt-0.5 text-[length:var(--font-size-body3)] text-[var(--text-tertiary)]">
                                  {item.who} · {item.time}
                                </p>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              {sidebarTab === 'custom' && (
                <p className="m-0 text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">
                  No custom fields configured for this case.
                </p>
              )}
              {sidebarTab === 'socrates' && (
                <p className="m-0 text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">
                  Ask Socrates about this case — AI assistant coming soon in prototype.
                </p>
              )}
            </div>
          </div>

          {/* Comment composer — all controls share one height */}
          <div className="flex shrink-0 items-stretch gap-2 border-t border-[var(--border-level-2)] px-4 py-3 sm:px-5">
            <button
              type="button"
              aria-label="Add attachment"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border-level-2)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover-level-2)]"
            >
              <Plus size={16} />
            </button>
            <button
              type="button"
              aria-label="Filter comments"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border-level-2)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover-level-2)]"
            >
              <Filter size={16} />
            </button>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter text (3–5,000 characters)"
              className="h-9 min-w-0 flex-1 rounded-lg border border-[var(--border-level-2)] bg-[var(--surface)] px-3 py-0 text-[length:var(--font-size-body2)] leading-9 text-[var(--text-primary)] outline-none placeholder:italic placeholder:text-[var(--text-placeholder)] focus:border-[var(--border-level-3)]"
            />
            <div
              className="flex h-9 shrink-0 items-stretch overflow-hidden rounded-md border border-[var(--border-level-2)] bg-[var(--surface)]"
              role="group"
              aria-label="Send comment"
            >
              <button
                type="button"
                aria-label="Send"
                disabled={comment.trim().length < 3}
                className="flex items-center justify-center px-2.5 text-[var(--text-secondary)] hover:bg-[var(--bg-hover-level-2)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={16} strokeWidth={1.75} />
              </button>
              <span className="w-px self-stretch bg-[var(--border-level-2)]" aria-hidden />
              <button
                type="button"
                aria-label="Send options"
                className="flex items-center justify-center px-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover-level-2)]"
              >
                <ChevronDown size={14} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </aside>

        {/* Right panel — overview tabs + content */}
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-[var(--surface)]">
          <div
            role="tablist"
            aria-label="Case content"
            className="flex shrink-0 gap-0 overflow-x-auto border-b border-[var(--border-level-1)] bg-[var(--surface)] px-2 pt-2 sm:px-4"
          >
            {overviewTabs.map((tab) => {
              const active = overviewTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setOverviewTab(tab.id)}
                  className="relative shrink-0 border-0 bg-transparent px-2.5 pb-2.5 pt-1 text-[length:var(--font-size-body2)] transition-colors sm:px-3"
                  style={{
                    fontWeight: active ? 600 : 400,
                    color: active ? p1Text.primary : p1Text.tertiary,
                  }}
                >
                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                    {tab.label}
                    {'count' in tab && tab.count !== undefined && (
                      <span className="text-[var(--text-tertiary)]">({tab.count})</span>
                    )}
                  </span>
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[var(--neutral-12)]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            {overviewTab === 'overview' ? (
              <>
                {/* Case summary card */}
                <section className="mb-5 rounded-lg border border-[var(--border-level-2)] bg-[var(--surface)] p-4 sm:p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="m-0 flex items-center gap-2 text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)]">
                      <Sparkles size={16} className="text-[var(--royal)]" aria-hidden />
                      Case summary
                    </h2>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md border border-[var(--border-level-2)] bg-[var(--surface)] px-2.5 py-1 text-[length:var(--font-size-body2)] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover-level-2)]"
                    >
                      <Sparkles size={14} className="text-[var(--royal)]" aria-hidden />
                      Regenerate
                    </button>
                  </div>

                  <dl className="m-0 space-y-3">
                    {(
                      [
                        ['What', detail.summarySections.what],
                        ['When', detail.summarySections.when],
                        ['Impact', detail.summarySections.impact],
                      ] as const
                    ).map(([label, value]) => (
                      <div key={label}>
                        <dt className="mb-0.5 text-[length:var(--font-size-body2)] font-semibold text-[var(--text-primary)]">
                          {label}:
                        </dt>
                        <dd className="m-0 text-[length:var(--font-size-body2)] leading-relaxed text-[var(--text-secondary)]">
                          {value}
                        </dd>
                      </div>
                    ))}
                    {detail.summarySections.keyIndicators.length > 0 && (
                      <div>
                        <dt className="mb-1 text-[length:var(--font-size-body2)] font-semibold text-[var(--text-primary)]">
                          Key indicators:
                        </dt>
                        <dd className="m-0">
                          <ul className="m-0 list-disc space-y-1 pl-5 text-[length:var(--font-size-body2)] text-[var(--text-secondary)]">
                            {detail.summarySections.keyIndicators.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    )}
                  </dl>

                  <p className="mb-0 mt-4 text-[length:var(--font-size-body3)] text-[var(--text-tertiary)]">
                    {detail.summaryGeneratedAt}
                  </p>
                </section>

                {/* Security context */}
                <section className="rounded-lg border border-[var(--border-level-2)] bg-[var(--surface)]">
                  <button
                    type="button"
                    onClick={() => setSecurityOpen((o) => !o)}
                    className="flex w-full items-center justify-between gap-2 border-0 bg-transparent px-4 py-3 text-left sm:px-5"
                    aria-expanded={securityOpen}
                  >
                    <span className="text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)]">
                      Security context
                    </span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-[var(--text-tertiary)] transition-transform ${securityOpen ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </button>
                  {securityOpen && (
                    <div className="border-t border-[var(--border-level-1)] px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
                      <SecurityContextGrid context={detail.securityContext} />
                    </div>
                  )}
                </section>
              </>
            ) : (
              <PlaceholderTab name={overviewTab} detail={detail} />
            )}
          </div>
        </div>
      </div>

      {/* Floating assistant */}
      <button
        type="button"
        aria-label="Open chat assistant"
        className="absolute bottom-5 right-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--neutral-12)] text-white shadow-lg hover:opacity-90 sm:bottom-6 sm:right-6"
      >
        <MessageCircle size={22} aria-hidden />
        {detail.attentionCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[var(--surface)] bg-[#EA231A]"
            aria-hidden
          />
        )}
      </button>
    </div>
  );
}

function SecurityContextGrid({
  context,
}: {
  context: Phase1CaseDetail['securityContext'];
}) {
  const fields = [
    ['Alert ID', context.alertId],
    ['Incident ID', context.incidentId],
    ['Source', context.source],
    ['Source Product', context.sourceProduct],
    ['Detection Name', context.detectionName],
    ['Start Time', context.startTime],
    ['End Time', context.endTime],
    ['Source Severity', context.sourceSeverity],
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
      {fields.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <p className="m-0 truncate text-[length:var(--font-size-body3)] font-medium text-[var(--text-tertiary)]">
            {label}
          </p>
          <p className="m-0 mt-0.5 truncate text-[length:var(--font-size-body2)] text-[var(--text-primary)]">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

function PlaceholderTab({
  name,
  detail,
}: {
  name: string;
  detail: Phase1CaseDetail;
}) {
  const labels: Record<string, string> = {
    observables: 'Observables',
    notes: 'Notes',
    attachments: 'Attachments',
    linked: 'Linked cases',
    events: 'Events',
    runbook: 'Runbook',
  };
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border-level-2)] bg-[var(--surface)] p-8 text-center">
      <List size={28} className="mb-3 text-[var(--text-tertiary)]" aria-hidden />
      <p className="m-0 text-[length:var(--font-size-body1)] font-medium text-[var(--text-primary)]">
        {labels[name] ?? name}
      </p>
      <p className="mt-2 max-w-sm text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">
        Content for {detail.displayId} will appear here when connected to the cases service.
      </p>
    </div>
  );
}
