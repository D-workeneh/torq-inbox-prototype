'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Toggle } from '@/components/ui/Toggle';
import { Checkbox, CheckboxButton } from '@/components/ui/Checkbox';
import {
  Workflow,
  Search as SearchLucide,
  Shield,
  TrendingUp,
  MousePointerClick,
  BookMarked,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Check,
  Inbox as InboxSidebarIcon,
  Search,
  SlidersHorizontal,
  Plus,
  MoreHorizontal,
  Pin as PinIcon,
  // Page content icons
  Plug,
  Variable,
  FileText,
  BookOpen,
  Eye,
  SquareCode,
  Lightbulb,
  LayoutDashboard,
  Table2,
  Bot,
  Target,
  Database,
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  Info as InfoIcon,
  Clock,
  ExternalLink,
  Activity,
  Globe,
  Layers,
  Zap,
  Bell,
  Users,
  UserCog,
  ShieldCheck,
  Download,
  Briefcase,
  Cpu,
  Mail,
  Smartphone,
  Moon,
  Minus,
  X as XIcon,
  UserPlus,
} from 'lucide-react';
import { InboxPanel } from '@/components/InboxPanel';

// ─── Sidebar data ──────────────────────────────────────────────────────────

type NavItem = { label: string; pageId: string };
type NavSection = { title: string; icon: React.ElementType; items: NavItem[]; defaultOpen?: boolean };

type Workspace = { id: string; name: string; color: string; image?: string };

// Gradient avatar SVG for "acme-corp" — simulates a user-uploaded workspace image
const ACME_AVATAR_SRC = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%25' stop-color='%23FF8E2E'/><stop offset='100%25' stop-color='%23FDD711'/></linearGradient></defs><rect width='40' height='40' rx='6' fill='url(%23g)'/><text x='50%25' y='56%25' font-family='system-ui,sans-serif' font-size='15' font-weight='800' fill='white' text-anchor='middle' dominant-baseline='central'>AC</text></svg>`)}`;

const WORKSPACES: Workspace[] = [
  { id: 'torq-dev',     name: 'torq-dev',     color: '#2864FF' },
  { id: 'torq-staging', name: 'torq-staging', color: '#9275FF' },
  { id: 'torq-prod',    name: 'torq-prod',    color: '#EA231A' },
  { id: 'acme-corp',    name: 'acme-corp',    color: '#FF8E2E', image: ACME_AVATAR_SRC },
];

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Build',
    icon: Workflow,
    defaultOpen: true,
    items: [
      { label: 'Workflows',           pageId: 'workflows' },
      { label: 'Integrations',        pageId: 'integrations' },
      { label: 'Workspace Variables', pageId: 'workspace-variables' },
      { label: 'Templates',           pageId: 'templates' },
    ],
  },
  {
    title: 'Investigate',
    icon: Shield,
    defaultOpen: false,
    items: [
      { label: 'Cases',       pageId: 'cases' },
      { label: 'Runbooks',    pageId: 'runbooks' },
      { label: 'Observables', pageId: 'observables' },
      { label: 'Sources',     pageId: 'sources' },
    ],
  },
  {
    title: 'Monitor',
    icon: TrendingUp,
    defaultOpen: false,
    items: [
      { label: 'Activity Log',    pageId: 'activity-log' },
      { label: 'Insights',        pageId: 'insights' },
      { label: 'Case Dashboards', pageId: 'case-dashboards' },
    ],
  },
  {
    title: 'Interact',
    icon: MousePointerClick,
    defaultOpen: false,
    items: [
      { label: 'Interact data picker',    pageId: 'interact-picker' },
      { label: 'Table for interact',      pageId: 'interact-table' },
      { label: 'Snappy bot',              pageId: 'snappy-bot' },
      { label: 'Insights',                pageId: 'interact-insights' },
      { label: 'Indicator Investigation', pageId: 'indicator-investigation' },
      { label: 'Bring me the data',       pageId: 'bring-data' },
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

// ─── Sidebar nav tooltip ───────────────────────────────────────────────────

function SidebarTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  if (!label) return <>{children}</>;
  return (
    <div className="group/stip relative flex items-center w-full justify-center">
      {children}
      <div className="pointer-events-none absolute left-full ml-2.5 z-[9999] opacity-0 group-hover/stip:opacity-100 transition-opacity duration-100 whitespace-nowrap">
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-neutral-800)] px-2 py-1 text-[var(--font-size-xs)] text-white shadow-lg">
          {label}
        </div>
      </div>
    </div>
  );
}

// ─── Workspace Avatar ──────────────────────────────────────────────────────

function WorkspaceAvatar({
  wsId,
  size = 'md',
}: {
  wsId: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const ws = WORKSPACES.find((w) => w.id === wsId) ?? WORKSPACES[0];
  const sz =
    size === 'sm' ? 'h-5 w-5 text-[9px]' :
    size === 'lg' ? 'h-8 w-8 text-sm' :
    'h-6 w-6 text-[10px]';

  if (ws.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={ws.image}
        alt={ws.name}
        className={`${sz} shrink-0 rounded-[var(--radius-sm)] object-cover`}
      />
    );
  }
  return (
    <div
      className={`${sz} shrink-0 flex items-center justify-center rounded-[var(--radius-sm)] font-bold text-white select-none`}
      style={{ backgroundColor: ws.color }}
    >
      {ws.name[0].toUpperCase()}
    </div>
  );
}

// ─── Workspace Picker (portal) ─────────────────────────────────────────────

function WorkspacePicker({
  current,
  onSelect,
  onClose,
  anchorRef,
}: {
  current: string;
  onSelect: (w: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left });
    }
  }, [anchorRef]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        ref.current?.contains(e.target as Node) ||
        anchorRef.current?.contains(e.target as Node)
      ) return;
      onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, anchorRef]);

  if (!pos) return null;

  return createPortal(
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.14 }}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
      className="w-60 rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] shadow-xl py-1"
    >
      <p className="px-3 py-1.5 text-[var(--font-size-xs)] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
        Switch workspace
      </p>
      {WORKSPACES.map((ws) => {
        const isActive = ws.id === current;
        return (
          <button
            key={ws.id}
            onClick={() => { onSelect(ws.id); onClose(); }}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-[var(--font-size-sm)] transition-colors ${
              isActive
                ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-500)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <WorkspaceAvatar wsId={ws.id} size="sm" />
            <span className="flex-1 truncate text-left">{ws.name}</span>
            {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary-500)]" />}
          </button>
        );
      })}
    </motion.div>,
    document.body
  );
}

// ─── Sidebar Section ───────────────────────────────────────────────────────

function SidebarSection({
  section,
  defaultOpen,
  collapsed,
  currentPage,
  onNavigate,
}: {
  section: NavSection;
  defaultOpen: boolean;
  collapsed: boolean;
  currentPage: string;
  onNavigate: (pageId: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const SectionIcon = section.icon;
  const hasActive = section.items.some((i) => i.pageId === currentPage);

  if (collapsed) {
    return (
      <SidebarTooltip label={section.title}>
        <div className={`flex items-center justify-center rounded-[var(--radius-md)] w-8 h-8 transition-colors ${
          hasActive
            ? 'bg-[var(--color-neutral-150)] text-[var(--color-text-primary)]'
            : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'
        }`}>
          <SectionIcon className="h-4 w-4 shrink-0" />
        </div>
      </SidebarTooltip>
    );
  }

  return (
    <div>
      {/* Section header row: icon + title + chevron */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-3 py-2 text-[var(--font-size-sm)] font-bold text-[var(--color-text-primary)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <SectionIcon className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" />
        <span className="flex-1 text-left">{section.title}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-[var(--color-text-tertiary)] transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
      </button>

      {/* Sub-items: text-only labels, indented under a left border line */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="ml-[2.1rem] mb-1.5 border-l border-[var(--color-border-2)] pl-3 flex flex-col gap-0.5">
              {section.items.map((item) => {
                const isActive = item.pageId === currentPage;
                return (
                  <button
                    key={item.pageId}
                    onClick={() => onNavigate(item.pageId)}
                    className={`block w-full text-left rounded-[var(--radius-sm)] px-2 py-1.5 text-[var(--font-size-sm)] transition-colors ${
                      isActive
                        ? 'text-[var(--color-text-primary)] font-medium bg-[var(--color-neutral-150)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Placeholder page shared primitives ────────────────────────────────────

function PageShell({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-2)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-neutral-100)]">
            <Icon className="h-4 w-4 text-[var(--color-text-secondary)]" />
          </div>
          <div>
            <h1 className="text-[var(--font-size-2xl)] font-semibold text-[var(--color-text-primary)] leading-none">{title}</h1>
            {subtitle && <p className="text-[var(--font-size-sm)] text-[var(--color-text-tertiary)] mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

type SectionBadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'yellow';
const SECTION_BADGE_COLOR: Record<SectionBadgeVariant, 'neutral' | 'success' | 'warning' | 'error' | 'primary' | 'yellow'> = {
  default: 'neutral', success: 'success', warning: 'warning', error: 'error', info: 'primary', yellow: 'yellow',
};

function SectionBadge({ label, variant = 'default' }: { label: string; variant?: SectionBadgeVariant }) {
  return <Tag color={SECTION_BADGE_COLOR[variant]} appearance="subtle" size="md">{label}</Tag>;
}

// ─── Integrations page ─────────────────────────────────────────────────────

const INTEGRATIONS = [
  { name: 'Jira',        desc: 'Issue tracking and project management',  color: '#0052CC', connected: true  },
  { name: 'Okta',        desc: 'Identity and access management',         color: '#007DC1', connected: true  },
  { name: 'GitHub',      desc: 'Source code management',                 color: '#24292E', connected: true  },
  { name: 'AWS',         desc: 'Cloud infrastructure & services',        color: '#FF9900', connected: true  },
  { name: 'CrowdStrike', desc: 'Endpoint detection & response',          color: '#E32227', connected: true  },
  { name: 'Slack',       desc: 'Team messaging and notifications',       color: '#4A154B', connected: true  },
  { name: 'PagerDuty',   desc: 'Incident management & alerting',         color: '#06AC38', connected: true  },
  { name: 'ServiceNow',  desc: 'IT service management',                  color: '#62D84E', connected: false },
  { name: 'Splunk',      desc: 'SIEM and data analytics',                color: '#65A637', connected: false },
  { name: 'Datadog',     desc: 'Infrastructure monitoring',              color: '#632CA6', connected: false },
  { name: 'Sentinel',    desc: 'Cloud-native SIEM',                      color: '#0078D4', connected: false },
  { name: 'SentinelOne', desc: 'Autonomous endpoint security',           color: '#6C3BD5', connected: false },
];

function IntegrationsPage() {
  return (
    <PageShell title="Integrations" subtitle="Connect your tools and services" icon={Plug}
      action={
        <Button variant="dark" leftIcon={<Plus />}>Browse catalog</Button>
      }
    >
      <div className="p-6">
        <h2 className="text-[var(--font-size-xs)] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-3">Connected ({INTEGRATIONS.filter(i=>i.connected).length})</h2>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 mb-8">
          {INTEGRATIONS.filter(i => i.connected).map((int) => (
            <div key={int.name} className="group flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border-1)] bg-[var(--color-surface-primary)] p-4 hover:border-[var(--color-border-2)] hover:shadow-sm transition-all cursor-pointer">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[13px] font-bold text-white" style={{ backgroundColor: int.color }}>
                {int.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)]">{int.name}</p>
                <p className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)] truncate">{int.desc}</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          ))}
        </div>
        <h2 className="text-[var(--font-size-xs)] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-3">Available</h2>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
          {INTEGRATIONS.filter(i => !i.connected).map((int) => (
            <div key={int.name} className="group flex items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-2)] bg-[var(--color-surface-secondary)] p-4 hover:bg-[var(--color-surface-primary)] hover:border-[var(--color-border-2)] transition-all cursor-pointer">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[13px] font-bold text-white opacity-60" style={{ backgroundColor: int.color }}>
                {int.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-secondary)]">{int.name}</p>
                <p className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)] truncate">{int.desc}</p>
              </div>
              <Plus className="h-3.5 w-3.5 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

// ─── Cases page ───────────────────────────────────────────────────────────

const CASES_DATA = [
  { id: 'CASE-1001', title: 'Ransomware investigation on WIN-SERVER-01', severity: 'Critical', status: 'Open',        assignee: 'Sarah Chen',     date: 'Apr 14, 2026' },
  { id: 'CASE-1002', title: 'Unauthorized access from TOR exit node',    severity: 'High',     status: 'In Progress',  assignee: 'John Davis',     date: 'Apr 14, 2026' },
  { id: 'CASE-1003', title: 'Phishing email campaign targeting finance',  severity: 'High',     status: 'Under Review', assignee: 'Alex Kim',       date: 'Apr 13, 2026' },
  { id: 'CASE-1004', title: 'Suspicious API activity — rate spike',       severity: 'Medium',   status: 'Open',         assignee: 'Sarah Chen',     date: 'Apr 13, 2026' },
  { id: 'CASE-1005', title: 'Data exfiltration attempt via S3',           severity: 'Critical', status: 'Escalated',    assignee: 'Michael Torres', date: 'Apr 12, 2026' },
  { id: 'CASE-1006', title: 'OAuth token leaked in GitHub commit',        severity: 'High',     status: 'Resolved',     assignee: 'Alex Kim',       date: 'Apr 11, 2026' },
  { id: 'CASE-1007', title: 'SSL certificate tampering detected',         severity: 'Medium',   status: 'Resolved',     assignee: 'John Davis',     date: 'Apr 10, 2026' },
];

// Critical=Red  High=Orange  Medium=Yellow  Low=Grey  (matches Tag color tokens)
const CASE_SEVERITY_TAG: Record<string, {
  color: 'critical' | 'warning' | 'yellow' | 'neutral';
  Icon: React.ElementType;
}> = {
  Critical: { color: 'critical', Icon: AlertOctagon },
  High:     { color: 'warning',  Icon: AlertTriangle },
  Medium:   { color: 'yellow',   Icon: AlertCircle },
  Low:      { color: 'neutral',  Icon: InfoIcon },
};
const CASE_STATUS_STYLE: Record<string, string> = {
  Open: 'error', 'In Progress': 'info', 'Under Review': 'warning', Escalated: 'error', Resolved: 'success',
};

function CasesPage() {
  return (
    <PageShell title="Cases" subtitle={`${CASES_DATA.filter(c => c.status !== 'Resolved').length} open cases`} icon={Shield}
      action={
        <Button variant="dark" leftIcon={<Plus />}>New Case</Button>
      }
    >
      <div className="px-6 py-3 flex items-center gap-2 border-b border-[var(--color-border-1)]">
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
          <input placeholder="Search cases…" className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] pl-8 pr-3 py-1.5 text-[var(--font-size-sm)] outline-none focus:border-[var(--color-primary-500)] transition-colors" />
        </div>
        {['Severity', 'Status', 'Assignee'].map(f => (
          <button key={f} className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border-2)] px-3 py-1.5 text-[var(--font-size-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] transition-colors">
            {f}<ChevronDown className="h-3 w-3 ml-0.5 text-[var(--color-text-tertiary)]" />
          </button>
        ))}
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--color-border-1)] bg-[var(--color-surface-secondary)]">
            {['ID', 'Title', 'Severity', 'Status', 'Assignee', 'Date'].map(h => (
              <th key={h} className="px-4 py-2.5 text-left text-[var(--font-size-xs)] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CASES_DATA.map((c) => (
            <tr key={c.id} className="border-b border-[var(--color-border-1)] hover:bg-[var(--color-surface-tertiary)] transition-colors cursor-pointer">
              <td className="px-4 py-3 text-[var(--font-size-sm)] text-[var(--color-text-tertiary)] font-mono">{c.id}</td>
              <td className="px-4 py-3 text-[var(--font-size-sm)] text-[var(--color-text-primary)] font-medium max-w-xs truncate">{c.title}</td>
              <td className="px-4 py-3">
                {(() => { const s = CASE_SEVERITY_TAG[c.severity]; return s ? <Tag color={s.color} appearance="bordered" size="md" icon={<s.Icon />}>{c.severity}</Tag> : <SectionBadge label={c.severity} />; })()}
              </td>
              <td className="px-4 py-3"><SectionBadge label={c.status} variant={CASE_STATUS_STYLE[c.status] as never} /></td>
              <td className="px-4 py-3 text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">{c.assignee}</td>
              <td className="px-4 py-3 text-[var(--font-size-sm)] text-[var(--color-text-tertiary)]">{c.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageShell>
  );
}

// ─── Workspace Variables page ──────────────────────────────────────────────

const WS_VARS = [
  { name: 'API_BASE_URL',         value: 'https://api.company.com',  scope: 'Global',    modified: 'Apr 10, 2026', secret: false },
  { name: 'JIRA_PROJECT_KEY',     value: 'SEC',                      scope: 'Workspace', modified: 'Apr 8, 2026',  secret: false },
  { name: 'SLACK_WEBHOOK_URL',    value: '••••••••••••',             scope: 'Workspace', modified: 'Mar 15, 2026', secret: true  },
  { name: 'CROWDSTRIKE_CLIENT_ID',value: '••••••••••••',             scope: 'Global',    modified: 'Feb 28, 2026', secret: true  },
  { name: 'OKTA_DOMAIN',          value: 'company.okta.com',         scope: 'Workspace', modified: 'Feb 10, 2026', secret: false },
  { name: 'MAX_RETRY_COUNT',      value: '3',                        scope: 'Global',    modified: 'Jan 22, 2026', secret: false },
];

function WorkspaceVariablesPage() {
  return (
    <PageShell title="Workspace Variables" subtitle="Reusable values shared across workflows" icon={Variable}
      action={
        <Button variant="dark" leftIcon={<Plus />}>New Variable</Button>
      }
    >
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--color-border-1)] bg-[var(--color-surface-secondary)]">
            {['Name', 'Value', 'Scope', 'Last Modified'].map(h => (
              <th key={h} className="px-6 py-2.5 text-left text-[var(--font-size-xs)] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {WS_VARS.map((v) => (
            <tr key={v.name} className="border-b border-[var(--color-border-1)] hover:bg-[var(--color-surface-tertiary)] transition-colors cursor-pointer">
              <td className="px-6 py-3 text-[var(--font-size-sm)] font-mono text-[var(--color-text-primary)]">{v.name}</td>
              <td className="px-6 py-3 text-[var(--font-size-sm)] font-mono text-[var(--color-text-secondary)]">{v.value}</td>
              <td className="px-6 py-3"><SectionBadge label={v.scope} variant={v.scope === 'Global' ? 'info' : 'default'} /></td>
              <td className="px-6 py-3 text-[var(--font-size-sm)] text-[var(--color-text-tertiary)]">{v.modified}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageShell>
  );
}

// ─── Templates page ───────────────────────────────────────────────────────

const TEMPLATES_DATA = [
  { name: 'Phishing Response',      desc: 'End-to-end email phishing investigation and remediation',  icon: AlertTriangle, color: '#FF8E2E', uses: 34 },
  { name: 'Endpoint Compromise',    desc: 'EDR-driven endpoint isolation and forensic collection',   icon: Shield,        color: '#EA231A', uses: 28 },
  { name: 'Cloud Security',         desc: 'AWS/GCP misconfiguration detection and auto-remediation', icon: Globe,         color: '#2864FF', uses: 19 },
  { name: 'Insider Threat',         desc: 'User behavior anomaly investigation workflow',            icon: Eye,           color: '#9275FF', uses: 15 },
  { name: 'Ransomware Response',    desc: 'Rapid containment and recovery incident playbook',        icon: Database,      color: '#EA231A', uses: 11 },
  { name: 'Threat Intel Enrichment',desc: 'Automated IOC lookup and threat intelligence enrichment', icon: Target,        color: '#29CA88', uses: 42 },
];

function TemplatesPage() {
  return (
    <PageShell title="Templates" subtitle="Ready-made workflow templates for common security scenarios" icon={FileText}
      action={
        <Button variant="dark" leftIcon={<Plus />}>New Template</Button>
      }
    >
      <div className="p-6 grid grid-cols-2 xl:grid-cols-3 gap-4">
        {TEMPLATES_DATA.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.name} className="group flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border-1)] bg-[var(--color-surface-primary)] p-5 hover:border-[var(--color-border-2)] hover:shadow-sm transition-all cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]" style={{ backgroundColor: `${t.color}18` }}>
                <Icon className="h-5 w-5" style={{ color: t.color }} />
              </div>
              <div>
                <p className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)] mb-1">{t.name}</p>
                <p className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)] leading-relaxed">{t.desc}</p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--color-border-1)]">
                <span className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">{t.uses} uses</span>
                <button className="text-[var(--font-size-xs)] font-medium text-[var(--color-primary-500)] opacity-0 group-hover:opacity-100 transition-opacity">Use template →</button>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}

// ─── Runbooks page ────────────────────────────────────────────────────────

const RUNBOOKS_DATA = [
  { name: 'Auto-Triage',             status: 'Active',   steps: 12, lastRun: '5 min ago',   trigger: 'Scheduled'  },
  { name: 'Threat Intel Enrichment', status: 'Active',   steps: 8,  lastRun: '1h ago',      trigger: 'On-demand'  },
  { name: 'Case Creation',           status: 'Active',   steps: 5,  lastRun: '3h ago',      trigger: 'Webhook'    },
  { name: 'Escalation Handler',      status: 'Inactive', steps: 7,  lastRun: 'Yesterday',   trigger: 'Scheduled'  },
  { name: 'Alert Deduplication',     status: 'Active',   steps: 4,  lastRun: '30 min ago',  trigger: 'Real-time'  },
  { name: 'Compliance Report',       status: 'Active',   steps: 15, lastRun: '2 days ago',  trigger: 'Scheduled'  },
];

function RunbooksPage() {
  return (
    <PageShell title="Runbooks" subtitle="Automated investigation and response playbooks" icon={BookOpen}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--color-border-1)] bg-[var(--color-surface-secondary)]">
            {['Name', 'Status', 'Steps', 'Last Run', 'Trigger'].map(h => (
              <th key={h} className="px-6 py-2.5 text-left text-[var(--font-size-xs)] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RUNBOOKS_DATA.map((r) => (
            <tr key={r.name} className="border-b border-[var(--color-border-1)] hover:bg-[var(--color-surface-tertiary)] transition-colors cursor-pointer">
              <td className="px-6 py-3 text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">{r.name}</td>
              <td className="px-6 py-3"><SectionBadge label={r.status} variant={r.status === 'Active' ? 'success' : 'default'} /></td>
              <td className="px-6 py-3 text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">{r.steps} steps</td>
              <td className="px-6 py-3 text-[var(--font-size-sm)] text-[var(--color-text-tertiary)]">{r.lastRun}</td>
              <td className="px-6 py-3"><SectionBadge label={r.trigger} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageShell>
  );
}

// ─── Observables page ─────────────────────────────────────────────────────

const OBSERVABLES_DATA = [
  { type: 'IP',       value: '185.220.101.8',         source: 'Okta',        firstSeen: 'Apr 13, 2026', lastSeen: 'Apr 14, 2026' },
  { type: 'Domain',   value: 'malicious-domain.xyz',  source: 'CrowdStrike', firstSeen: 'Apr 12, 2026', lastSeen: 'Apr 14, 2026' },
  { type: 'Hash',     value: 'abc123def456...',        source: 'GitHub',      firstSeen: 'Apr 13, 2026', lastSeen: 'Apr 13, 2026' },
  { type: 'Email',    value: 'phishing@threat.io',    source: 'Gmail',       firstSeen: 'Apr 11, 2026', lastSeen: 'Apr 12, 2026' },
  { type: 'URL',      value: 'https://evil-c2.io/go', source: 'Splunk',      firstSeen: 'Apr 10, 2026', lastSeen: 'Apr 11, 2026' },
  { type: 'IP',       value: '192.168.99.254',        source: 'AWS',         firstSeen: 'Apr 9, 2026',  lastSeen: 'Apr 10, 2026' },
];

function ObservablesPage() {
  return (
    <PageShell title="Observables" subtitle="Indicators of compromise and threat artifacts" icon={Eye}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--color-border-1)] bg-[var(--color-surface-secondary)]">
            {['Type', 'Value', 'Source', 'First Seen', 'Last Seen'].map(h => (
              <th key={h} className="px-6 py-2.5 text-left text-[var(--font-size-xs)] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {OBSERVABLES_DATA.map((o, i) => (
            <tr key={i} className="border-b border-[var(--color-border-1)] hover:bg-[var(--color-surface-tertiary)] transition-colors cursor-pointer">
              <td className="px-6 py-3"><SectionBadge label={o.type} variant="info" /></td>
              <td className="px-6 py-3 text-[var(--font-size-sm)] font-mono text-[var(--color-text-primary)]">{o.value}</td>
              <td className="px-6 py-3 text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">{o.source}</td>
              <td className="px-6 py-3 text-[var(--font-size-sm)] text-[var(--color-text-tertiary)]">{o.firstSeen}</td>
              <td className="px-6 py-3 text-[var(--font-size-sm)] text-[var(--color-text-tertiary)]">{o.lastSeen}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageShell>
  );
}

// ─── Sources page ─────────────────────────────────────────────────────────

const SOURCES_DATA = [
  { name: 'CrowdStrike Falcon',  type: 'EDR',       events: '12.4K/day', status: 'Active', color: '#E32227' },
  { name: 'Okta Identity Engine',type: 'IAM',       events: '8.1K/day',  status: 'Active', color: '#007DC1' },
  { name: 'AWS CloudTrail',      type: 'Cloud',     events: '34K/day',   status: 'Active', color: '#FF9900' },
  { name: 'GitHub Enterprise',   type: 'SCM',       events: '2.3K/day',  status: 'Active', color: '#24292E' },
  { name: 'Jira Service Desk',   type: 'ITSM',      events: '540/day',   status: 'Active', color: '#0052CC' },
  { name: 'Datadog APM',         type: 'Monitoring',events: '0/day',     status: 'Paused', color: '#632CA6' },
];

function SourcesPage() {
  return (
    <PageShell title="Sources" subtitle="Connected data ingestion sources" icon={SquareCode}>
      <div className="p-6 grid grid-cols-2 xl:grid-cols-3 gap-4">
        {SOURCES_DATA.map((s) => (
          <div key={s.name} className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border-1)] bg-[var(--color-surface-primary)] p-5 hover:border-[var(--color-border-2)] transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[13px] font-bold text-white" style={{ backgroundColor: s.color }}>
                {s.name[0]}
              </div>
              <SectionBadge label={s.status} variant={s.status === 'Active' ? 'success' : 'default'} />
            </div>
            <div>
              <p className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)]">{s.name}</p>
              <p className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)] mt-0.5">{s.type}</p>
            </div>
            <div className="flex items-center gap-1.5 pt-2 border-t border-[var(--color-border-1)]">
              <Activity className="h-3 w-3 text-[var(--color-text-tertiary)]" />
              <span className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">{s.events}</span>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

// ─── Activity Log page ────────────────────────────────────────────────────

const ACTIVITY_DATA = [
  { time: '14:23', date: 'Apr 14', user: 'david.w',  action: 'Created workflow',  object: 'Auto-Triage v2',     type: 'create' },
  { time: '13:45', date: 'Apr 14', user: 'sarah.c',  action: 'Resolved case',     object: 'CASE-1001',          type: 'success' },
  { time: '12:30', date: 'Apr 14', user: 'System',   action: 'Triggered runbook', object: 'Auto-Triage',        type: 'info'    },
  { time: '11:15', date: 'Apr 14', user: 'alex.k',   action: 'Updated template',  object: 'Phishing Response',  type: 'edit'    },
  { time: '10:02', date: 'Apr 14', user: 'System',   action: 'Alert ingested',    object: '23 new alerts',      type: 'info'    },
  { time: '09:44', date: 'Apr 14', user: 'john.d',   action: 'Escalated case',    object: 'CASE-1002',          type: 'warning' },
  { time: '09:12', date: 'Apr 14', user: 'david.w',  action: 'Added integration', object: 'PagerDuty',          type: 'create'  },
  { time: '18:30', date: 'Apr 13', user: 'sarah.c',  action: 'Created case',      object: 'CASE-1003',          type: 'create'  },
  { time: '15:10', date: 'Apr 13', user: 'System',   action: 'Certificate expiry warning', object: 'api.company.com', type: 'warning' },
];

const ACTIVITY_COLORS: Record<string, string> = {
  create: 'bg-[var(--color-primary-500)]',
  success: 'bg-[#29CA88]',
  info: 'bg-[var(--color-neutral-300)]',
  edit: 'bg-[#9275FF]',
  warning: 'bg-[#FF8E2E]',
  error: 'bg-[#EA231A]',
};

function ActivityLogPage() {
  return (
    <PageShell title="Activity Log" subtitle="All workspace activity in chronological order" icon={Activity}>
      <div className="px-6 py-4 space-y-0">
        {ACTIVITY_DATA.map((a, i) => (
          <div key={i} className="flex items-start gap-4 py-3 border-b border-[var(--color-border-1)] last:border-b-0 hover:bg-[var(--color-surface-tertiary)] -mx-6 px-6 transition-colors">
            <div className="flex flex-col items-center gap-1 shrink-0 w-12 text-right">
              <span className="text-[var(--font-size-xs)] font-mono text-[var(--color-text-tertiary)]">{a.time}</span>
              <span className="text-[9px] text-[var(--color-text-tertiary)] opacity-70">{a.date}</span>
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <div className={`h-2 w-2 rounded-full shrink-0 ${ACTIVITY_COLORS[a.type]}`} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">{a.user}</span>
              <span className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]"> {a.action} </span>
              <span className="text-[var(--font-size-sm)] font-medium text-[var(--color-primary-500)]">{a.object}</span>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

// ─── Insights page ────────────────────────────────────────────────────────

function InsightsPage() {
  const metrics = [
    { label: 'Total Workflows',     value: '142',  change: '+12',  positive: true,  icon: Workflow    },
    { label: 'Active Workflows',    value: '89',   change: '+5',   positive: true,  icon: Zap         },
    { label: 'Alerts Today',        value: '23',   change: '-8',   positive: true,  icon: AlertTriangle },
    { label: 'Cases Open',          value: '12',   change: '+3',   positive: false, icon: Shield      },
    { label: 'Mean Time to Resolve',value: '4.2h', change: '-1.1h',positive: true,  icon: Clock       },
    { label: 'Integrations',        value: '7',    change: '+1',   positive: true,  icon: Plug        },
  ];
  return (
    <PageShell title="Insights" subtitle="Operational metrics for your workspace" icon={Lightbulb}>
      <div className="p-6">
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="rounded-[var(--radius-lg)] border border-[var(--color-border-1)] bg-[var(--color-surface-primary)] p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[var(--font-size-xs)] font-medium text-[var(--color-text-tertiary)]">{m.label}</span>
                  <Icon className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                </div>
                <p className="text-[var(--font-size-3xl)] font-bold text-[var(--color-text-primary)]">{m.value}</p>
                <p className={`text-[var(--font-size-xs)] mt-1 ${m.positive ? 'text-[#29CA88]' : 'text-[#EA231A]'}`}>
                  {m.change} from last week
                </p>
              </div>
            );
          })}
        </div>
        {/* Sparkline placeholders */}
        <h2 className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)] mb-3">Alert volume (last 7 days)</h2>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-1)] bg-[var(--color-surface-secondary)] h-32 flex items-end gap-1.5 px-4 pb-4">
          {[40, 65, 30, 80, 55, 90, 23].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm bg-[var(--color-primary-300)] opacity-70 transition-all hover:opacity-100 hover:bg-[var(--color-primary-500)]" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}

// ─── Case Dashboards page ─────────────────────────────────────────────────

function CaseDashboardsPage() {
  const dashboards = [
    { name: 'Security Overview',    desc: 'High-level view of all security events and cases',     color: '#2864FF' },
    { name: 'Incident Response',    desc: 'Real-time incident tracking and response metrics',    color: '#EA231A' },
    { name: 'Threat Intelligence',  desc: 'IOC trends, threat actor activity, and TTPs',         color: '#9275FF' },
    { name: 'Compliance',           desc: 'SOC 2, ISO 27001, and regulatory compliance status',  color: '#29CA88' },
  ];
  return (
    <PageShell title="Case Dashboards" subtitle="Custom dashboards for security operations" icon={LayoutDashboard}
      action={
        <Button variant="dark" leftIcon={<Plus />}>New Dashboard</Button>
      }
    >
      <div className="p-6 grid grid-cols-2 gap-4">
        {dashboards.map((d) => (
          <div key={d.name} className="group rounded-[var(--radius-xl)] border border-[var(--color-border-1)] bg-[var(--color-surface-primary)] overflow-hidden hover:shadow-md transition-all cursor-pointer">
            <div className="h-24 opacity-[0.08]" style={{ background: `linear-gradient(135deg, ${d.color} 0%, transparent 100%)`, backgroundColor: d.color }} />
            <div className="p-5 -mt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-white text-xs font-bold mb-3 shadow-sm" style={{ backgroundColor: d.color }}>
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <p className="text-[var(--font-size-md)] font-semibold text-[var(--color-text-primary)]">{d.name}</p>
              <p className="text-[var(--font-size-sm)] text-[var(--color-text-tertiary)] mt-1">{d.desc}</p>
              <button className="mt-4 text-[var(--font-size-xs)] font-medium text-[var(--color-primary-500)] opacity-0 group-hover:opacity-100 transition-opacity">
                Open dashboard →
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

// ─── Generic "coming soon" page ────────────────────────────────────────────

function ComingSoonPage({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-neutral-100)]">
          <Icon className="h-8 w-8 text-[var(--color-text-tertiary)]" />
        </div>
        <div>
          <h2 className="text-[var(--font-size-xl)] font-semibold text-[var(--color-text-primary)]">{title}</h2>
          <p className="text-[var(--font-size-sm)] text-[var(--color-text-tertiary)] mt-2">
            This feature is coming soon. Stay tuned for updates.
          </p>
        </div>
        <span className="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-1 text-[var(--font-size-xs)] font-medium text-[var(--color-primary-500)]">
          Coming soon
        </span>
      </div>
    </div>
  );
}

// ─── Settings Page ─────────────────────────────────────────────────────────

type SettingsSection = 'general' | 'members' | 'groups' | 'security-sso' | 'security-roles' | 'security-advanced' | 'security-ip' | 'log-export' | 'cases' | 'socrates-tools' | 'notifications';

const SETTINGS_NAV: { id: SettingsSection; label: string; icon: React.ElementType; sub?: { id: SettingsSection; label: string }[] }[] = [
  { id: 'general',        label: 'General',       icon: SettingsIcon },
  { id: 'members',        label: 'Members',        icon: Users },
  { id: 'groups',         label: 'Groups',         icon: UserCog },
  { id: 'security-sso',   label: 'Security',       icon: ShieldCheck, sub: [
    { id: 'security-sso',      label: 'SSO' },
    { id: 'security-roles',    label: 'Roles' },
    { id: 'security-advanced', label: 'Advanced' },
    { id: 'security-ip',       label: 'Workspace IP' },
  ]},
  { id: 'log-export',     label: 'Log export',     icon: Download },
  { id: 'cases',          label: 'Cases',          icon: Briefcase },
  { id: 'socrates-tools', label: 'Socrates Tools', icon: Cpu },
  { id: 'notifications',  label: 'Notifications',  icon: Bell },
];

// ── Notification Settings (MVP — matches notification-center Figma) ───────

type ChannelKey = 'inapp' | 'email';

/** Leaf notification topic ids grouped under expandable categories */
type NotifTopicId =
  | 'plat-maintenance'
  | 'plat-product'
  | 'soc-queue'
  | 'soc-escalation'
  | 'auto-failed'
  | 'auto-runner'
  | 'auto-template'
  | 'auto-success'
  | 'soc-ai-approval'
  | 'soc-ai-task'
  | 'soc-ai-confidence';

type NotifChannelState = Record<NotifTopicId, Record<ChannelKey, boolean>>;

type NotifChannelItem = {
  id: NotifTopicId;
  label: string;
  description?: string;
  /** When true, channel is fixed (e.g. always on in-app only per policy) */
  disableInApp?: boolean;
  disableEmail?: boolean;
};

const NOTIFICATION_MVP_GROUPS: { id: string; label: string; items: NotifChannelItem[] }[] = [
  {
    id: 'platform',
    label: 'Platform',
    items: [
      { id: 'plat-maintenance', label: 'Scheduled maintenance', description: 'Advance notice for planned downtime and upgrades.' },
      { id: 'plat-product', label: 'Product announcements', description: 'New features and important product updates.' },
    ],
  },
  {
    id: 'hypersoc',
    label: 'HyperSOC',
    items: [
      { id: 'soc-queue', label: 'Queue assignments', description: 'When a case or queue item is assigned to you.' },
      { id: 'soc-escalation', label: 'Escalations', description: 'When an incident is escalated or severity changes.' },
    ],
  },
  {
    id: 'hyperautomation',
    label: 'Hyperautomation',
    items: [
      { id: 'auto-failed', label: 'Failed executions', description: 'Workflow runs that failed to complete.', disableInApp: true, disableEmail: true },
      { id: 'auto-runner', label: 'Runner health', description: 'Alerts when a runner goes offline or degrades.', disableInApp: true, disableEmail: true },
      { id: 'auto-template', label: 'Template updates', description: 'When a shared template you use is updated.' },
      { id: 'auto-success', label: 'Successful completions', description: 'When long-running workflows finish successfully.' },
    ],
  },
  {
    id: 'socrates',
    label: 'Socrates AI',
    items: [
      { id: 'soc-ai-approval', label: 'Approval requests', description: 'When Socrates needs your sign-off on an action.' },
      { id: 'soc-ai-task', label: 'Task completions', description: 'When an automated Socrates task finishes.' },
      { id: 'soc-ai-confidence', label: 'Confidence alerts', description: 'When confidence drops below your threshold.' },
    ],
  },
];

const ALL_NOTIF_TOPIC_IDS: NotifTopicId[] = NOTIFICATION_MVP_GROUPS.flatMap((g) => g.items.map((i) => i.id));

function buildDefaultNotifChannels(): NotifChannelState {
  const state = {} as Partial<NotifChannelState>;
  NOTIFICATION_MVP_GROUPS.forEach((g) =>
    g.items.forEach((item) => {
      const emailOn = !item.disableEmail && (item.id.startsWith('plat') || item.id === 'soc-ai-approval' || item.id === 'soc-queue');
      const inappOn = !item.disableInApp;
      state[item.id] = { inapp: inappOn, email: emailOn };
    }),
  );
  return state as NotifChannelState;
}

function NotificationSettingsContent() {
  const THROTTLE_OPTIONS = ['5 min', '10 min', '15 min', '30 min', '60 min'] as const;

  const [criticalBypass, setCriticalBypass] = useState(true);
  const [throttleInterval, setThrottleInterval] = useState<(typeof THROTTLE_OPTIONS)[number]>('10 min');
  const [channels, setChannels] = useState<NotifChannelState>(() => buildDefaultNotifChannels());
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NOTIFICATION_MVP_GROUPS.forEach((g) => {
      init[g.id] = false;
    });
    return init;
  });

  const selectCls =
    'rounded-[var(--radius-sm)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-neutral-800)] min-w-[120px]';

  function itemMeta(id: NotifTopicId) {
    for (const g of NOTIFICATION_MVP_GROUPS) {
      const it = g.items.find((x) => x.id === id);
      if (it) return it;
    }
    return undefined;
  }

  function toggleChannel(topic: NotifTopicId, ch: ChannelKey) {
    const meta = itemMeta(topic);
    if (ch === 'inapp' && meta?.disableInApp) return;
    if (ch === 'email' && meta?.disableEmail) return;
    setChannels((prev) => ({ ...prev, [topic]: { ...prev[topic], [ch]: !prev[topic][ch] } }));
  }

  function toggleGroupExpanded(groupId: string) {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  }

  function leafStatesForChannel(ch: ChannelKey) {
    return ALL_NOTIF_TOPIC_IDS.map((id) => {
      const m = itemMeta(id);
      if (ch === 'inapp' && m?.disableInApp) return null;
      if (ch === 'email' && m?.disableEmail) return null;
      return channels[id][ch];
    }).filter((v): v is boolean => v !== null);
  }

  function allLeafOn(ch: ChannelKey) {
    const s = leafStatesForChannel(ch);
    return s.length > 0 && s.every(Boolean);
  }

  function someLeafOn(ch: ChannelKey) {
    const s = leafStatesForChannel(ch);
    return s.some(Boolean);
  }

  function setAllLeafChannel(ch: ChannelKey, value: boolean) {
    setChannels((prev) => {
      const next = { ...prev };
      ALL_NOTIF_TOPIC_IDS.forEach((id) => {
        const m = itemMeta(id);
        if (ch === 'inapp' && m?.disableInApp) return;
        if (ch === 'email' && m?.disableEmail) return;
        next[id] = { ...next[id], [ch]: value };
      });
      return next;
    });
  }

  function setGroupLeafChannel(groupId: string, ch: ChannelKey, value: boolean) {
    const grp = NOTIFICATION_MVP_GROUPS.find((g) => g.id === groupId);
    if (!grp) return;
    setChannels((prev) => {
      const next = { ...prev };
      grp.items.forEach((item) => {
        if (ch === 'inapp' && item.disableInApp) return;
        if (ch === 'email' && item.disableEmail) return;
        next[item.id] = { ...next[item.id], [ch]: value };
      });
      return next;
    });
  }

  function groupLeafStates(groupId: string, ch: ChannelKey) {
    const grp = NOTIFICATION_MVP_GROUPS.find((g) => g.id === groupId);
    if (!grp) return [];
    return grp.items
      .map((item) => {
        if (ch === 'inapp' && item.disableInApp) return null;
        if (ch === 'email' && item.disableEmail) return null;
        return channels[item.id][ch];
      })
      .filter((v): v is boolean => v !== null);
  }

  function groupAllOn(groupId: string, ch: ChannelKey) {
    const s = groupLeafStates(groupId, ch);
    if (s.length === 0) return false;
    return s.every(Boolean);
  }

  function groupSomeOn(groupId: string, ch: ChannelKey) {
    return groupLeafStates(groupId, ch).some(Boolean);
  }

  function restoreDefaults() {
    setCriticalBypass(true);
    setThrottleInterval('10 min');
    setChannels(buildDefaultNotifChannels());
  }

  return (
    <div className="space-y-8 w-full">
      <section>
        <p className="text-[var(--font-size-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)] mb-2">
          Noise control
        </p>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] divide-y divide-[var(--color-border-1)] overflow-hidden">
          <div className="flex items-start justify-between gap-6 px-4 py-4">
            <div className="min-w-0">
              <p className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)]">Critical severity bypass</p>
              <p className="mt-1 text-[var(--font-size-sm)] text-[var(--color-text-secondary)] leading-relaxed">
                Always deliver critical alerts in real-time, ignoring throttling and quiet hours.
              </p>
            </div>
            <Toggle on={criticalBypass} onChange={setCriticalBypass} />
          </div>
          <div className="flex items-start justify-between gap-6 px-4 py-4">
            <div className="min-w-0">
              <p className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)]">Alert throttling</p>
              <p className="mt-1 text-[var(--font-size-sm)] text-[var(--color-text-secondary)] leading-relaxed">
                Limit repeated notifications to once every {throttleInterval} across all channels.
              </p>
            </div>
            <select
              value={throttleInterval}
              onChange={(e) => setThrottleInterval(e.target.value as (typeof THROTTLE_OPTIONS)[number])}
              className={selectCls}
              aria-label="Alert throttling interval"
            >
              {THROTTLE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h3 className="text-[var(--font-size-base)] font-semibold text-[var(--color-text-primary)]">Notification channels</h3>
          <p className="mt-1 text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
            Choose how you want to be notified for workspace activity.
          </p>
        </div>

        <div className="rounded-[var(--radius-md)] border border-[var(--color-border-1)] overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_88px_88px] sm:grid-cols-[minmax(0,1fr)_100px_100px] bg-[var(--color-surface-secondary)] px-4 py-2.5 border-b border-[var(--color-border-1)] items-center">
            <span className="text-[var(--font-size-xs)] font-semibold text-[var(--color-text-tertiary)]">Notify me about</span>
            <div className="flex flex-col items-center justify-center gap-0.5">
              <span className="text-[var(--font-size-xs)] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">In-App</span>
              <label className="inline-flex cursor-pointer items-center justify-center p-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-primary)]/80">
                <Checkbox
                  checked={allLeafOn('inapp')}
                  indeterminate={!allLeafOn('inapp') && someLeafOn('inapp')}
                  onChange={() => setAllLeafChannel('inapp', !allLeafOn('inapp'))}
                  size="sm"
                  aria-label="Select all in-app notifications"
                />
              </label>
            </div>
            <div className="flex flex-col items-center justify-center gap-0.5">
              <span className="text-[var(--font-size-xs)] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Email</span>
              <label className="inline-flex cursor-pointer items-center justify-center p-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-primary)]/80">
                <Checkbox
                  checked={allLeafOn('email')}
                  indeterminate={!allLeafOn('email') && someLeafOn('email')}
                  onChange={() => setAllLeafChannel('email', !allLeafOn('email'))}
                  size="sm"
                  aria-label="Select all email notifications"
                />
              </label>
            </div>
          </div>

          {NOTIFICATION_MVP_GROUPS.map((grp, gi) => {
            const open = expandedGroups[grp.id];
            const isLastGroup = gi === NOTIFICATION_MVP_GROUPS.length - 1;
            return (
              <div key={grp.id}>
                <div
                  className={`grid grid-cols-[minmax(0,1fr)_88px_88px] sm:grid-cols-[minmax(0,1fr)_100px_100px] items-center px-2 sm:px-3 py-2.5 bg-[var(--color-surface-tertiary)] border-b border-[var(--color-border-1)] ${
                    !open && isLastGroup ? '' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleGroupExpanded(grp.id)}
                    className="flex items-center gap-2 min-w-0 text-left py-1 pl-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-primary)]/60 transition-colors"
                  >
                    <ChevronRight className={`h-4 w-4 shrink-0 text-[var(--color-text-tertiary)] transition-transform ${open ? 'rotate-90' : ''}`} />
                    <span className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)]">{grp.label}</span>
                  </button>
                  <div className="flex justify-center">
                    <label className="inline-flex cursor-pointer items-center justify-center p-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-primary)]/60">
                      <Checkbox
                        checked={groupAllOn(grp.id, 'inapp')}
                        indeterminate={!groupAllOn(grp.id, 'inapp') && groupSomeOn(grp.id, 'inapp')}
                        onChange={() => setGroupLeafChannel(grp.id, 'inapp', !groupAllOn(grp.id, 'inapp'))}
                        size="sm"
                        aria-label={`${grp.label} — toggle all in-app`}
                      />
                    </label>
                  </div>
                  <div className="flex justify-center">
                    <label className="inline-flex cursor-pointer items-center justify-center p-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-primary)]/60">
                      <Checkbox
                        checked={groupAllOn(grp.id, 'email')}
                        indeterminate={!groupAllOn(grp.id, 'email') && groupSomeOn(grp.id, 'email')}
                        onChange={() => setGroupLeafChannel(grp.id, 'email', !groupAllOn(grp.id, 'email'))}
                        size="sm"
                        aria-label={`${grp.label} — toggle all email`}
                      />
                    </label>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      {grp.items.map((item, ii) => (
                        <div
                          key={item.id}
                          className={`grid grid-cols-[minmax(0,1fr)_88px_88px] sm:grid-cols-[minmax(0,1fr)_100px_100px] px-4 py-3.5 items-start gap-y-1 border-b border-[var(--color-border-1)] last:border-b-0 hover:bg-[var(--color-surface-tertiary)]/50 transition-colors ${
                            ii === grp.items.length - 1 && isLastGroup ? 'border-b-0' : ''
                          }`}
                        >
                          <div className="min-w-0 pl-7">
                            <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">{item.label}</p>
                            {item.description && (
                              <p className="mt-0.5 text-[var(--font-size-xs)] text-[var(--color-text-tertiary)] leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="flex justify-center pt-0.5">
                            <CheckboxButton
                              checked={channels[item.id].inapp}
                              disabled={item.disableInApp}
                              onChange={() => toggleChannel(item.id, 'inapp')}
                              aria-label={`${item.label} — in-app`}
                            />
                          </div>
                          <div className="flex justify-center pt-0.5">
                            <CheckboxButton
                              checked={channels[item.id].email}
                              disabled={item.disableEmail}
                              onChange={() => toggleChannel(item.id, 'email')}
                              aria-label={`${item.label} — email`}
                            />
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="ghost" size="sm" onClick={restoreDefaults}>
            Restore to default
          </Button>
        </div>
      </section>

      <div className="flex justify-end pt-2 pb-4">
        <Button variant="dark" size="md">Save changes</Button>
      </div>
    </div>
  );
}

// ── Shared primitives ──────────────────────────────────────────────────────

function SettingsSection({ title, description, children, wide }: { title: string; description?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className="space-y-4 w-full">
      <div className="max-w-3xl">
        <h3 className="text-[var(--font-size-base)] font-semibold text-[var(--color-text-primary)]">{title}</h3>
        {description && <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] mt-1 leading-relaxed">{description}</p>}
      </div>
      <div className="w-full">{children}</div>
    </section>
  );
}

function SettingsDivider() {
  return <div className="border-t border-[var(--color-border-1)] my-7" />;
}

function SettingsInput({ label, value, hint, type = 'text' }: { label: string; value: string; hint?: string; type?: string }) {
  const [val, setVal] = useState(value);
  return (
    <div className="space-y-1">
      <label className="block text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">{label}</label>
      <input
        type={type}
        value={val}
        onChange={e => setVal(e.target.value)}
        className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-neutral-800)] transition-colors"
      />
      {hint && <p className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">{hint}</p>}
    </div>
  );
}

function SettingsSelect({ label, value, options, hint }: { label: string; value: string; options: string[]; hint?: string }) {
  const [val, setVal] = useState(value);
  return (
    <div className="space-y-1">
      <label className="block text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">{label}</label>
      <select
        value={val}
        onChange={e => setVal(e.target.value)}
        className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-neutral-800)] transition-colors appearance-none"
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      {hint && <p className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">{hint}</p>}
    </div>
  );
}

function SaveRow() {
  return (
    <div className="flex justify-end pt-4 pb-8">
      <Button variant="dark" size="md">Save changes</Button>
    </div>
  );
}

// ── General ────────────────────────────────────────────────────────────────

function GeneralSettingsContent() {
  const [danger, setDanger] = useState(false);
  return (
    <div className="space-y-0">
      <SettingsSection title="Workspace identity" description="Manage your workspace name, slug and branding.">
        <div className="space-y-4">
          <SettingsInput label="Workspace name" value="Torq Dev" />
          <SettingsInput label="Workspace slug" value="torq-dev" hint="Used in URLs and API references. Changing this will break existing links." />
          <div className="space-y-1">
            <label className="block text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">Workspace logo</label>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-[var(--radius-md)] bg-[var(--color-neutral-900)] flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <Button variant="secondary" size="sm">Upload logo</Button>
                <p className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)] mt-1">PNG, JPG or SVG. Max 512 KB.</p>
              </div>
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection title="Localization" description="Set the default locale and time display preferences for all members.">
        <div className="grid grid-cols-2 gap-4">
          <SettingsSelect label="Timezone" value="(UTC+03:00) Jerusalem" options={['(UTC+00:00) UTC', '(UTC+03:00) Jerusalem', '(UTC-05:00) Eastern Time', '(UTC-08:00) Pacific Time', '(UTC+01:00) Amsterdam']} />
          <SettingsSelect label="Date format" value="DD/MM/YYYY" options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} />
          <SettingsSelect label="Language" value="English (US)" options={['English (US)', 'English (UK)', 'Hebrew', 'German', 'French']} />
          <SettingsSelect label="First day of week" value="Sunday" options={['Sunday', 'Monday']} />
        </div>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection title="Danger zone" description="Irreversible actions that affect your entire workspace.">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border-2)] divide-y divide-[var(--color-border-1)]">
          <div className="flex items-center justify-between px-4 py-3 gap-4">
            <div>
              <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">Transfer ownership</p>
              <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">Assign a new workspace owner. You will lose admin privileges.</p>
            </div>
            <Button variant="secondary" size="sm">Transfer</Button>
          </div>
          <div className="flex items-center justify-between px-4 py-3 gap-4">
            <div>
              <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-red-500)]">Delete workspace</p>
              <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">Permanently delete this workspace and all its data. Cannot be undone.</p>
            </div>
            <button
              onClick={() => setDanger(true)}
              className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-red-300)] px-3 py-1.5 text-[var(--font-size-sm)] text-[var(--color-red-500)] hover:bg-red-50 transition-colors"
            >Delete workspace</button>
          </div>
        </div>
        {danger && (
          <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-red-300)] bg-red-50 px-4 py-3 text-[var(--font-size-sm)] text-[var(--color-red-500)] flex items-center justify-between">
            <span>Type <strong>torq-dev</strong> to confirm deletion.</span>
            <button onClick={() => setDanger(false)} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"><XIcon className="h-4 w-4" /></button>
          </div>
        )}
      </SettingsSection>

      <SaveRow />
    </div>
  );
}

// ── Members ────────────────────────────────────────────────────────────────

const MOCK_MEMBERS = [
  { name: 'David Workeneh',   email: 'david@torq.io',    role: 'Owner',  last: '2 min ago',    avatar: 'D', color: '#083ABB' },
  { name: 'Sarah Chen',       email: 'sarah@torq.io',    role: 'Admin',  last: '1 hour ago',   avatar: 'S', color: '#29CA88' },
  { name: 'Marco Ricci',      email: 'marco@torq.io',    role: 'Member', last: '3 hours ago',  avatar: 'M', color: '#9275FF' },
  { name: 'Aisha Okafor',     email: 'aisha@torq.io',    role: 'Member', last: 'Yesterday',    avatar: 'A', color: '#FF8E2E' },
  { name: 'Lior Ben-David',   email: 'lior@torq.io',     role: 'Member', last: '2 days ago',   avatar: 'L', color: '#04C0FC' },
  { name: 'Priya Nair',       email: 'priya@torq.io',    role: 'Viewer', last: '4 days ago',   avatar: 'P', color: '#FF7CAF' },
  { name: 'James Okonkwo',    email: 'james@torq.io',    role: 'Viewer', last: '1 week ago',   avatar: 'J', color: '#FDD711' },
];

const ROLE_BADGE: Record<string, string> = {
  Owner:  'bg-[var(--color-neutral-900)] text-white',
  Admin:  'bg-[var(--color-primary-100)] text-[var(--color-primary-500)]',
  Member: 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]',
  Viewer: 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)]',
};

function MembersSettingsContent() {
  const [search, setSearch] = useState('');
  const filtered = MOCK_MEMBERS.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
          <input
            placeholder="Search members…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-[var(--font-size-sm)] border border-[var(--color-border-2)] rounded-[var(--radius-sm)] outline-none focus:border-[var(--color-neutral-800)] transition-colors bg-[var(--color-surface-primary)]"
          />
        </div>
        <Button variant="dark" size="sm" leftIcon={<UserPlus className="h-3.5 w-3.5" />}>Invite member</Button>
      </div>

      <div className="rounded-[var(--radius-md)] border border-[var(--color-border-1)] overflow-hidden">
        <div className="grid grid-cols-[1fr_200px_120px_120px_40px] bg-[var(--color-surface-secondary)] px-4 py-2.5 border-b border-[var(--color-border-1)]">
          {['Member', 'Email', 'Role', 'Last active', ''].map(h => (
            <span key={h} className="text-[var(--font-size-xs)] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">{h}</span>
          ))}
        </div>
        {filtered.map((m, i) => (
          <div key={m.email} className={`grid grid-cols-[1fr_200px_120px_120px_40px] px-4 py-3 items-center ${i < filtered.length - 1 ? 'border-b border-[var(--color-border-1)]' : ''} hover:bg-[var(--color-surface-tertiary)] transition-colors`}>
            <div className="flex items-center gap-2.5">
              <span className="h-7 w-7 rounded-full flex items-center justify-center text-[var(--font-size-xs)] font-bold text-white shrink-0" style={{ backgroundColor: m.color }}>{m.avatar}</span>
              <span className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)] truncate">{m.name}</span>
            </div>
            <span className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] truncate">{m.email}</span>
            <span className={`inline-flex w-fit items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-[var(--font-size-xs)] font-medium ${ROLE_BADGE[m.role]}`}>{m.role}</span>
            <span className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">{m.last}</span>
            <button className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-neutral-150)] hover:text-[var(--color-text-primary)] transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <p className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">{MOCK_MEMBERS.length} members · 5 seats used of 20</p>
    </div>
  );
}

// ── Groups ─────────────────────────────────────────────────────────────────

const MOCK_GROUPS = [
  { name: 'SOC Team',       members: 12, desc: 'Tier-1 and Tier-2 analysts with case access.',    color: '#2864FF' },
  { name: 'IR Response',    members: 5,  desc: 'Incident responders with full workflow rights.',   color: '#EA231A' },
  { name: 'Threat Intel',   members: 8,  desc: 'Read-only access to cases and Socrates outputs.', color: '#9275FF' },
  { name: 'DevOps',         members: 3,  desc: 'Manages runners, integrations and API keys.',     color: '#29CA88' },
  { name: 'Compliance',     members: 4,  desc: 'View-only audit and log export access.',          color: '#FDD711' },
];

function GroupsSettingsContent() {
  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">{MOCK_GROUPS.length} groups</p>
        <Button variant="dark" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>New group</Button>
      </div>
      <div className="rounded-[var(--radius-md)] border border-[var(--color-border-1)] divide-y divide-[var(--color-border-1)] overflow-hidden">
        {MOCK_GROUPS.map(g => (
          <div key={g.name} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--color-surface-tertiary)] transition-colors">
            <div className="h-8 w-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0" style={{ backgroundColor: g.color + '22' }}>
              <Users className="h-4 w-4" style={{ color: g.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">{g.name}</p>
              <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)] truncate">{g.desc}</p>
            </div>
            <span className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)] shrink-0">{g.members} members</span>
            <button className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-neutral-150)] hover:text-[var(--color-text-primary)] transition-colors shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Security ───────────────────────────────────────────────────────────────

function SecuritySSOContent() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="space-y-0">
      <SettingsSection title="Single Sign-On (SSO)" description="Let members log in with your company's identity provider via SAML 2.0 or OIDC.">
        <div className="flex items-center justify-between p-4 rounded-[var(--radius-md)] border border-[var(--color-border-2)] mb-5">
          <div>
            <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">Enable SSO</p>
            <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">Members will be redirected to your IdP on login.</p>
          </div>
          <Toggle on={enabled} onChange={setEnabled} />
        </div>
        <div className={`space-y-4 ${!enabled ? 'opacity-40 pointer-events-none' : ''}`}>
          <SettingsSelect label="Protocol" value="SAML 2.0" options={['SAML 2.0', 'OIDC']} />
          <SettingsInput label="IdP Entity ID / Issuer" value="" hint="Provided by your identity provider." />
          <SettingsInput label="IdP SSO URL" value="" hint="The endpoint that receives SAML/OIDC auth requests." />
          <div className="space-y-1">
            <label className="block text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">IdP certificate (X.509)</label>
            <textarea
              rows={4}
              placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] px-3 py-2 text-[var(--font-size-xs)] font-mono text-[var(--color-text-primary)] outline-none focus:border-[var(--color-neutral-800)] resize-none transition-colors"
            />
          </div>
          <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--color-surface-secondary)] border border-[var(--color-border-1)]">
            <p className="text-[var(--font-size-xs)] font-medium text-[var(--color-text-secondary)] mb-1">Your ACS (callback) URL</p>
            <code className="text-[var(--font-size-xs)] text-[var(--color-primary-500)]">https://app.torq.io/auth/saml/torq-dev/callback</code>
          </div>
        </div>
      </SettingsSection>
      <SaveRow />
    </div>
  );
}

function SecurityRolesContent() {
  const roles = [
    { name: 'Owner',  desc: 'Full access. Can delete workspace and manage billing.',        count: 1 },
    { name: 'Admin',  desc: 'Manage members, roles, integrations and all workspace data.', count: 2 },
    { name: 'Member', desc: 'Create and run workflows, view and edit cases.',               count: 4 },
    { name: 'Viewer', desc: 'Read-only access to cases, workflows and dashboards.',         count: 2 },
  ];
  return (
    <div className="space-y-4 w-full">
      <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">Roles control what members can see and do across the workspace. Custom roles are available on Enterprise plans.</p>
      <div className="rounded-[var(--radius-md)] border border-[var(--color-border-1)] divide-y divide-[var(--color-border-1)] overflow-hidden">
        {roles.map(r => (
          <div key={r.name} className="flex items-start gap-3 px-4 py-4 hover:bg-[var(--color-surface-tertiary)] transition-colors">
            <span className={`mt-0.5 inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-[var(--font-size-xs)] font-medium shrink-0 ${ROLE_BADGE[r.name]}`}>{r.name}</span>
            <div className="flex-1">
              <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">{r.desc}</p>
            </div>
            <span className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)] shrink-0">{r.count} members</span>
          </div>
        ))}
      </div>
      <Button variant="secondary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>Request custom role</Button>
    </div>
  );
}

function SecurityAdvancedContent() {
  const [mfa, setMfa] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('8 hours');
  const [apiExpiry, setApiExpiry] = useState(false);
  return (
    <div className="space-y-0">
      <SettingsSection title="Authentication" description="Enforce stronger login security for all workspace members.">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-[var(--radius-md)] border border-[var(--color-border-2)]">
            <div>
              <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">Require MFA</p>
              <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">All members must enable multi-factor authentication.</p>
            </div>
            <Toggle on={mfa} onChange={setMfa} />
          </div>
          <div className="flex items-center justify-between p-4 rounded-[var(--radius-md)] border border-[var(--color-border-2)]">
            <div>
              <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">Session timeout</p>
              <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">Automatically sign out inactive members.</p>
            </div>
            <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} className="rounded-[var(--radius-sm)] border border-[var(--color-border-2)] px-2 py-1 text-[var(--font-size-sm)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-neutral-800)] bg-[var(--color-surface-primary)]">
              {['1 hour', '4 hours', '8 hours', '24 hours', 'Never'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </SettingsSection>
      <SettingsDivider />
      <SettingsSection title="API keys" description="Control how API keys behave across the workspace.">
        <div className="flex items-center justify-between p-4 rounded-[var(--radius-md)] border border-[var(--color-border-2)]">
          <div>
            <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">Enforce key expiry</p>
            <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">API keys expire after 90 days and must be rotated.</p>
          </div>
          <Toggle on={apiExpiry} onChange={setApiExpiry} />
        </div>
      </SettingsSection>
      <SaveRow />
    </div>
  );
}

function SecurityIPContent() {
  const [entries, setEntries] = useState(['10.100.0.0/16', '195.88.2.0/24']);
  const [input, setInput] = useState('');
  return (
    <div className="space-y-0">
      <SettingsSection title="IP allowlist" description="Restrict workspace access to specific IP ranges. Members connecting from unlisted IPs will be blocked.">
        <div className="space-y-2">
          {entries.map(e => (
            <div key={e} className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border-1)] bg-[var(--color-surface-secondary)]">
              <code className="text-[var(--font-size-sm)] text-[var(--color-text-primary)] font-mono">{e}</code>
              <button onClick={() => setEntries(prev => prev.filter(x => x !== e))} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-red-500)] transition-colors">
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="e.g. 203.0.113.0/24"
              className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border-2)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-neutral-800)] transition-colors bg-[var(--color-surface-primary)]"
              onKeyDown={e => { if (e.key === 'Enter' && input.trim()) { setEntries(p => [...p, input.trim()]); setInput(''); }}}
            />
            <Button variant="secondary" size="sm" onClick={() => { if (input.trim()) { setEntries(p => [...p, input.trim()]); setInput(''); }}}>Add</Button>
          </div>
          <p className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">Press Enter or click Add. CIDR notation supported. Your current IP: 195.88.2.104</p>
        </div>
      </SettingsSection>
      <SaveRow />
    </div>
  );
}

// ── Log Export ─────────────────────────────────────────────────────────────

function LogExportContent() {
  const [dest, setDest] = useState('S3');
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="space-y-0">
      <SettingsSection title="Log export" description="Stream audit logs and workflow execution logs to your SIEM or storage.">
        <div className="flex items-center justify-between p-4 rounded-[var(--radius-md)] border border-[var(--color-border-2)] mb-5">
          <div>
            <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">Enable log export</p>
            <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">Forward logs automatically to the configured destination.</p>
          </div>
          <Toggle on={enabled} onChange={setEnabled} />
        </div>
        <div className={`space-y-4 ${!enabled ? 'opacity-40 pointer-events-none' : ''}`}>
          <SettingsSelect label="Destination" value={dest} options={['S3', 'Google Cloud Storage', 'Azure Blob Storage', 'Splunk HEC', 'Elastic', 'Datadog']} hint="Select where logs should be forwarded." />
          {dest === 'S3' && <>
            <SettingsInput label="S3 bucket name" value="torq-logs-prod" />
            <SettingsInput label="AWS region" value="us-east-1" />
            <SettingsInput label="IAM role ARN" value="arn:aws:iam::123456789012:role/torq-log-export" hint="Torq will assume this role to write logs." />
          </>}
          {dest === 'Splunk HEC' && <>
            <SettingsInput label="HEC endpoint URL" value="" />
            <SettingsInput label="HEC token" value="" type="password" />
          </>}
          <SettingsSelect label="Log format" value="JSON (newline-delimited)" options={['JSON (newline-delimited)', 'JSON (array)', 'CEF']} />
          <SettingsSelect label="Frequency" value="Every 15 minutes" options={['Real-time (streaming)', 'Every 5 minutes', 'Every 15 minutes', 'Hourly', 'Daily']} />
        </div>
      </SettingsSection>
      <SaveRow />
    </div>
  );
}

// ── Cases ──────────────────────────────────────────────────────────────────

function CasesSettingsContent() {
  const [autoClose, setAutoClose] = useState(true);
  const [slaWarn, setSlaWarn] = useState(true);
  return (
    <div className="space-y-0">
      <SettingsSection title="Case defaults" description="Set default values applied when a new case is created.">
        <div className="grid grid-cols-2 gap-4">
          <SettingsSelect label="Default severity" value="Medium" options={['Critical', 'High', 'Medium', 'Low', 'Info']} />
          <SettingsSelect label="Default assignee" value="Unassigned" options={['Unassigned', 'Case creator', 'SOC Team (round-robin)']} />
          <SettingsSelect label="Default status" value="Open" options={['Open', 'In progress', 'Pending']} />
          <SettingsSelect label="Case ID prefix" value="CASE-" options={['CASE-', 'INC-', 'TKT-', 'SOC-']} />
        </div>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection title="SLA policy" description="Define response and resolution time targets by severity.">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border-1)] overflow-hidden mb-3">
          <div className="grid grid-cols-[120px_1fr_1fr] bg-[var(--color-surface-secondary)] px-4 py-2 border-b border-[var(--color-border-1)]">
            <span className="text-[var(--font-size-xs)] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Severity</span>
            <span className="text-[var(--font-size-xs)] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">First response</span>
            <span className="text-[var(--font-size-xs)] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Resolution</span>
          </div>
          {[
            { sev: 'Critical', fr: '15 min', res: '4 hours',  color: '#EA231A' },
            { sev: 'High',     fr: '1 hour', res: '24 hours', color: '#FF8E2E' },
            { sev: 'Medium',   fr: '4 hours',res: '3 days',   color: '#FDD711' },
            { sev: 'Low',      fr: '1 day',  res: '7 days',   color: '#B0B3BD' },
          ].map((row, i, arr) => (
            <div key={row.sev} className={`grid grid-cols-[120px_1fr_1fr] px-4 py-3 items-center ${i < arr.length - 1 ? 'border-b border-[var(--color-border-1)]' : ''}`}>
              <span className="inline-flex items-center gap-1.5 text-[var(--font-size-sm)]">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                {row.sev}
              </span>
              <span className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">{row.fr}</span>
              <span className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">{row.res}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between p-4 rounded-[var(--radius-md)] border border-[var(--color-border-2)]">
          <div>
            <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">SLA breach warnings</p>
            <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">Send a notification 30 minutes before an SLA deadline.</p>
          </div>
          <Toggle on={slaWarn} onChange={setSlaWarn} />
        </div>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection title="Lifecycle">
        <div className="flex items-center justify-between p-4 rounded-[var(--radius-md)] border border-[var(--color-border-2)]">
          <div>
            <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">Auto-close resolved cases</p>
            <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">Cases in Resolved state for more than 7 days are automatically closed.</p>
          </div>
          <Toggle on={autoClose} onChange={setAutoClose} />
        </div>
      </SettingsSection>

      <SaveRow />
    </div>
  );
}

// ── Socrates Tools ─────────────────────────────────────────────────────────

function SocratesToolsContent() {
  type ToolRow = { id: string; name: string; desc: string; risk: 'Low' | 'Medium' | 'High'; enabled: boolean };
  const [tools, setTools] = useState<ToolRow[]>([
    { id: 'enrich-ip',    name: 'IP enrichment',        desc: 'Query threat intel feeds for IP reputation.',          risk: 'Low',    enabled: true  },
    { id: 'enrich-url',   name: 'URL enrichment',       desc: 'Detonate URLs in a sandboxed environment.',            risk: 'Medium', enabled: true  },
    { id: 'enrich-file',  name: 'File hash lookup',     desc: 'Check hashes against VirusTotal and internal stores.', risk: 'Low',    enabled: true  },
    { id: 'run-workflow', name: 'Trigger workflow',      desc: 'Autonomously trigger approved workflow templates.',    risk: 'High',   enabled: false },
    { id: 'case-create',  name: 'Create case',          desc: 'Open a new case from an AI-identified incident.',      risk: 'Medium', enabled: true  },
    { id: 'case-update',  name: 'Update case fields',   desc: 'Modify severity, status and assignee on cases.',       risk: 'Medium', enabled: false },
    { id: 'web-search',   name: 'Web search',           desc: 'Search the web for threat context.',                   risk: 'Low',    enabled: true  },
    { id: 'code-exec',    name: 'Code execution',       desc: 'Run Python snippets in a sandboxed environment.',      risk: 'High',   enabled: false },
  ]);

  const RISK_STYLE: Record<string, string> = {
    Low:    'bg-[#e6f9f1] text-[#29CA88]',
    Medium: 'bg-[#fff4e0] text-[#FF8E2E]',
    High:   'bg-[#ffeaea] text-[#EA231A]',
  };

  function toggle(id: string) {
    setTools(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  }

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-primary-50)] border border-[var(--color-primary-300)] flex gap-2.5">
        <Cpu className="h-4 w-4 text-[var(--color-primary-500)] shrink-0 mt-0.5" />
        <p className="text-[var(--font-size-sm)] text-[var(--color-primary-950)]">Socrates can only use tools that are explicitly enabled here. High-risk tools require an <strong>approval request</strong> before execution.</p>
      </div>
      <div className="rounded-[var(--radius-md)] border border-[var(--color-border-1)] overflow-hidden">
        <div className="grid grid-cols-[1fr_70px_56px] bg-[var(--color-surface-secondary)] px-4 py-2.5 border-b border-[var(--color-border-1)]">
          <span className="text-[var(--font-size-xs)] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Tool</span>
          <span className="text-[var(--font-size-xs)] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Risk</span>
          <span className="text-[var(--font-size-xs)] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide text-center">On</span>
        </div>
        {tools.map((t, i) => (
          <div key={t.id} className={`grid grid-cols-[1fr_70px_56px] px-4 py-3.5 items-center ${i < tools.length - 1 ? 'border-b border-[var(--color-border-1)]' : ''} hover:bg-[var(--color-surface-tertiary)] transition-colors`}>
            <div>
              <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">{t.name}</p>
              <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">{t.desc}</p>
            </div>
            <span className={`inline-flex w-fit items-center rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[var(--font-size-xs)] font-medium ${RISK_STYLE[t.risk]}`}>{t.risk}</span>
            <div className="flex justify-center">
              <Toggle on={t.enabled} onChange={() => toggle(t.id)} />
            </div>
          </div>
        ))}
      </div>
      <SaveRow />
    </div>
  );
}

function SettingsPage({ initialSection = 'notifications', onSectionChange }: { initialSection?: SettingsSection; onSectionChange?: (s: SettingsSection) => void }) {
  const [active, setActive] = useState<SettingsSection>(initialSection);
  const [secOpen, setSecOpen] = useState(active.startsWith('security'));

  useEffect(() => { setActive(initialSection); }, [initialSection]);

  function goTo(s: SettingsSection) { setActive(s); onSectionChange?.(s); }

  function renderContent() {
    switch (active) {
      case 'notifications':     return <NotificationSettingsContent />;
      case 'general':           return <GeneralSettingsContent />;
      case 'members':           return <MembersSettingsContent />;
      case 'groups':            return <GroupsSettingsContent />;
      case 'security-sso':      return <SecuritySSOContent />;
      case 'security-roles':    return <SecurityRolesContent />;
      case 'security-advanced': return <SecurityAdvancedContent />;
      case 'security-ip':       return <SecurityIPContent />;
      case 'log-export':        return <LogExportContent />;
      case 'cases':             return <CasesSettingsContent />;
      case 'socrates-tools':    return <SocratesToolsContent />;
      default:                  return null;
    }
  }

  const sectionTitle = (() => {
    if (active === 'notifications') return 'Notifications';
    if (active.startsWith('security')) return 'Security';
    return SETTINGS_NAV.find(n => n.id === active)?.label ?? '';
  })();

  return (
    <div className="flex h-full bg-[var(--color-surface-primary)]">
      {/* Settings left nav */}
      <div className="w-52 shrink-0 border-r border-[var(--color-border-1)] bg-[var(--color-surface-secondary)] flex flex-col py-4 overflow-y-auto">
        <p className="px-4 mb-3 text-[var(--font-size-xs)] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide">Workspace settings</p>
        {SETTINGS_NAV.map(nav => {
          const Icon = nav.icon;
          const isSecGrp = nav.id === 'security-sso';
          const isActive = nav.sub ? nav.sub.some(s => s.id === active) : active === nav.id;
          return (
            <div key={nav.id}>
              <button
                onClick={() => {
                  if (isSecGrp) { setSecOpen(o => !o); if (!secOpen) goTo('security-sso'); }
                  else goTo(nav.id as SettingsSection);
                }}
                className={`w-full flex items-center gap-2.5 px-4 py-2 text-[var(--font-size-sm)] transition-colors ${isActive && !isSecGrp ? 'bg-[var(--color-neutral-150)] text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{nav.label}</span>
                {isSecGrp && <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${secOpen ? 'rotate-180' : ''}`} />}
              </button>
              {isSecGrp && secOpen && nav.sub && (
                <div className="pl-10">
                  {nav.sub.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => goTo(sub.id)}
                      className={`w-full flex items-center px-3 py-1.5 text-[var(--font-size-sm)] transition-colors rounded-[var(--radius-sm)] ${active === sub.id ? 'bg-[var(--color-neutral-150)] text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'}`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Settings content */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="px-10 pt-8 pb-12 w-full">
          <div className="w-full">
            <h2 className="text-[var(--font-size-2xl)] font-semibold text-[var(--color-text-primary)] mb-1">{sectionTitle}</h2>
            {active === 'notifications' && (
              <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] mb-6 max-w-2xl">
                Decide when and how you want to be notified.
              </p>
            )}
            <div className={`border-b border-[var(--color-border-1)] ${active === 'notifications' ? 'mb-6' : 'mb-8'}`} />
            <div className="w-full [&>*]:w-full">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Content Router ────────────────────────────────────────────────────────

function ContentRouter({ pageId }: { pageId: string }) {
  switch (pageId) {
    case 'integrations':           return <IntegrationsPage />;
    case 'workspace-variables':    return <WorkspaceVariablesPage />;
    case 'templates':              return <TemplatesPage />;
    case 'cases':                  return <CasesPage />;
    case 'runbooks':               return <RunbooksPage />;
    case 'observables':            return <ObservablesPage />;
    case 'sources':                return <SourcesPage />;
    case 'activity-log':           return <ActivityLogPage />;
    case 'insights':               return <InsightsPage />;
    case 'case-dashboards':        return <CaseDashboardsPage />;
    case 'interact-picker':        return <ComingSoonPage title="Interact Data Picker"    icon={Table2} />;
    case 'interact-table':         return <ComingSoonPage title="Table for Interact"      icon={Table2} />;
    case 'snappy-bot':             return <ComingSoonPage title="Snappy Bot"              icon={Bot} />;
    case 'interact-insights':      return <ComingSoonPage title="Insights"                icon={Lightbulb} />;
    case 'indicator-investigation':return <ComingSoonPage title="Indicator Investigation" icon={Target} />;
    case 'bring-data':             return <ComingSoonPage title="Bring Me the Data"       icon={Database} />;
    case 'settings-notifications': return <SettingsPage initialSection="notifications" />;
    case 'settings':               return <SettingsPage initialSection="general" />;
    default:                       return null;
  }
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function Home() {
  const [inboxOpen, setInboxOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState('torq-dev');
  const [currentPage, setCurrentPage] = useState('workflows');
  const [searchVal, setSearchVal] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('notifications');
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);

    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setSettingsOpen(false); }
    function onOpenSettings(e: Event) {
      const section = (e as CustomEvent<SettingsSection>).detail ?? 'notifications';
      setSettingsSection(section);
      setSettingsOpen(true);
    }

    window.addEventListener('keydown', onKey);
    window.addEventListener('torq:open-settings', onOpenSettings);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('torq:open-settings', onOpenSettings);
    };
  }, []);
  const workspaceBtnRef = useRef<HTMLButtonElement>(null);

  function navigate(pageId: string) {
    setCurrentPage(pageId);
    setInboxOpen(false);
  }

  function expandAndOpenPicker() {
    setSidebarCollapsed(false);
    // Wait for sidebar animation before measuring the picker anchor
    setTimeout(() => setWorkspaceOpen(true), 260);
  }

  const SIDEBAR_W = sidebarCollapsed ? 52 : 220;

  function toggleRow(id: string) {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="h-screen w-full bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] font-sans overflow-hidden">
      <div className="relative flex h-full">

        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <motion.aside
          animate={{ width: SIDEBAR_W }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          style={{ position: 'relative', zIndex: 45 }}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
          onClick={sidebarCollapsed ? () => setSidebarCollapsed(false) : undefined}
          className={`shrink-0 border-r border-[var(--color-border-2)] bg-[var(--color-surface-secondary)] flex flex-col h-full overflow-hidden ${sidebarCollapsed ? 'cursor-pointer' : ''}`}
        >
          {/* ── Brand / workspace row ── */}
          <div className="relative border-b border-[var(--color-border-1)] shrink-0">
            <AnimatePresence mode="wait" initial={false}>
              {sidebarCollapsed ? (

                /* ── COLLAPSED: workspace logo (top, static) → expand arrow appears on hover ── */
                <motion.div
                  key="collapsed-brand"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col items-center gap-2 py-3 px-2"
                >
                  {/* Expand arrow — only visible on hover, slides in above logo */}
                  <AnimatePresence>
                    {sidebarHovered && (
                      <motion.button
                        key="expand-btn"
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 28, marginBottom: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={(e) => { e.stopPropagation(); setSidebarCollapsed(false); }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex w-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-150)] hover:text-[var(--color-text-primary)] transition-colors overflow-hidden shrink-0"
                        title="Expand sidebar"
                      >
                        <ChevronsRight className="h-4 w-4 shrink-0" />
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* Workspace logo — always visible, click = expand + open picker */}
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); expandAndOpenPicker(); }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.96 }}
                    title="Switch workspace"
                    className="outline-none"
                  >
                    <WorkspaceAvatar wsId={currentWorkspace} size="lg" />
                  </motion.button>
                </motion.div>

              ) : (

                /* ── EXPANDED: logo + name + [<< on hover] + [ChevronDown picker] ── */
                <motion.div
                  key="expanded-brand"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2 px-3 py-3 w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <WorkspaceAvatar wsId={currentWorkspace} />

                  <span className="flex-1 text-[var(--font-size-sm)] font-semibold truncate text-[var(--color-text-primary)]">
                    {currentWorkspace}
                  </span>

                  {/* Collapse button — fades in on sidebar hover, sits LEFT of ChevronDown */}
                  <AnimatePresence>
                    {sidebarHovered && (
                      <motion.button
                        key="collapse-btn"
                        initial={{ opacity: 0, scale: 0.8, width: 0 }}
                        animate={{ opacity: 1, scale: 1, width: 'auto' }}
                        exit={{ opacity: 0, scale: 0.8, width: 0 }}
                        transition={{ duration: 0.12 }}
                        onClick={(e) => { e.stopPropagation(); setSidebarCollapsed(true); }}
                        className="flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors overflow-hidden"
                        title="Collapse sidebar"
                      >
                        <ChevronsLeft className="h-3.5 w-3.5" />
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* Workspace picker ChevronDown — always visible, never moves */}
                  <button
                    ref={workspaceBtnRef}
                    onClick={(e) => { e.stopPropagation(); setWorkspaceOpen((o) => !o); }}
                    className="flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${workspaceOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {workspaceOpen && (
                      <WorkspacePicker
                        current={currentWorkspace}
                        onSelect={setCurrentWorkspace}
                        onClose={() => setWorkspaceOpen(false)}
                        anchorRef={workspaceBtnRef}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Nav sections ── */}
          <div
            className={`flex-1 overflow-y-auto py-2 ${sidebarCollapsed ? 'flex flex-col items-center gap-1 px-1' : 'space-y-1'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_SECTIONS.map((s) => (
              <SidebarSection
                key={s.title}
                section={s}
                defaultOpen={s.defaultOpen ?? false}
                collapsed={sidebarCollapsed}
                currentPage={currentPage}
                onNavigate={navigate}
              />
            ))}
          </div>

          {/* ── Bottom items ── */}
          <div
            className={`shrink-0 border-t border-[var(--color-border-1)] ${sidebarCollapsed ? 'flex flex-col items-center py-2 gap-1 px-1' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Inbox */}
            {sidebarCollapsed ? (
              <SidebarTooltip label="Inbox">
                <button onClick={() => setInboxOpen((o) => !o)}
                  className={`relative flex items-center justify-center rounded-[var(--radius-md)] w-8 h-8 transition-colors ${inboxOpen ? 'bg-[var(--color-neutral-150)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'}`}
                >
                  <InboxSidebarIcon className="h-4 w-4" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[var(--color-red-500)] px-0.5 text-[9px] font-bold text-white leading-none">10</span>
                </button>
              </SidebarTooltip>
            ) : (
              <div className="px-2 pt-2">
                <button onClick={() => setInboxOpen((o) => !o)}
                  className={`flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-[var(--font-size-sm)] transition-colors ${inboxOpen ? 'bg-[var(--color-neutral-150)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'}`}
                >
                  <span className="relative shrink-0">
                    <InboxSidebarIcon className="h-3.5 w-3.5" />
                    <span className="absolute -top-1.5 -right-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[var(--color-red-500)] px-0.5 text-[9px] font-bold text-white leading-none shadow-sm">10</span>
                  </span>
                  <span>Inbox</span>
                </button>
              </div>
            )}

            {/* Knowledge Hub */}
            {sidebarCollapsed ? (
              <SidebarTooltip label="Knowledge Hub">
                <a href="#" onClick={(e) => e.stopPropagation()} className="flex items-center justify-center rounded-[var(--radius-md)] w-8 h-8 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                  <BookMarked className="h-4 w-4" />
                </a>
              </SidebarTooltip>
            ) : (
              <div className="px-2">
                <a href="#" className="flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-[var(--font-size-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                  <BookMarked className="h-3.5 w-3.5 shrink-0" />Knowledge Hub
                </a>
              </div>
            )}

            {/* Settings */}
            {sidebarCollapsed ? (
              <SidebarTooltip label="Settings">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('torq:open-settings', { detail: 'general' }))}
                  className="flex items-center justify-center rounded-[var(--radius-md)] w-8 h-8 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <SettingsIcon className="h-4 w-4" />
                </button>
              </SidebarTooltip>
            ) : (
              <div className="px-2">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('torq:open-settings', { detail: 'general' }))}
                  className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-[var(--font-size-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <SettingsIcon className="h-3.5 w-3.5 shrink-0" />Settings
                </button>
              </div>
            )}

            {/* User */}
            <div className={`flex items-center border-t border-[var(--color-border-1)] mt-1 ${sidebarCollapsed ? 'justify-center px-2 py-2.5 w-full' : 'gap-2 px-3 py-2.5'}`}>
              {sidebarCollapsed ? (
                <SidebarTooltip label="David Workeneh">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-neutral-800)] text-[var(--font-size-xs)] font-bold text-white cursor-pointer">D</span>
                </SidebarTooltip>
              ) : (
                <>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-neutral-800)] text-[var(--font-size-xs)] font-bold text-white">D</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">David Workeneh</p>
                    <p className="truncate text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">david.workeneh@torq.io</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.aside>

        {/* ── Inbox backdrop — closes panel on outside click ── */}
        {inboxOpen && (
          <div
            className="absolute inset-0 z-40"
            onClick={() => setInboxOpen(false)}
          />
        )}

        {/* ── Inbox Panel — anchored dynamically after sidebar ── */}
        <motion.div
          animate={{ left: SIDEBAR_W }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className="absolute top-0 h-full z-50 flex pointer-events-none"
        >
          <div className="pointer-events-auto h-full flex">
            <InboxPanel
              isOpen={inboxOpen}
              onClose={() => setInboxOpen(false)}
              onNavigate={(pageId) => setCurrentPage(pageId)}
            />
          </div>
        </motion.div>

        {/* ── Main Content ──────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-[var(--color-surface-primary)]">

          {/* Non-workflows pages */}
          {currentPage !== 'workflows' && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="flex-1 min-h-0 h-full overflow-hidden"
              >
                <ContentRouter pageId={currentPage} />
              </motion.div>
            </AnimatePresence>
          )}

          {/* Workflows page */}
          {currentPage === 'workflows' && <>

          {/* Page header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-2)] shrink-0">
            <h1 className="text-[var(--font-size-2xl)] font-semibold text-[var(--color-text-primary)]">
              Workflows
            </h1>
            <div className="flex items-center">
              <Button variant="dark" leftIcon={<Plus />} className="!rounded-r-none">Create</Button>
              <Button variant="dark" className="!rounded-l-none !px-2">
                <ChevronDown className="h-4 w-4" />
              </Button>
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
                suppressHydrationWarning
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] pl-8 pr-3 py-1.5 text-[var(--font-size-sm)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary-500)] transition-colors"
              />
            </div>
            {(['State', 'Triggered from', 'Shared', 'Tags'] as const).map((label) => (
              <Button key={label} variant="secondary" size="sm"
                rightIcon={<ChevronDown className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />}
              >
                {label} <span className="text-[var(--color-text-tertiary)]">All</span>
              </Button>
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

          </>}
        </main>
      </div>

      {/* ── Settings Modal ─────────────────────────────────────────────── */}
      {settingsOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.45)' }}
          onClick={() => setSettingsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[var(--color-surface-primary)] rounded-[var(--radius-xl)] shadow-2xl overflow-hidden flex"
            style={{ width: '90vw', maxWidth: 1300, height: '86vh' }}
          >
            <button
              onClick={() => setSettingsOpen(false)}
              className="absolute top-4 right-4 z-10 flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-neutral-150)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </button>
            <SettingsPage
              initialSection={settingsSection}
              onSectionChange={setSettingsSection}
            />
          </div>
        </div>
      )}
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
