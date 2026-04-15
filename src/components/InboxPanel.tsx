'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Search,
  ListFilter,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ArrowLeft,
  Inbox as InboxIcon,
  Archive as ArchiveIcon,
  ArchiveRestore,
  Check,
  CheckCheck,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Info,
  Zap,
  Bell,
  BellOff,
  Settings2,
  Building2,
  MoreVertical,
  Plus,
  Eye,
  AtSign,
  UserPlus,
  ThumbsUp,
  XCircle,
  FolderOpen,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = 'critical' | 'high' | 'medium' | 'low';
type MessageType = 'alert' | 'notification' | 'workflow' | 'system';
type View = 'all' | 'unread' | 'archive';
type WorkspaceMode = 'all' | 'single' | 'multi';

interface Message {
  id: string;
  title: string;
  preview: string;
  type: MessageType;
  severity: Severity;
  time: string;
  isRead: boolean;
  workspace: string;
  source: string;
  isArchived: boolean;
}

// ─── Static config ─────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<Severity, {
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
  Icon: React.ElementType;
}> = {
  critical: {
    label: 'Critical',
    color: 'text-[var(--color-red-500)]',
    bg: 'bg-[var(--color-red-50)]',
    border: 'border-[var(--color-red-300)]',
    dot: 'bg-[var(--color-red-500)]',
    Icon: AlertOctagon,
  },
  high: {
    label: 'High',
    color: 'text-[var(--color-orange-500)]',
    bg: 'bg-[var(--color-orange-100)]',
    border: 'border-[var(--color-orange-300)]',
    dot: 'bg-[var(--color-orange-500)]',
    Icon: AlertTriangle,
  },
  medium: {
    label: 'Medium',
    color: 'text-[var(--color-yellow-500)]',
    bg: 'bg-[var(--color-yellow-100)]',
    border: 'border-[var(--color-yellow-200)]',
    dot: 'bg-[var(--color-yellow-500)]',
    Icon: AlertCircle,
  },
  low: {
    label: 'Low',
    color: 'text-[var(--color-cyan-500)]',
    bg: 'bg-[var(--color-cyan-100)]',
    border: 'border-[var(--color-cyan-300)]',
    dot: 'bg-[var(--color-cyan-500)]',
    Icon: Info,
  },
};

const TYPE_CONFIG: Record<MessageType, { label: string; Icon: React.ElementType }> = {
  alert: { label: 'Alert', Icon: Bell },
  notification: { label: 'Notification', Icon: Bell },
  workflow: { label: 'Workflow', Icon: Zap },
  system: { label: 'System', Icon: Settings2 },
};

const WORKSPACES = ['Production', 'Development', 'Staging'];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    title: 'Ransomware detected on endpoint',
    preview: 'CrowdStrike detected suspicious file encryption activity on WIN-SERVER-01.',
    type: 'alert',
    severity: 'critical',
    time: '1m ago',
    isRead: false,
    workspace: 'Production',
    source: 'CrowdStrike',
    isArchived: false,
  },
  {
    id: 'msg-2',
    title: 'Suspicious login attempt blocked',
    preview: 'Multiple failed login attempts from IP 185.220.101.8 (TOR exit node).',
    type: 'alert',
    severity: 'high',
    time: '5m ago',
    isRead: false,
    workspace: 'Production',
    source: 'Okta',
    isArchived: false,
  },
  {
    id: 'msg-3',
    title: 'Workflow "Auto-Triage" completed',
    preview: 'Successfully processed 14 alerts in the last 24 hours.',
    type: 'workflow',
    severity: 'low',
    time: '12m ago',
    isRead: true,
    workspace: 'Development',
    source: 'Torq',
    isArchived: false,
  },
  {
    id: 'msg-4',
    title: 'API rate limit approaching',
    preview: 'The Jira integration is at 85% of its hourly rate limit.',
    type: 'notification',
    severity: 'medium',
    time: '18m ago',
    isRead: false,
    workspace: 'Staging',
    source: 'Jira',
    isArchived: false,
  },
  {
    id: 'msg-5',
    title: 'New admin added to workspace',
    preview: 'sarah.chen@company.com was granted Admin access by david.w@company.com.',
    type: 'system',
    severity: 'medium',
    time: '34m ago',
    isRead: true,
    workspace: 'Production',
    source: 'Torq',
    isArchived: false,
  },
  {
    id: 'msg-6',
    title: 'S3 bucket policy changed to public',
    preview: 'Bucket "prod-data-backup" ACL modified. Immediate review recommended.',
    type: 'alert',
    severity: 'high',
    time: '1h ago',
    isRead: false,
    workspace: 'Production',
    source: 'AWS',
    isArchived: false,
  },
  {
    id: 'msg-7',
    title: 'SSL certificate expiring in 7 days',
    preview: 'Certificate for api.company.com expires on Apr 21, 2026.',
    type: 'notification',
    severity: 'medium',
    time: '2h ago',
    isRead: true,
    workspace: 'Production',
    source: 'AWS',
    isArchived: false,
  },
  {
    id: 'msg-8',
    title: 'Malware quarantined successfully',
    preview: 'Trojan.GenericKD.65432 quarantined on MacBook-Pro-JohnD.',
    type: 'alert',
    severity: 'high',
    time: '3h ago',
    isRead: true,
    workspace: 'Development',
    source: 'CrowdStrike',
    isArchived: false,
  },
  {
    id: 'msg-9',
    title: 'Scheduled maintenance window',
    preview: 'System maintenance scheduled for Apr 15, 2026 02:00–04:00 UTC.',
    type: 'system',
    severity: 'low',
    time: '5h ago',
    isRead: true,
    workspace: 'Production',
    source: 'Torq',
    isArchived: false,
  },
  {
    id: 'msg-10',
    title: 'OAuth token leaked in GitHub commit',
    preview: 'GitHub secret scanning alert triggered for private repo "private-api".',
    type: 'alert',
    severity: 'critical',
    time: '8h ago',
    isRead: false,
    workspace: 'Development',
    source: 'GitHub',
    isArchived: false,
  },
];

// ─── Source avatar colors ──────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: '#2864FF', text: '#fff' }, // brand blue
  { bg: '#0D9E6A', text: '#fff' }, // teal
  { bg: '#E07020', text: '#fff' }, // orange
  { bg: '#7C5CFC', text: '#fff' }, // purple
  { bg: '#D63A6A', text: '#fff' }, // rose
  { bg: '#0891B2', text: '#fff' }, // cyan
  { bg: '#B45309', text: '#fff' }, // amber
  { bg: '#374151', text: '#fff' }, // slate
];

function avatarColor(source: string) {
  let hash = 0;
  for (let i = 0; i < source.length; i++) hash = source.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

// ─── Source Avatar with severity badge ────────────────────────────────────

function SourceAvatar({ source, severity }: { source: string; severity: Severity }) {
  const color = avatarColor(source);
  const initials = source.slice(0, 2).toUpperCase();
  const sev = SEVERITY_CONFIG[severity];
  const SevIcon = sev.Icon;

  return (
    <div className="relative shrink-0">
      {/* Circle avatar */}
      <div
        className="h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-bold select-none"
        style={{ backgroundColor: color.bg, color: color.text }}
      >
        {initials}
      </div>
      {/* Severity badge — bottom-right of avatar */}
      <span
        className={`absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-[2px] border-[var(--color-surface-primary)] ${sev.bg}`}
      >
        <SevIcon className={`h-2.5 w-2.5 ${sev.color}`} strokeWidth={2.5} />
      </span>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: Severity }) {
  const cfg = SEVERITY_CONFIG[severity];
  const Icon = cfg.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[var(--radius-sm)] border px-1.5 py-0.5 text-[var(--font-size-xs)] font-medium ${cfg.color} ${cfg.bg} ${cfg.border}`}
    >
      <Icon className="h-2.5 w-2.5" />
      {cfg.label}
    </span>
  );
}

function TypeIcon({ type }: { type: MessageType }) {
  const cfg = TYPE_CONFIG[type];
  const Icon = cfg.Icon;
  return <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-tertiary)]" />;
}

// ─── Tooltip ──────────────────────────────────────────────────────────────

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="group/tip relative flex items-center">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-100">
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-neutral-800)] px-2 py-1 text-[var(--font-size-xs)] text-white whitespace-nowrap shadow-lg">
          {label}
        </div>
        <div className="mx-auto mt-0.5 h-1.5 w-1.5 rotate-45 bg-[var(--color-neutral-800)]" style={{ marginTop: '-4px', marginLeft: 'calc(50% - 3px)' }} />
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────

function EmptyState({ view }: { view: View }) {
  const config = {
    all: {
      icon: InboxIcon,
      title: 'Your inbox is clear',
      body: "No messages yet. We'll notify you when something needs attention.",
    },
    unread: {
      icon: InboxIcon,
      title: 'All caught up',
      body: 'No unread messages. You\'re up to date.',
    },
    archive: {
      icon: ArchiveIcon,
      title: 'Archive is empty',
      body: 'Messages you archive will appear here.',
    },
  }[view];
  const Icon = config.icon;
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3 py-16 px-8 text-center">
      <div className="rounded-full bg-[var(--color-surface-tertiary)] p-5">
        <Icon className="h-7 w-7 text-[var(--color-text-tertiary)]" />
      </div>
      <div>
        <p className="text-[var(--font-size-base)] font-semibold text-[var(--color-text-primary)]">
          {config.title}
        </p>
        <p className="mt-1 text-[var(--font-size-sm)] text-[var(--color-text-tertiary)]">
          {config.body}
        </p>
      </div>
    </div>
  );
}

// ─── Message Row ──────────────────────────────────────────────────────────

function MessageRow({
  msg,
  view,
  onMarkRead,
  onArchive,
  onRestore,
}: {
  msg: Message;
  view: View;
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative flex items-start gap-3 px-4 py-3.5 border-b border-[var(--color-border-1)] cursor-pointer transition-colors duration-150 ${
        hovered ? 'bg-[var(--color-surface-tertiary)]' : 'bg-[var(--color-surface-primary)]'
      }`}
    >
      {/* Avatar + severity badge */}
      <SourceAvatar source={msg.source} severity={msg.severity} />

      {/* Main content */}
      <div className="min-w-0 flex-1">

        {/* Row 1: title + timestamp with unread dot */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <p
            className={`text-[var(--font-size-sm)] leading-snug flex-1 min-w-0 ${
              msg.isRead
                ? 'font-normal text-[var(--color-text-secondary)]'
                : 'font-semibold text-[var(--color-text-primary)]'
            }`}
          >
            {msg.title}
          </p>

          {/* Timestamp + blue unread dot */}
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            <span className="text-[var(--font-size-xs)] text-[var(--color-neutral-350)] whitespace-nowrap">
              {msg.time}
            </span>
            {!msg.isRead && (
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary-500)] shrink-0" />
            )}
          </div>
        </div>

        {/* Row 2: preview */}
        <p className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)] line-clamp-2 leading-relaxed mb-2">
          {msg.preview}
        </p>

        {/* Row 3: severity + workspace */}
        <div className="flex items-center gap-1.5">
          <SeverityBadge severity={msg.severity} />
          <span className="flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--color-surface-tertiary)] px-1.5 py-0.5 text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">
            <Building2 className="h-3 w-3 shrink-0" />
            {msg.workspace}
          </span>
        </div>
      </div>

      {/* Hover action buttons — icon-only bar, Notion style */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.1 }}
            className="absolute right-3 top-2.5 flex items-center gap-0.5 rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] px-1 py-1 shadow-md"
          >
            {view !== 'archive' ? (
              <>
                <Tooltip label={msg.isRead ? 'Mark as unread' : 'Mark as read'}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onMarkRead(msg.id); }}
                    className="flex items-center justify-center rounded-[var(--radius-sm)] p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    {msg.isRead
                      ? <BellOff className="h-3.5 w-3.5" />
                      : <Check className="h-3.5 w-3.5" />
                    }
                  </button>
                </Tooltip>
                <Tooltip label="Archive">
                  <button
                    onClick={(e) => { e.stopPropagation(); onArchive(msg.id); }}
                    className="flex items-center justify-center rounded-[var(--radius-sm)] p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    <ArchiveIcon className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              </>
            ) : (
              <Tooltip label="Restore to inbox">
                <button
                  onClick={(e) => { e.stopPropagation(); onRestore(msg.id); }}
                  className="flex items-center justify-center rounded-[var(--radius-sm)] p-1.5 text-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)] transition-colors"
                >
                  <ArchiveRestore className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Filter config ────────────────────────────────────────────────────────

type NotifTypeId = 'mentions' | 'invitations' | 'approvals' | 'workflowFailed' | 'caseClosed';

const NOTIF_TYPES: { id: NotifTypeId; label: string; Icon: React.ElementType }[] = [
  { id: 'mentions',       label: 'Mentions',        Icon: AtSign },
  { id: 'invitations',    label: 'Invitations',      Icon: UserPlus },
  { id: 'approvals',      label: 'Approvals',        Icon: ThumbsUp },
  { id: 'workflowFailed', label: 'Workflow Failed',  Icon: XCircle },
  { id: 'caseClosed',     label: 'Case Closed',      Icon: FolderOpen },
];

const ALL_SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low'];

// ─── Filter Popover ──────────────────────────────────────────────────────

interface FilterState {
  notifTypes: NotifTypeId[];
  severities: Severity[];
}

// ─── Portal positioning hook ─────────────────────────────────────────────
// Computes fixed coords from an anchor element so popovers escape overflow:hidden

type PopoverAlign = 'right' | 'left';

function usePortalPos(
  anchorEl: HTMLElement | null,
  align: PopoverAlign = 'right',
  offsetY = 6,
) {
  const [pos, setPos] = useState<{ top: number; right?: number; left?: number } | null>(null);

  useEffect(() => {
    if (!anchorEl) return;
    const r = anchorEl.getBoundingClientRect();
    if (align === 'right') {
      setPos({ top: r.bottom + offsetY, right: window.innerWidth - r.right });
    } else {
      setPos({ top: r.bottom + offsetY, left: r.left });
    }
  }, [anchorEl, align, offsetY]);

  return pos;
}

// ─── Filter check row (checkbox reveals on hover or when selected) ─────────

function FilterCheckRow({
  label,
  Icon,
  checked,
  onToggle,
}: {
  label: string;
  Icon?: React.ElementType;
  checked: boolean;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
    >
      {/* Checkbox: invisible until hovered or checked */}
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border transition-all ${
          checked
            ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]'
            : hovered
            ? 'border-[var(--color-border-3)]'
            : 'invisible'
        }`}
      >
        {checked && <Check className="h-2.5 w-2.5 text-white" />}
      </span>
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}

// ─── Filter Popover (cascading, portalled) ────────────────────────────────

function FilterPopover({
  filter,
  onChange,
  onClose,
  anchorEl,
}: {
  filter: FilterState;
  onChange: (f: FilterState) => void;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<'notifType' | 'severity' | null>(null);
  const pos = usePortalPos(anchorEl, 'right');

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (ref.current?.contains(t) || anchorEl?.contains(t)) return;
      onClose();
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [onClose, anchorEl]);

  function toggleNotifType(id: NotifTypeId) {
    const next = filter.notifTypes.includes(id)
      ? filter.notifTypes.filter((x) => x !== id)
      : [...filter.notifTypes, id];
    onChange({ ...filter, notifTypes: next });
  }

  function toggleSeverity(s: Severity) {
    const next = filter.severities.includes(s)
      ? filter.severities.filter((x) => x !== s)
      : [...filter.severities, s];
    onChange({ ...filter, severities: next });
  }

  const hasFilters = filter.notifTypes.length > 0 || filter.severities.length > 0;

  if (!pos || typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      ref={ref}
      style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.13 }}
      className="w-52 rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] shadow-lg py-1"
      onMouseLeave={() => setActiveSubmenu(null)}
    >
      {/* Notification type row */}
      <div
        className={`relative flex items-center gap-2 px-3 py-2 text-[var(--font-size-sm)] cursor-default transition-colors ${
          activeSubmenu === 'notifType'
            ? 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-primary)]'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'
        }`}
        onMouseEnter={() => setActiveSubmenu('notifType')}
      >
        <span className="flex-1">Notification type</span>
        {filter.notifTypes.length > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-[9px] font-bold text-white">
            {filter.notifTypes.length}
          </span>
        )}
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-tertiary)]" />

        {/* Notification type submenu */}
        {activeSubmenu === 'notifType' && (
          <div className="absolute left-full top-0 ml-1 z-10 w-52 rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] shadow-lg py-1">
            {NOTIF_TYPES.map((t) => (
              <FilterCheckRow
                key={t.id}
                label={t.label}
                Icon={t.Icon}
                checked={filter.notifTypes.includes(t.id)}
                onToggle={() => toggleNotifType(t.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Severity row */}
      <div
        className={`relative flex items-center gap-2 px-3 py-2 text-[var(--font-size-sm)] cursor-default transition-colors ${
          activeSubmenu === 'severity'
            ? 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-primary)]'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'
        }`}
        onMouseEnter={() => setActiveSubmenu('severity')}
      >
        <span className="flex-1">Severity</span>
        {filter.severities.length > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-[9px] font-bold text-white">
            {filter.severities.length}
          </span>
        )}
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-tertiary)]" />

        {/* Severity submenu */}
        {activeSubmenu === 'severity' && (
          <div className="absolute left-full top-0 ml-1 z-10 w-48 rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] shadow-lg py-1">
            {ALL_SEVERITIES.map((s) => {
              const cfg = SEVERITY_CONFIG[s];
              const Icon = cfg.Icon;
              return (
                <FilterCheckRow
                  key={s}
                  label={cfg.label}
                  Icon={Icon}
                  checked={filter.severities.includes(s)}
                  onToggle={() => toggleSeverity(s)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Clear all */}
      {hasFilters && (
        <>
          <div className="my-1 border-t border-[var(--color-border-1)]" />
          <button
            onClick={() => { onChange({ notifTypes: [], severities: [] }); onClose(); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-red-500)] transition-colors"
          >
            <X className="h-3.5 w-3.5 shrink-0" />
            Clear all filters
          </button>
        </>
      )}
    </motion.div>,
    document.body,
  );
}

// ─── Workspace Popover ────────────────────────────────────────────────────

function WorkspacePopover({
  mode,
  selectedSingle,
  selectedMulti,
  onChange,
  onClose,
  anchorEl,
}: {
  mode: WorkspaceMode;
  selectedSingle: string;
  selectedMulti: string[];
  onChange: (mode: WorkspaceMode, single: string, multi: string[]) => void;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [localMode, setLocalMode] = useState<WorkspaceMode>(mode);
  const [localSingle, setLocalSingle] = useState(selectedSingle);
  const [localMulti, setLocalMulti] = useState<string[]>(selectedMulti);
  const pos = usePortalPos(anchorEl, 'left');

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (ref.current?.contains(t) || anchorEl?.contains(t)) return;
      onChange(localMode, localSingle, localMulti);
      onClose();
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [onClose, onChange, localMode, localSingle, localMulti, anchorEl]);

  function toggleMulti(ws: string) {
    setLocalMulti((prev) =>
      prev.includes(ws) ? prev.filter((x) => x !== ws) : [...prev, ws]
    );
  }

  const modeOptions: { id: WorkspaceMode; label: string }[] = [
    { id: 'all', label: 'All Workspaces' },
    { id: 'single', label: 'Single Workspace' },
    { id: 'multi', label: 'Multi-select' },
  ];

  if (!pos || typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      ref={ref}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="w-60 rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] shadow-lg"
    >
      <div className="p-2">
        {modeOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => {
              setLocalMode(opt.id);
              if (opt.id === 'all') {
                onChange('all', '', []);
                onClose();
              }
            }}
            className={`flex w-full items-center justify-between rounded-[var(--radius-sm)] px-3 py-2 text-[var(--font-size-sm)] transition-colors ${
              localMode === opt.id
                ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-500)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)]'
            }`}
          >
            {opt.label}
            {localMode === opt.id && <Check className="h-3.5 w-3.5" />}
          </button>
        ))}

        {(localMode === 'single' || localMode === 'multi') && (
          <>
            <div className="my-2 border-t border-[var(--color-border-1)]" />
            <div className="space-y-1">
              {WORKSPACES.map((ws) => {
                const isSelected =
                  localMode === 'single'
                    ? localSingle === ws
                    : localMulti.includes(ws);
                return (
                  <button
                    key={ws}
                    onClick={() => {
                      if (localMode === 'single') {
                        setLocalSingle(ws);
                        onChange('single', ws, []);
                        onClose();
                      } else {
                        toggleMulti(ws);
                      }
                    }}
                    className={`flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-[var(--font-size-sm)] transition-colors ${
                      isSelected
                        ? 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-primary)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)]'
                    }`}
                  >
                    {localMode === 'multi' && (
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-[2px] border transition-colors ${
                          isSelected
                            ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]'
                            : 'border-[var(--color-border-3)]'
                        }`}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                      </span>
                    )}
                    <Building2 className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
                    {ws}
                  </button>
                );
              })}
            </div>

            {localMode === 'multi' && (
              <div className="mt-2 px-2 pb-1">
                <button
                  onClick={() => {
                    onChange('multi', '', localMulti);
                    onClose();
                  }}
                  className="w-full rounded-[var(--radius-sm)] bg-[var(--color-primary-500)] py-1.5 text-[var(--font-size-sm)] font-semibold text-white hover:bg-[var(--color-primary-700)] transition-colors"
                >
                  Apply ({localMulti.length} selected)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>,
    document.body,
  );
}

// ─── More Menu ────────────────────────────────────────────────────────────

function MoreMenu({
  onMarkAllRead,
  onArchiveAll,
  onArchiveRead,
  onViewArchive,
  onClose,
  anchorEl,
}: {
  onMarkAllRead: () => void;
  onArchiveAll: () => void;
  onArchiveRead: () => void;
  onViewArchive: () => void;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pos = usePortalPos(anchorEl, 'right');

  useEffect(() => {
    function handler(e: MouseEvent) {
      const t = e.target as Node;
      if (ref.current?.contains(t) || anchorEl?.contains(t)) return;
      onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, anchorEl]);

  const btnClass =
    'flex w-full items-center gap-2.5 px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors';

  if (!pos || typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      ref={ref}
      style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
      initial={{ opacity: 0, scale: 0.95, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -6 }}
      transition={{ duration: 0.13 }}
      className="w-56 rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] shadow-lg py-1"
    >
      <button onClick={() => { onMarkAllRead(); onClose(); }} className={btnClass}>
        <CheckCheck className="h-3.5 w-3.5 shrink-0" />
        Mark all as read
      </button>
      <button onClick={() => { onArchiveAll(); onClose(); }} className={btnClass}>
        <ArchiveIcon className="h-3.5 w-3.5 shrink-0" />
        Archive all
      </button>
      <button onClick={() => { onArchiveRead(); onClose(); }} className={btnClass}>
        <ArchiveIcon className="h-3.5 w-3.5 shrink-0" />
        Archive read
      </button>
      <div className="my-1 border-t border-[var(--color-border-1)]" />
      <button onClick={() => { onViewArchive(); onClose(); }} className={btnClass}>
        <Eye className="h-3.5 w-3.5 shrink-0" />
        View archive
      </button>
      <div className="my-1 border-t border-[var(--color-border-1)]" />
      <button onClick={onClose} className={btnClass}>
        <Settings2 className="h-3.5 w-3.5 shrink-0" />
        Notifications settings
      </button>
    </motion.div>,
    document.body,
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────

export interface InboxPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InboxPanel({ isOpen, onClose }: InboxPanelProps) {
  const [view, setView] = useState<View>('all');
  const [prevView, setPrevView] = useState<'all' | 'unread'>('all');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [archiveSearch, setArchiveSearch] = useState('');
  const archiveSearchRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<FilterState>({ notifTypes: [], severities: [] });
  const [filterOpen, setFilterOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [headerHovered, setHeaderHovered] = useState(false);
  const [wsMode, setWsMode] = useState<WorkspaceMode>('all');
  const [wsSingle, setWsSingle] = useState('');
  const [wsMulti, setWsMulti] = useState<string[]>([]);
  const [wsOpen, setWsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Inbox layer refs
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const wsBtnRef = useRef<HTMLButtonElement>(null);
  // Archive drawer refs (separate — archive unmounting must not clear inbox refs)
  const archiveFilterBtnRef = useRef<HTMLButtonElement>(null);
  const archiveMoreBtnRef = useRef<HTMLButtonElement>(null);
  const archiveWsBtnRef = useRef<HTMLButtonElement>(null);

  const wsLabel =
    wsMode === 'all'
      ? 'All workspaces'
      : wsMode === 'single'
      ? wsSingle || 'Select workspace'
      : wsMulti.length === 0
      ? 'Select workspaces'
      : wsMulti.length === WORKSPACES.length
      ? 'All workspaces'
      : `${wsMulti.length} workspaces`;

  const handleMarkRead = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead: !m.isRead } : m))
    );
  }, []);

  const handleArchive = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isArchived: true } : m))
    );
  }, []);

  const handleRestore = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isArchived: false } : m))
    );
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setMessages((prev) =>
      prev.map((m) => (!m.isArchived ? { ...m, isRead: true } : m))
    );
  }, []);

  const handleArchiveAll = useCallback(() => {
    setMessages((prev) =>
      prev.map((m) => (!m.isArchived ? { ...m, isArchived: true } : m))
    );
  }, []);

  const handleArchiveRead = useCallback(() => {
    setMessages((prev) =>
      prev.map((m) => (!m.isArchived && m.isRead ? { ...m, isArchived: true } : m))
    );
  }, []);

  function removeSeverityFilter(s: Severity) {
    setFilter((f) => ({ ...f, severities: f.severities.filter((x) => x !== s) }));
  }
  function removeNotifTypeFilter(id: NotifTypeId) {
    setFilter((f) => ({ ...f, notifTypes: f.notifTypes.filter((x) => x !== id) }));
  }

  function matchesWorkspace(m: Message) {
    if (wsMode === 'all') return true;
    if (wsMode === 'single') return wsSingle ? m.workspace === wsSingle : true;
    if (wsMode === 'multi') return wsMulti.length === 0 || wsMulti.includes(m.workspace);
    return true;
  }

  function goToArchive() {
    if (view !== 'archive') setPrevView(view as 'all' | 'unread');
    setView('archive');
    setSearch('');
    setSearchOpen(false);
    setArchiveSearch('');
    setTimeout(() => archiveSearchRef.current?.focus(), 80);
  }

  function goBackFromArchive() {
    setView(prevView);
    setArchiveSearch('');
  }

  const inboxVisible = messages.filter((m) => {
    if (m.isArchived) return false;
    if (view === 'unread' && m.isRead) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase()) && !m.preview.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter.severities.length > 0 && !filter.severities.includes(m.severity)) return false;
    if (!matchesWorkspace(m)) return false;
    return true;
  });

  const archiveVisible = messages.filter((m) => {
    if (!m.isArchived) return false;
    if (archiveSearch && !m.title.toLowerCase().includes(archiveSearch.toLowerCase()) && !m.preview.toLowerCase().includes(archiveSearch.toLowerCase())) return false;
    if (filter.severities.length > 0 && !filter.severities.includes(m.severity)) return false;
    if (!matchesWorkspace(m)) return false;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.isArchived && !m.isRead).length;
  const activeFilterCount = filter.notifTypes.length + filter.severities.length;

  function toggleSearch() {
    setSearchOpen((o) => {
      if (!o) setTimeout(() => searchInputRef.current?.focus(), 50);
      else setSearch('');
      return !o;
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="inbox-panel"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 400, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          className="relative shrink-0 h-full overflow-hidden bg-[var(--color-surface-primary)] flex flex-col"
          style={{ minWidth: 0, boxShadow: '8px 0 32px 0 rgba(0,0,0,0.13), 1px 0 0 0 var(--color-border-2)', clipPath: 'inset(0 -60px 0 0)' }}
        >

          {/* ══════════════════════════════════════════════════
              BASE LAYER — Inbox (always rendered beneath)
          ══════════════════════════════════════════════════ */}

          {/* Inbox Row 1: Inbox | workspace | collapse | ⋮ */}
          <div
            className="flex items-center gap-2 px-4 pt-4 pb-3 shrink-0"
            onMouseEnter={() => setHeaderHovered(true)}
            onMouseLeave={() => setHeaderHovered(false)}
          >
            <span className="text-[var(--font-size-md)] font-bold text-[var(--color-text-primary)] leading-none">
              Inbox
            </span>

            {/* Workspace chip */}
            <div className="relative">
              <button
                ref={wsBtnRef}
                onClick={() => { setWsOpen((o) => !o); setFilterOpen(false); setMoreOpen(false); }}
                className="flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--color-neutral-100)] px-2.5 py-1 text-[var(--font-size-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-150)] transition-colors"
              >
                <span>{wsLabel}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${wsOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {wsOpen && (
                  <WorkspacePopover anchorEl={wsBtnRef.current} mode={wsMode} selectedSingle={wsSingle} selectedMulti={wsMulti}
                    onChange={(m, s, multi) => { setWsMode(m); setWsSingle(s); setWsMulti(multi); }}
                    onClose={() => setWsOpen(false)}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1" />

            {/* Collapse button — appears on header hover */}
            <AnimatePresence>
              {headerHovered && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.12 }}
                  onClick={onClose}
                  title="Collapse panel"
                  className="flex items-center justify-center rounded-[var(--radius-sm)] p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* ⋮ More menu */}
            <div className="relative">
              <button
                ref={moreBtnRef}
                onClick={() => { setMoreOpen((o) => !o); setFilterOpen(false); setWsOpen(false); }}
                className={`flex items-center justify-center rounded-[var(--radius-sm)] p-1.5 transition-colors ${moreOpen ? 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <MoreMenu anchorEl={moreBtnRef.current} onMarkAllRead={handleMarkAllRead}
                    onArchiveAll={handleArchiveAll} onArchiveRead={handleArchiveRead}
                    onViewArchive={goToArchive} onClose={() => setMoreOpen(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Inbox Row 2: Tabs ↔ inline search + filter */}
          <div className="flex items-center border-b border-[var(--color-border-2)] px-4 shrink-0 min-h-[40px]">
            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait" initial={false}>
                {searchOpen ? (
                  <motion.div key="search-input" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex items-center gap-2 py-2">
                    <button onClick={toggleSearch} className="flex items-center justify-center rounded-[var(--radius-sm)] p-1 shrink-0 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <input ref={searchInputRef} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search all notifications…" className="flex-1 min-w-0 bg-transparent text-[var(--font-size-sm)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none" />
                  </motion.div>
                ) : (
                  <motion.div key="tabs" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex items-center">
                    {([
                      { id: 'all' as const, label: 'All' },
                      { id: 'unread' as const, label: 'Unread', count: unreadCount },
                    ]).map((tab) => (
                      <button key={tab.id} onClick={() => setView(tab.id)}
                        className={`relative flex items-center gap-1.5 pb-2.5 pt-1 mr-4 text-[var(--font-size-sm)] transition-colors ${view === tab.id ? 'font-semibold text-[var(--color-text-primary)]' : 'font-normal text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
                      >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                          <span className="flex h-4 min-w-[18px] items-center justify-center rounded-full bg-[var(--color-primary-100)] px-1 text-[var(--font-size-xs)] font-semibold text-[var(--color-primary-500)]">
                            {tab.count}
                          </span>
                        )}
                        {view === tab.id && (
                          <motion.span layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[var(--color-text-primary)]" transition={{ duration: 0.18, ease: 'easeInOut' }} />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!searchOpen && (
              <button onClick={toggleSearch} className="flex items-center justify-center rounded-[var(--radius-sm)] p-1.5 mb-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors">
                <Search className="h-4 w-4" />
              </button>
            )}

            <div className="relative ml-0.5">
              <button
                ref={filterBtnRef}
                onClick={() => { setFilterOpen((o) => !o); setMoreOpen(false); setWsOpen(false); }}
                className={`flex items-center justify-center rounded-[var(--radius-sm)] p-1.5 mb-1 transition-colors ${filterOpen || activeFilterCount > 0 ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-500)]' : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
              >
                <ListFilter className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-[9px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {filterOpen && <FilterPopover anchorEl={filterBtnRef.current} filter={filter} onChange={setFilter} onClose={() => setFilterOpen(false)} />}
              </AnimatePresence>
            </div>
          </div>

          {/* Inbox active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--color-border-1)] px-4 py-2 shrink-0">
              {filter.severities.map((s) => {
                const cfg = SEVERITY_CONFIG[s];
                const Icon = cfg.Icon;
                return (
                  <span key={s} className={`inline-flex items-center gap-1 rounded-[var(--radius-full)] border px-2 py-0.5 text-[var(--font-size-xs)] font-medium ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                    <button onClick={() => removeSeverityFilter(s)} className="ml-0.5 rounded-full opacity-60 hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                  </span>
                );
              })}
              {filter.notifTypes.map((id) => {
                const cfg = NOTIF_TYPES.find((t) => t.id === id)!;
                const Icon = cfg.Icon;
                return (
                  <span key={id} className="inline-flex items-center gap-1 rounded-[var(--radius-full)] border border-[var(--color-border-2)] bg-[var(--color-surface-tertiary)] px-2 py-0.5 text-[var(--font-size-xs)] font-medium text-[var(--color-text-secondary)]">
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                    <button onClick={() => removeNotifTypeFilter(id)} className="ml-0.5 rounded-full opacity-60 hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                  </span>
                );
              })}
              <button onClick={() => setFilter({ notifTypes: [], severities: [] })} className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)] hover:text-[var(--color-red-500)] transition-colors ml-0.5">
                Clear all
              </button>
            </div>
          )}

          {/* Inbox message list */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {inboxVisible.length === 0 ? (
              <EmptyState view={view} />
            ) : (
              <motion.div layout>
                <AnimatePresence mode="popLayout">
                  {inboxVisible.map((msg) => (
                    <MessageRow key={msg.id} msg={msg} view={view} onMarkRead={handleMarkRead} onArchive={handleArchive} onRestore={handleRestore} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════
              ARCHIVE DRAWER — slides in over the inbox layer
              Enter / exit: x: '100%' ↔ x: 0  (left → right)
          ══════════════════════════════════════════════════ */}
          <AnimatePresence>
            {view === 'archive' && (
              <motion.div
                key="archive-drawer"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 bg-[var(--color-surface-primary)] flex flex-col z-10"
                style={{ boxShadow: '-4px 0 20px 0 rgba(0,0,0,0.08)' }}
              >
                {/* Archive Row 1: ← | Archived | workspace | ⋮ */}
                <div className="flex items-center gap-2 px-4 pt-4 pb-3 shrink-0">
                  <button
                    onClick={goBackFromArchive}
                    className="flex items-center justify-center rounded-[var(--radius-sm)] p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <span className="text-[var(--font-size-md)] font-bold text-[var(--color-text-primary)] leading-none">
                    Archived
                  </span>

                  {/* Workspace chip — uses archive-specific ref */}
                  <div className="relative">
                    <button
                      ref={archiveWsBtnRef}
                      onClick={() => { setWsOpen((o) => !o); setFilterOpen(false); setMoreOpen(false); }}
                      className="flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--color-neutral-100)] px-2.5 py-1 text-[var(--font-size-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-150)] transition-colors"
                    >
                      <span>{wsLabel}</span>
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${wsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {wsOpen && (
                        <WorkspacePopover anchorEl={archiveWsBtnRef.current} mode={wsMode} selectedSingle={wsSingle} selectedMulti={wsMulti}
                          onChange={(m, s, multi) => { setWsMode(m); setWsSingle(s); setWsMulti(multi); }}
                          onClose={() => setWsOpen(false)}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex-1" />

                  {/* ⋮ More menu — uses archive-specific ref */}
                  <div className="relative">
                    <button
                      ref={archiveMoreBtnRef}
                      onClick={() => { setMoreOpen((o) => !o); setFilterOpen(false); setWsOpen(false); }}
                      className={`flex items-center justify-center rounded-[var(--radius-sm)] p-1.5 transition-colors ${moreOpen ? 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    <AnimatePresence>
                      {moreOpen && (
                        <MoreMenu anchorEl={archiveMoreBtnRef.current} onMarkAllRead={handleMarkAllRead}
                          onArchiveAll={handleArchiveAll} onArchiveRead={handleArchiveRead}
                          onViewArchive={goToArchive} onClose={() => setMoreOpen(false)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Archive Row 2: always-visible search + filter */}
                <div className="flex items-center gap-2 border-b border-[var(--color-border-2)] px-4 py-2.5 shrink-0">
                  <Search className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-tertiary)]" />
                  <input
                    ref={archiveSearchRef}
                    value={archiveSearch}
                    onChange={(e) => setArchiveSearch(e.target.value)}
                    placeholder="Search in archive…"
                    className="flex-1 min-w-0 bg-transparent text-[var(--font-size-sm)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
                  />
                  {archiveSearch && (
                    <button onClick={() => setArchiveSearch('')} className="shrink-0 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {/* Filter — uses archive-specific ref */}
                  <div className="relative shrink-0">
                    <button
                      ref={archiveFilterBtnRef}
                      onClick={() => { setFilterOpen((o) => !o); setMoreOpen(false); setWsOpen(false); }}
                      className={`flex items-center justify-center rounded-[var(--radius-sm)] p-1 transition-colors ${filterOpen || activeFilterCount > 0 ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-500)]' : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
                    >
                      <ListFilter className="h-4 w-4" />
                      {activeFilterCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-[9px] font-bold text-white">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                    <AnimatePresence>
                      {filterOpen && <FilterPopover anchorEl={archiveFilterBtnRef.current} filter={filter} onChange={setFilter} onClose={() => setFilterOpen(false)} />}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Archive active filter chips */}
                {activeFilterCount > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--color-border-1)] px-4 py-2 shrink-0">
                    {filter.severities.map((s) => {
                      const cfg = SEVERITY_CONFIG[s];
                      const Icon = cfg.Icon;
                      return (
                        <span key={s} className={`inline-flex items-center gap-1 rounded-[var(--radius-full)] border px-2 py-0.5 text-[var(--font-size-xs)] font-medium ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                          <button onClick={() => removeSeverityFilter(s)} className="ml-0.5 rounded-full opacity-60 hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                        </span>
                      );
                    })}
                    {filter.notifTypes.map((id) => {
                      const cfg = NOTIF_TYPES.find((t) => t.id === id)!;
                      const Icon = cfg.Icon;
                      return (
                        <span key={id} className="inline-flex items-center gap-1 rounded-[var(--radius-full)] border border-[var(--color-border-2)] bg-[var(--color-surface-tertiary)] px-2 py-0.5 text-[var(--font-size-xs)] font-medium text-[var(--color-text-secondary)]">
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                          <button onClick={() => removeNotifTypeFilter(id)} className="ml-0.5 rounded-full opacity-60 hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                        </span>
                      );
                    })}
                    <button onClick={() => setFilter({ notifTypes: [], severities: [] })} className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)] hover:text-[var(--color-red-500)] transition-colors ml-0.5">
                      Clear all
                    </button>
                  </div>
                )}

                {/* Archive message list */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                  {archiveVisible.length === 0 ? (
                    <EmptyState view="archive" />
                  ) : (
                    <motion.div layout>
                      <AnimatePresence mode="popLayout">
                        {archiveVisible.map((msg) => (
                          <MessageRow key={msg.id} msg={msg} view="archive" onMarkRead={handleMarkRead} onArchive={handleArchive} onRestore={handleRestore} />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
