'use client';

import { useState } from 'react';
import {
  Zap,
  Plug,
  Variable,
  FileText,
  Search as SearchLucide,
  AlertCircle,
  BookOpen,
  Eye,
  SquareCode,
  BarChart2,
  Lightbulb,
  LayoutDashboard,
  MousePointerClick,
  Table,
  BotMessageSquare,
  Target,
  Database,
  BookMarked,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronRight,
  Inbox as InboxSidebarIcon,
  Search,
  SlidersHorizontal,
  Plus,
  MoreHorizontal,
  Pin as PinIcon,
} from 'lucide-react';
import { InboxPanel } from '@/components/InboxPanel';

// ─── Sidebar data ──────────────────────────────────────────────────────────

type NavItem = { label: string; icon: React.ElementType; active?: boolean };
type NavSection = { title: string; items: NavItem[]; defaultOpen?: boolean };

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Build',
    defaultOpen: true,
    items: [
      { label: 'Workflows', icon: Zap, active: true },
      { label: 'Integrations', icon: Plug },
      { label: 'Workspace Variables', icon: Variable },
      { label: 'Templates', icon: FileText },
    ],
  },
  {
    title: 'Investigate',
    defaultOpen: false,
    items: [
      { label: 'Cases', icon: AlertCircle },
      { label: 'Runbooks', icon: BookOpen },
      { label: 'Observables', icon: Eye },
      { label: 'Sources', icon: SquareCode },
    ],
  },
  {
    title: 'Monitor',
    defaultOpen: false,
    items: [
      { label: 'Activity Log', icon: BarChart2 },
      { label: 'Insights', icon: Lightbulb },
      { label: 'Casus Dashboards', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Interact',
    defaultOpen: false,
    items: [
      { label: 'Interact data picker', icon: MousePointerClick },
      { label: 'Table for interact', icon: Table },
      { label: 'Snappy bot', icon: BotMessageSquare },
      { label: 'Insights', icon: Lightbulb },
      { label: 'Indicator Investigation', icon: Target },
      { label: 'Bring me the data', icon: Database },
    ],
  },
];

// ─── Workflow data ─────────────────────────────────────────────────────────

type WorkflowStatus = 'active' | 'inactive' | 'error';

interface Workflow {
  id: string;
  name: string;
  status: WorkflowStatus;
  author: string;
  authorAvatar: string;
  updatedBy: string;
  updatedByAvatar: string;
  updatedAt: string;
  pinned?: boolean;
}

interface WorkflowGroup {
  name: string;
  count: number;
  workflows?: Workflow[];
}

const PINNED_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-p1',
    name: 'Roma sandbox',
    status: 'active',
    author: 'Roma Kunchan',
    authorAvatar: 'RK',
    updatedBy: 'Alexi Gal',
    updatedByAvatar: 'AG',
    updatedAt: 'Apr 12 2026, 3:46 PM',
    pinned: true,
  },
  {
    id: 'wf-p2',
    name: 'roma dev',
    status: 'inactive',
    author: 'Roma Kunchan',
    authorAvatar: 'RK',
    updatedBy: 'Moshe Bogdev Brad...',
    updatedByAvatar: 'MB',
    updatedAt: 'Nov 4 2026, 2:06 PM',
    pinned: true,
  },
];

const WORKFLOW_GROUPS: WorkflowGroup[] = [
  { name: '_BH_new', count: 1 },
  { name: '# Work in Progress', count: 9 },
  { name: 'AA', count: 10 },
  { name: 'AgentTools 🔑💰🏖️', count: 3 },
  { name: 'Alex', count: 1 },
  { name: 'API', count: 1 },
  { name: 'AWS2', count: 3 },
  { name: 'Case Creation from Field Mapping Workflows', count: 6 },
  { name: 'David W', count: 4 },
  { name: "Duba's Adi", count: 3 },
  { name: 'elron', count: 1 },
  { name: 'Extraction', count: 4 },
  { name: 'Gambinos', count: 3 },
  { name: 'Google Threat Intel', count: 8 },
  { name: 'hadi', count: 1 },
  { name: 'HAdI', count: 38 },
];

// ─── Status dot ────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: WorkflowStatus }) {
  const colors: Record<WorkflowStatus, string> = {
    active: 'bg-[var(--color-orange-500)]',
    inactive: 'bg-[var(--color-orange-300)]',
    error: 'bg-[var(--color-red-500)]',
  };
  return (
    <span className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${colors[status]}`}>
      <span className="h-2 w-2 rounded-full bg-white/60" />
    </span>
  );
}

// ─── Avatar ────────────────────────────────────────────────────────────────

function Avatar({ initials, size = 'sm' }: { initials: string; size?: 'sm' | 'xs' }) {
  const sz = size === 'sm' ? 'h-6 w-6 text-[var(--font-size-xs)]' : 'h-5 w-5 text-[10px]';
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] font-semibold ${sz}`}
    >
      {initials}
    </span>
  );
}

// ─── Sidebar Section ───────────────────────────────────────────────────────

function SidebarSection({ section, defaultOpen }: { section: NavSection; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-1.5 text-[var(--font-size-xs)] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
      >
        {section.title}
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
        />
      </button>
      {open && (
        <nav className="mb-1 flex flex-col gap-0.5">
          {section.items.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href="#"
                className={`flex items-center gap-2 rounded-[var(--radius-md)] mx-2 px-2 py-1.5 text-[var(--font-size-sm)] transition-colors ${
                  item.active
                    ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-500)] font-medium'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </a>
            );
          })}
        </nav>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function Home() {
  const [inboxOpen, setInboxOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  function toggleRow(id: string) {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="h-screen w-full bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] font-sans overflow-hidden">
      <div className="flex h-full">

        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <aside className="w-[220px] shrink-0 border-r border-[var(--color-border-2)] bg-[var(--color-surface-secondary)] flex flex-col h-full overflow-hidden">

          {/* Brand */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border-1)] shrink-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-primary-500)]">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="flex-1 text-[var(--font-size-sm)] font-semibold truncate">torq-dev</span>
            <ChevronDown className="h-3.5 w-3.5 text-[var(--color-text-tertiary)] shrink-0" />
          </div>

          {/* Nav sections */}
          <div className="flex-1 overflow-y-auto py-2 space-y-1">
            {NAV_SECTIONS.map((s) => (
              <SidebarSection key={s.title} section={s} defaultOpen={s.defaultOpen ?? false} />
            ))}
          </div>

          {/* Bottom */}
          <div className="shrink-0 border-t border-[var(--color-border-1)]">
            {/* Notifications */}
            <div className="px-2 pt-2">
              <button
                onClick={() => setInboxOpen((o) => !o)}
                className={`flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-[var(--font-size-sm)] transition-colors ${
                  inboxOpen
                    ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-500)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <span className="relative shrink-0">
                  <InboxSidebarIcon className="h-3.5 w-3.5" />
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[var(--color-red-500)] px-0.5 text-[9px] font-bold text-white leading-none shadow-sm">
                    10
                  </span>
                </span>
                <span>Inbox</span>
              </button>
            </div>

            {/* Knowledge Hub */}
            <div className="px-2">
              <a
                href="#"
                className="flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-[var(--font-size-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <BookMarked className="h-3.5 w-3.5 shrink-0" />
                Knowledge Hub
              </a>
            </div>

            {/* Settings */}
            <div className="px-2">
              <a
                href="#"
                className="flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-[var(--font-size-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <SettingsIcon className="h-3.5 w-3.5 shrink-0" />
                Settings
              </a>
            </div>

            {/* User */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-t border-[var(--color-border-1)] mt-1">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-[var(--font-size-xs)] font-bold text-white">
                D
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">
                  David Workeneh
                </p>
                <p className="truncate text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">
                  david.workeneh@torq.io
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Inbox Panel (slides in next to sidebar) ───────────────────── */}
        <InboxPanel isOpen={inboxOpen} onClose={() => setInboxOpen(false)} />

        {/* ── Main Content — Workflows ──────────────────────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-[var(--color-surface-primary)]">

          {/* Page header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-2)] shrink-0">
            <h1 className="text-[var(--font-size-2xl)] font-semibold text-[var(--color-text-primary)]">
              Workflows
            </h1>
            <div className="flex items-center">
              <button className="flex items-center gap-1.5 rounded-l-[var(--radius-md)] bg-[var(--color-primary-500)] px-4 py-2 text-[var(--font-size-sm)] font-semibold text-white hover:bg-[var(--color-primary-700)] transition-colors">
                <Plus className="h-4 w-4" />
                Create
              </button>
              <button className="flex items-center rounded-r-[var(--radius-md)] border-l border-[var(--color-primary-700)] bg-[var(--color-primary-500)] px-2 py-2 text-white hover:bg-[var(--color-primary-700)] transition-colors">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-2 px-6 py-3 border-b border-[var(--color-border-1)] shrink-0">
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
              <input
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] pl-8 pr-3 py-1.5 text-[var(--font-size-sm)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary-500)] transition-colors"
              />
            </div>
            {(['State', 'Triggered from', 'Shared', 'Tags'] as const).map((label) => (
              <button
                key={label}
                className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] px-3 py-1.5 text-[var(--font-size-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {label}
                <span className="text-[var(--color-text-tertiary)] text-[var(--font-size-xs)] ml-0.5">All</span>
                <ChevronDown className="h-3 w-3 text-[var(--color-text-tertiary)] ml-0.5" />
              </button>
            ))}
          </div>

          {/* Workflow list */}
          <div className="flex-1 overflow-y-auto">
            {/* Column headers */}
            <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-[var(--color-border-1)] bg-[var(--color-surface-secondary)] px-6 py-2">
              <div className="w-4 shrink-0" />
              <div className="w-4 shrink-0" />
              <div className="flex-1 text-[var(--font-size-xs)] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Name
              </div>
              <div className="w-40 text-[var(--font-size-xs)] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider hidden lg:block">
                Created by
              </div>
              <div className="w-52 text-[var(--font-size-xs)] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider hidden xl:block">
                Last modified by
              </div>
              <div className="w-8 shrink-0" />
            </div>

            {/* Pinned workflows */}
            {PINNED_WORKFLOWS.map((wf) => (
              <WorkflowRow
                key={wf.id}
                wf={wf}
                selected={selectedRows.has(wf.id)}
                onToggle={() => toggleRow(wf.id)}
              />
            ))}

            {/* Grouped rows */}
            {WORKFLOW_GROUPS.filter(
              (g) => !searchVal || g.name.toLowerCase().includes(searchVal.toLowerCase())
            ).map((group) => (
              <WorkflowGroupRow key={group.name} group={group} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Workflow Row ──────────────────────────────────────────────────────────

function WorkflowRow({
  wf,
  selected,
  onToggle,
}: {
  wf: Workflow;
  selected: boolean;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex items-center gap-3 border-b border-[var(--color-border-1)] px-6 py-2.5 transition-colors ${
        selected ? 'bg-[var(--color-primary-50)]' : hovered ? 'bg-[var(--color-surface-tertiary)]' : ''
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`h-4 w-4 shrink-0 rounded-[3px] border transition-colors ${
          selected
            ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]'
            : 'border-[var(--color-border-3)] bg-transparent'
        } flex items-center justify-center`}
      >
        {selected && (
          <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Status dot */}
      <StatusDot status={wf.status} />

      {/* Name */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="truncate text-[var(--font-size-sm)] text-[var(--color-text-primary)]">
          {wf.name}
        </span>
        {wf.pinned && (
          <PinIcon className="h-3 w-3 shrink-0 text-[var(--color-text-tertiary)] rotate-45" />
        )}
      </div>

      {/* Author */}
      <div className="w-40 hidden lg:flex items-center gap-1.5">
        <Avatar initials={wf.authorAvatar} />
        <span className="truncate text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
          {wf.author}
        </span>
      </div>

      {/* Updated by */}
      <div className="w-52 hidden xl:flex items-center gap-1.5">
        <Avatar initials={wf.updatedByAvatar} />
        <div className="min-w-0">
          <p className="truncate text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
            {wf.updatedBy}
          </p>
          <p className="truncate text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">
            {wf.updatedAt}
          </p>
        </div>
      </div>

      {/* More */}
      {hovered && (
        <button className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-primary)] transition-colors">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      )}
      {!hovered && <div className="w-6 h-6 shrink-0" />}
    </div>
  );
}

// ─── Workflow Group Row ────────────────────────────────────────────────────

function WorkflowGroupRow({ group }: { group: WorkflowGroup }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <button
        onClick={() => setExpanded((o) => !o)}
        className="flex w-full items-center gap-3 border-b border-[var(--color-border-1)] px-6 py-2.5 text-left hover:bg-[var(--color-surface-tertiary)] transition-colors"
      >
        <div className="w-4 shrink-0" />
        <ChevronRight
          className={`h-3.5 w-3.5 shrink-0 text-[var(--color-text-tertiary)] transition-transform duration-150 ${
            expanded ? 'rotate-90' : ''
          }`}
        />
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="truncate text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">
            {group.name}
          </span>
          <span className="shrink-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--color-neutral-200)] px-1.5 text-[var(--font-size-xs)] text-[var(--color-text-secondary)] font-medium">
            {group.count}
          </span>
        </div>
      </button>
      {expanded && (
        <div className="border-b border-[var(--color-border-1)] bg-[var(--color-surface-secondary)] px-6 py-4 text-[var(--font-size-sm)] text-[var(--color-text-tertiary)] italic">
          {group.count} workflow{group.count !== 1 ? 's' : ''} in this group
        </div>
      )}
    </>
  );
}
