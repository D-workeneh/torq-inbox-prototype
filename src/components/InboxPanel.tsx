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
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = 'critical' | 'high' | 'medium' | 'low';
type NotifType = 'workflow-failed' | 'workflow-shared' | 'workspace-invite' | 'case-mention' | 'socrates-approval';
type View = 'all' | 'unread' | 'archive';
interface Message {
  id: string;
  type: NotifType;
  source: string;          // Row 1: sender name (user, "Torq", "Socrates AI")
  subHeader: string;       // Row 2: action + context, e.g. "Invited you · Torq-dev"
  preview: string;         // Row 3: body text (grey, truncated 1 line)
  severity: Severity;
  time: string;
  isRead: boolean;
  workspace: string;
  isArchived: boolean;
  targetPage?: string;     // page to navigate to on row click
  // Socrates approval only
  approvalAction?: string;
  approvalState?: 'pending' | 'approved' | 'rejected';
  // Workspace invite only
  inviteState?: 'pending' | 'accepted' | 'declined';
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

const TYPE_CONFIG: Record<NotifType, { label: string; Icon: React.ElementType; color: string }> = {
  'workflow-failed':    { label: 'Workflow failed',    Icon: XCircle,   color: '#EA231A' },
  'workflow-shared':    { label: 'Workflow shared',    Icon: Zap,       color: '#2864FF' },
  'workspace-invite':   { label: 'Workspace invite',  Icon: UserPlus,  color: '#9275FF' },
  'case-mention':       { label: 'Case mention',      Icon: AtSign,    color: '#FF8E2E' },
  'socrates-approval':  { label: 'Approval request',  Icon: ThumbsUp,  color: '#7C5CFC' },
};

type WSItem = { id: string; name: string; isCurrent?: boolean };
const WORKSPACES: WSItem[] = [
  { id: 'torq-dev',     name: 'Torq - dev',     isCurrent: true },
  { id: 'torq-staging', name: 'Torq - staging' },
  { id: 'torq-prod',    name: 'Torq - prod' },
  { id: 'acme-corp',    name: 'Acme Corp' },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    type: 'socrates-approval',
    source: 'Socrates AI',
    subHeader: 'Requesting approval · CASE-1001',
    preview: 'Socrates AI analyzed the ransomware incident on WIN-SERVER-01 and wants to isolate the endpoint from the network to contain the threat.',
    approvalAction: 'Isolate WIN-SERVER-01 from network',
    approvalState: 'pending',
    severity: 'critical',
    time: '2m ago',
    isRead: false,
    workspace: 'torq-dev',
    isArchived: false,
    targetPage: 'cases',
  },
  {
    id: 'msg-2',
    type: 'case-mention',
    source: 'Sarah Chen',
    subHeader: 'Mentioned you · CASE-1002',
    preview: '@david.w Can you review the TOR exit node IP list and confirm if 185.220.101.8 matches any known threat actor cluster?',
    severity: 'high',
    time: '8m ago',
    isRead: false,
    workspace: 'torq-prod',
    isArchived: false,
    targetPage: 'cases',
  },
  {
    id: 'msg-3',
    type: 'workspace-invite',
    source: 'Lihi Nachman',
    subHeader: 'Invited you · Torq - dev',
    preview: 'Lihi Nachman has invited you to collaborate with them in Torq, the no-code security automation platform for organizations.',
    severity: 'low',
    time: '15m ago',
    isRead: false,
    workspace: 'torq-dev',
    isArchived: false,
    inviteState: 'pending',
  },
  {
    id: 'msg-4',
    type: 'workflow-failed',
    source: 'Torq',
    subHeader: 'Workflow failed · Auto-Triage v2',
    preview: 'Failed at step 7 — Jira ticket creation. Error: API rate limit exceeded. 6 alerts were left unprocessed and require manual review.',
    severity: 'high',
    time: '22m ago',
    isRead: false,
    workspace: 'torq-staging',
    isArchived: false,
    targetPage: 'workflows',
  },
  {
    id: 'msg-5',
    type: 'socrates-approval',
    source: 'Socrates AI',
    subHeader: 'Requesting approval · CASE-1005',
    preview: 'Socrates AI is investigating the S3 data exfiltration incident and wants to block the identified IP range via AWS Security Group.',
    approvalAction: 'Block IP range 203.0.113.0/24 in AWS Security Group',
    approvalState: 'pending',
    severity: 'critical',
    time: '34m ago',
    isRead: false,
    workspace: 'torq-prod',
    isArchived: false,
    targetPage: 'cases',
  },
  {
    id: 'msg-6',
    type: 'workflow-shared',
    source: 'Michael Torres',
    subHeader: 'Shared workflow · Ransomware Response v3',
    preview: 'Michael Torres shared this workflow with you. It includes automated containment, forensic collection, and recovery orchestration steps.',
    severity: 'low',
    time: '1h ago',
    isRead: true,
    workspace: 'torq-dev',
    isArchived: false,
    targetPage: 'workflows',
  },
  {
    id: 'msg-7',
    type: 'case-mention',
    source: 'Alex Kim',
    subHeader: 'Mentioned you · CASE-1003',
    preview: '@david.w The phishing campaign targets CFO emails specifically. Can you review the email headers I attached and validate the IOCs?',
    severity: 'medium',
    time: '2h ago',
    isRead: true,
    workspace: 'torq-dev',
    isArchived: false,
    targetPage: 'cases',
  },
  {
    id: 'msg-8',
    type: 'workflow-failed',
    source: 'Torq',
    subHeader: 'Workflow failed · Threat Intel Enrichment',
    preview: 'Failed at step 3 — VirusTotal lookup. Error: Invalid API key. 12 IOCs were left unenriched and may require manual threat intelligence review.',
    severity: 'high',
    time: '3h ago',
    isRead: true,
    workspace: 'torq-staging',
    isArchived: false,
    targetPage: 'workflows',
  },
  {
    id: 'msg-9',
    type: 'workspace-invite',
    source: 'Alex Kim',
    subHeader: 'Invited you · Acme Corp',
    preview: 'Alex Kim has invited you to join the Acme Corp MSSP workspace. Accept to access their shared security workflows and case dashboards.',
    severity: 'low',
    time: '5h ago',
    isRead: true,
    workspace: 'acme-corp',
    isArchived: false,
    inviteState: 'pending',
  },
  {
    id: 'msg-10',
    type: 'workflow-shared',
    source: 'Sarah Chen',
    subHeader: 'Shared workflow · Phishing Response Playbook',
    preview: 'Sarah Chen shared this workflow with you. It includes automated email header analysis, user notification, and remediation orchestration.',
    severity: 'low',
    time: '8h ago',
    isRead: true,
    workspace: 'torq-prod',
    isArchived: false,
    targetPage: 'workflows',
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

// ─── Notification Avatar ───────────────────────────────────────────────────

function NotifAvatar({ msg }: { msg: Message }) {
  const isSocrates = msg.type === 'socrates-approval';
  const typeCfg = TYPE_CONFIG[msg.type];
  const TypeIconEl = typeCfg.Icon;

  if (isSocrates) {
    return (
      <div className="relative shrink-0">
        <div className="h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-bold select-none bg-[#7C5CFC] text-white">
          S
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-[2px] border-[var(--color-surface-primary)] bg-white shadow-sm">
          <TypeIconEl className="h-2.5 w-2.5 text-[var(--color-neutral-700)]" strokeWidth={2.5} />
        </span>
      </div>
    );
  }

  const color = avatarColor(msg.source);
  const initials = msg.source.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="relative shrink-0">
      <div className="h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-bold select-none"
        style={{ backgroundColor: color.bg, color: color.text }}>
        {initials}
      </div>
      <span className="absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-[2px] border-[var(--color-surface-primary)] bg-white shadow-sm">
        <TypeIconEl className="h-2.5 w-2.5 text-[var(--color-neutral-700)]" strokeWidth={2.5} />
      </span>
    </div>
  );
}

// ─── Severity → Tag color map ─────────────────────────────────────────────

const SEVERITY_TAG_COLOR: Record<Severity, 'critical' | 'error' | 'warning' | 'info'> = {
  critical: 'critical',
  high: 'warning',
  medium: 'warning',
  low: 'info',
};

// ─── Tooltip ─────────────────────────────────────────────────────────────
// Renders into document.body via portal so it is never clipped by any container.

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  function handleMouseEnter() {
    if (wrapRef.current) {
      const r = wrapRef.current.getBoundingClientRect();
      setPos({ top: r.top - 6, left: r.left + r.width / 2 });
    }
    setVisible(true);
  }

  return (
    <div ref={wrapRef} onMouseEnter={handleMouseEnter} onMouseLeave={() => setVisible(false)} className="flex items-center">
      {children}
      {visible && pos && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            transform: 'translateX(-50%) translateY(-100%)',
            zIndex: 99999,
            pointerEvents: 'none',
          }}
        >
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-neutral-800)] px-2 py-1 text-[var(--font-size-xs)] text-white whitespace-nowrap shadow-lg">
            {label}
          </div>
          <div
            className="bg-[var(--color-neutral-800)]"
            style={{ width: 6, height: 6, transform: 'rotate(45deg)', margin: '-3px auto 0' }}
          />
        </div>,
        document.body,
      )}
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
  onApprove,
  onReject,
  onAcceptInvite,
  onDeclineInvite,
  onUndoApproval,
  onUndoInvite,
  onNavigate,
}: {
  msg: Message;
  view: View;
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onAcceptInvite: (id: string) => void;
  onDeclineInvite: (id: string) => void;
  onUndoApproval: (id: string) => void;
  onUndoInvite: (id: string) => void;
  onNavigate: (pageId: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isSocrates = msg.type === 'socrates-approval';
  const isInvite = msg.type === 'workspace-invite';
  const hasTarget = !!msg.targetPage;

  function handleRowClick() {
    if (msg.targetPage) {
      onMarkRead(msg.id);
      onNavigate(msg.targetPage);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleRowClick}
      className={`relative flex items-start gap-3 px-4 py-3.5 border-b border-[#eeeef2] transition-colors duration-150 ${
        hasTarget ? 'cursor-pointer' : 'cursor-default'
      } ${hovered ? 'bg-[var(--color-surface-tertiary)]' : 'bg-[var(--color-surface-primary)]'}`}
    >
      {/* Avatar */}
      <NotifAvatar msg={msg} />

      {/* Main content */}
      <div className="min-w-0 flex-1">

        {/* Row 1: sender name + timestamp + unread dot */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)] truncate leading-snug">
            {msg.source}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[var(--font-size-xs)] text-[var(--color-neutral-350)] whitespace-nowrap">{msg.time}</span>
            {!msg.isRead && <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary-500)] shrink-0" />}
          </div>
        </div>

        {/* Row 2: action subheader */}
        <p className="text-[var(--font-size-xs)] font-medium text-[var(--color-text-secondary)] truncate leading-snug mb-1">
          {msg.subHeader}
        </p>

        {/* Row 3: body preview — grey, single line */}
        <p className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)] truncate leading-relaxed mb-2">
          {msg.preview}
        </p>

        {/* ── Socrates: approval action chip + Approve / Reject buttons ── */}
        {isSocrates && msg.approvalState === 'pending' && (
          <div className="mt-1 mb-1" onClick={(e) => e.stopPropagation()}>
            <Tag color="purple" appearance="bordered" size="md" icon={<ThumbsUp />} className="mb-2.5 w-full !rounded-[var(--radius-sm)]">
              <span className="truncate">{msg.approvalAction}</span>
            </Tag>
            <div className="flex items-center gap-2">
              <Button variant="success" size="sm" fullWidth leftIcon={<Check />} onClick={() => onApprove(msg.id)}>
                Approve
              </Button>
              <Button variant="secondary" size="sm" fullWidth leftIcon={<XCircle />} onClick={() => onReject(msg.id)}
                className="!text-[var(--color-red-500)] hover:!text-[var(--color-red-500)]">
                Reject
              </Button>
            </div>
          </div>
        )}

        {/* ── Socrates: resolved — minimal green/grey text + Undo ── */}
        {isSocrates && msg.approvalState && msg.approvalState !== 'pending' && (
          <div className="mb-1 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Check className="h-3.5 w-3.5 shrink-0 text-[#29CA88]" />
            <span className="text-[var(--font-size-xs)] font-medium text-[var(--color-neutral-600)]">
              {msg.approvalState === 'approved' ? 'Action approved' : 'Action rejected'}
            </span>
            <span className="text-[var(--color-neutral-300)] text-[var(--font-size-xs)] select-none">·</span>
            <button
              onClick={() => onUndoApproval(msg.id)}
              className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)] underline underline-offset-2 hover:text-[var(--color-text-primary)] transition-colors"
            >
              Undo
            </button>
          </div>
        )}

        {/* ── Workspace invite: Accept / Decline buttons ── */}
        {isInvite && msg.inviteState === 'pending' && (
          <div className="flex items-center gap-2 mb-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="primary" size="sm" fullWidth leftIcon={<Check />} onClick={() => onAcceptInvite(msg.id)}>
              Accept
            </Button>
            <Button variant="secondary" size="sm" fullWidth onClick={() => onDeclineInvite(msg.id)}>
              Decline
            </Button>
          </div>
        )}

        {/* ── Workspace invite: resolved — minimal text + Undo ── */}
        {isInvite && msg.inviteState && msg.inviteState !== 'pending' && (
          <div className="mb-1 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Check className="h-3.5 w-3.5 shrink-0 text-[#29CA88]" />
            <span className="text-[var(--font-size-xs)] font-medium text-[var(--color-neutral-600)]">
              {msg.inviteState === 'accepted' ? 'Invitation accepted' : 'Invitation declined'}
            </span>
            <span className="text-[var(--color-neutral-300)] text-[var(--font-size-xs)] select-none">·</span>
            <button
              onClick={() => onUndoInvite(msg.id)}
              className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)] underline underline-offset-2 hover:text-[var(--color-text-primary)] transition-colors"
            >
              Undo
            </button>
          </div>
        )}

        {/* Meta row: type badge + workspace chip */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <Tag color="neutral" appearance="subtle" size="sm"
            className="!rounded-[var(--radius-sm)]"
            style={{ backgroundColor: `${TYPE_CONFIG[msg.type].color}14`, color: TYPE_CONFIG[msg.type].color } as React.CSSProperties}>
            {TYPE_CONFIG[msg.type].label}
          </Tag>
          <Tag color="neutral" appearance="surface" size="sm" icon={<Building2 />}>
            {WORKSPACES.find((w) => w.id === msg.workspace)?.name ?? msg.workspace}
          </Tag>
        </div>
      </div>

      {/* Hover action buttons */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.1 }}
            className="absolute right-3 top-2.5 flex items-center gap-0.5 rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] px-1 py-1 shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            {view !== 'archive' ? (
              <>
                <Tooltip label={msg.isRead ? 'Mark as unread' : 'Mark as read'}>
                  <button onClick={(e) => { e.stopPropagation(); onMarkRead(msg.id); }}
                    className="flex items-center justify-center rounded-[var(--radius-sm)] p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                    {msg.isRead ? <BellOff className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                  </button>
                </Tooltip>
                <Tooltip label="Archive">
                  <button onClick={(e) => { e.stopPropagation(); onArchive(msg.id); }}
                    className="flex items-center justify-center rounded-[var(--radius-sm)] p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                    <ArchiveIcon className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              </>
            ) : (
              <Tooltip label="Restore to inbox">
                <button onClick={(e) => { e.stopPropagation(); onRestore(msg.id); }}
                  className="flex items-center justify-center rounded-[var(--radius-sm)] p-1.5 text-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)] transition-colors">
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

type NotifTypeId = NotifType;

const NOTIF_TYPES: { id: NotifTypeId; label: string; Icon: React.ElementType }[] = [
  { id: 'workflow-failed',    label: 'Workflow Failed',   Icon: XCircle },
  { id: 'workflow-shared',    label: 'Workflow Shared',   Icon: Zap },
  { id: 'workspace-invite',   label: 'Workspace Invite',  Icon: UserPlus },
  { id: 'case-mention',       label: 'Case Mention',      Icon: AtSign },
  { id: 'socrates-approval',  label: 'Approval Request',  Icon: ThumbsUp },
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
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pos = usePortalPos(anchorEl, 'right');

  function scheduleHide() {
    hideTimerRef.current = setTimeout(() => setActiveSubmenu(null), 200);
  }
  function cancelHide() {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }

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
      onMouseLeave={scheduleHide}
      onMouseEnter={cancelHide}
    >
      {/* Notification type row */}
      <div
        className={`relative flex items-center gap-2 px-3 py-2 text-[var(--font-size-sm)] cursor-default transition-colors ${
          activeSubmenu === 'notifType'
            ? 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-primary)]'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'
        }`}
        onMouseEnter={() => { cancelHide(); setActiveSubmenu('notifType'); }}
      >
        <span className="flex-1">Notification type</span>
        {filter.notifTypes.length > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-[9px] font-bold text-white">
            {filter.notifTypes.length}
          </span>
        )}
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-tertiary)]" />

        {/* Notification type submenu — negative left margin bridges the gap so hover is seamless */}
        {activeSubmenu === 'notifType' && (
          <div
            className="absolute left-full top-0 -ml-px z-10 w-52 rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] shadow-lg py-1"
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
          >
            {/* invisible left-side bridge strip so diagonal cursor movement is captured */}
            <div className="absolute inset-y-0 -left-2 w-2" onMouseEnter={cancelHide} />
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
        onMouseEnter={() => { cancelHide(); setActiveSubmenu('severity'); }}
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
          <div
            className="absolute left-full top-0 -ml-px z-10 w-48 rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] shadow-lg py-1"
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
          >
            {/* invisible left-side bridge strip */}
            <div className="absolute inset-y-0 -left-2 w-2" onMouseEnter={cancelHide} />
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

function WsCheckbox({ checked, partial }: { checked: boolean; partial?: boolean }) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
        checked || partial
          ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]'
          : 'border-[var(--color-border-3)] bg-white'
      }`}
    >
      {checked && !partial && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
      {partial && <span className="h-0.5 w-2 rounded-full bg-white" />}
    </span>
  );
}

function WorkspacePopover({
  selected,
  onChange,
  onClose,
  anchorEl,
}: {
  selected: string[];   // empty = all workspaces
  onChange: (ids: string[]) => void;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [local, setLocal] = useState<string[]>(selected);
  const pos = usePortalPos(anchorEl, 'left');

  useEffect(() => {
    function handler(e: MouseEvent) {
      const t = e.target as Node;
      if (ref.current?.contains(t) || anchorEl?.contains(t)) return;
      onChange(local);
      onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, onChange, local, anchorEl]);

  const allSelected = local.length === 0;
  const filtered = WORKSPACES.filter((ws) =>
    ws.name.toLowerCase().includes(query.toLowerCase())
  );

  function toggleAll() {
    setLocal([]);
    onChange([]);
  }

  function toggleWs(id: string) {
    const next = local.includes(id)
      ? local.filter((x) => x !== id)
      : [...local, id];
    // if all are checked, collapse to "all" (empty)
    setLocal(next.length === WORKSPACES.length ? [] : next);
  }

  if (!pos || typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      ref={ref}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.14 }}
      className="w-56 rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] shadow-xl overflow-hidden"
    >
      {/* Search */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border-1)] px-3 py-2.5">
        <Search className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-tertiary)]" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find workspace..."
          className="flex-1 bg-transparent text-[var(--font-size-sm)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
        />
      </div>

      <div className="py-1">
        {/* All workspaces row */}
        <button
          onClick={toggleAll}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] transition-colors"
        >
          <WsCheckbox checked={allSelected} partial={!allSelected && local.length > 0} />
          <span className="flex-1 text-left font-medium">
            All workspaces ({WORKSPACES.length})
          </span>
        </button>

        <div className="mx-3 my-1 border-t border-[var(--color-border-1)]" />

        {/* Individual workspace rows */}
        {filtered.map((ws) => {
          const isChecked = allSelected || local.includes(ws.id);
          return (
            <button
              key={ws.id}
              onClick={() => toggleWs(ws.id)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-[var(--font-size-sm)] hover:bg-[var(--color-surface-tertiary)] transition-colors"
            >
              <WsCheckbox checked={isChecked} />
              <span className="flex flex-col items-start min-w-0">
                <span className="truncate text-[var(--color-text-primary)]">{ws.name}</span>
                {ws.isCurrent && (
                  <span className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">
                    Current workspace
                  </span>
                )}
              </span>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p className="px-3 py-3 text-center text-[var(--font-size-sm)] text-[var(--color-text-tertiary)]">
            No workspaces found
          </p>
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
  onNavigate: (pageId: string) => void;
}

export function InboxPanel({ isOpen, onClose, onNavigate }: InboxPanelProps) {
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
  const [wsFilter, setWsFilter] = useState<string[]>([]);  // empty = all
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
  // Undo archive toast
  const [undoToast, setUndoToast] = useState<{ ids: string[]; label: string } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (undoTimerRef.current) clearTimeout(undoTimerRef.current); }, []);

  const wsLabel =
    wsFilter.length === 0
      ? 'All workspaces'
      : wsFilter.length === 1
      ? (WORKSPACES.find((w) => w.id === wsFilter[0])?.name ?? wsFilter[0])
      : `${wsFilter.length} workspaces`;

  const handleMarkRead = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead: !m.isRead } : m))
    );
  }, []);

  const handleArchive = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isArchived: true } : m)));
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoToast({ ids: [id], label: 'Archived' });
    undoTimerRef.current = setTimeout(() => setUndoToast(null), 3500);
  }, []);

  const handleUndoArchive = useCallback(() => {
    setUndoToast((toast) => {
      if (!toast) return null;
      setMessages((prev) =>
        prev.map((m) => (toast.ids.includes(m.id) ? { ...m, isArchived: false } : m))
      );
      return null;
    });
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
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

  const handleApprove = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, approvalState: 'approved', isRead: true } : m))
    );
  }, []);

  const handleReject = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, approvalState: 'rejected', isRead: true } : m))
    );
  }, []);

  const handleUndoApproval = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, approvalState: 'pending', isRead: false } : m))
    );
  }, []);

  const handleAcceptInvite = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, inviteState: 'accepted', isRead: true } : m))
    );
  }, []);

  const handleDeclineInvite = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, inviteState: 'declined', isRead: true } : m))
    );
  }, []);

  const handleUndoInvite = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, inviteState: 'pending', isRead: false } : m))
    );
  }, []);

  function removeSeverityFilter(s: Severity) {
    setFilter((f) => ({ ...f, severities: f.severities.filter((x) => x !== s) }));
  }
  function removeNotifTypeFilter(id: NotifTypeId) {
    setFilter((f) => ({ ...f, notifTypes: f.notifTypes.filter((x) => x !== id) }));
  }

  function matchesWorkspace(m: Message) {
    if (wsFilter.length === 0) return true;
    return wsFilter.includes(m.workspace);
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
    if (search) {
      const q = search.toLowerCase();
      const match = m.source.toLowerCase().includes(q) || m.subHeader.toLowerCase().includes(q) || m.preview.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filter.severities.length > 0 && !filter.severities.includes(m.severity)) return false;
    if (filter.notifTypes.length > 0 && !filter.notifTypes.includes(m.type as NotifTypeId)) return false;
    if (!matchesWorkspace(m)) return false;
    return true;
  });

  const archiveVisible = messages.filter((m) => {
    if (!m.isArchived) return false;
    if (archiveSearch) {
      const q = archiveSearch.toLowerCase();
      const match = m.source.toLowerCase().includes(q) || m.subHeader.toLowerCase().includes(q) || m.preview.toLowerCase().includes(q);
      if (!match) return false;
    }
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
                  <WorkspacePopover
                    anchorEl={wsBtnRef.current}
                    selected={wsFilter}
                    onChange={setWsFilter}
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
                  <Tag key={s} color={SEVERITY_TAG_COLOR[s]} appearance="bordered" size="sm"
                    icon={<Icon />} onRemove={() => removeSeverityFilter(s)}>
                    {cfg.label}
                  </Tag>
                );
              })}
              {filter.notifTypes.map((id) => {
                const cfg = NOTIF_TYPES.find((t) => t.id === id)!;
                const Icon = cfg.Icon;
                return (
                  <Tag key={id} color="neutral" appearance="surface" size="sm"
                    icon={<Icon />} onRemove={() => removeNotifTypeFilter(id)}>
                    {cfg.label}
                  </Tag>
                );
              })}
              <Button variant="ghost" size="sm" onClick={() => setFilter({ notifTypes: [], severities: [] })}
                className="!h-auto !px-1.5 !py-0.5 !text-[var(--font-size-xs)] !text-[var(--color-text-tertiary)] hover:!text-[var(--color-red-500)]">
                Clear all
              </Button>
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
                    <MessageRow key={msg.id} msg={msg} view={view} onMarkRead={handleMarkRead} onArchive={handleArchive} onRestore={handleRestore} onApprove={handleApprove} onReject={handleReject} onAcceptInvite={handleAcceptInvite} onDeclineInvite={handleDeclineInvite} onUndoApproval={handleUndoApproval} onUndoInvite={handleUndoInvite} onNavigate={onNavigate} />
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
                        <WorkspacePopover
                          anchorEl={archiveWsBtnRef.current}
                          selected={wsFilter}
                          onChange={setWsFilter}
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
                        <Tag key={s} color={SEVERITY_TAG_COLOR[s]} appearance="bordered" size="sm"
                          icon={<Icon />} onRemove={() => removeSeverityFilter(s)}>
                          {cfg.label}
                        </Tag>
                      );
                    })}
                    {filter.notifTypes.map((id) => {
                      const cfg = NOTIF_TYPES.find((t) => t.id === id)!;
                      const Icon = cfg.Icon;
                      return (
                        <Tag key={id} color="neutral" appearance="surface" size="sm"
                          icon={<Icon />} onRemove={() => removeNotifTypeFilter(id)}>
                          {cfg.label}
                        </Tag>
                      );
                    })}
                    <Button variant="ghost" size="sm" onClick={() => setFilter({ notifTypes: [], severities: [] })}
                      className="!h-auto !px-1.5 !py-0.5 !text-[var(--font-size-xs)] !text-[var(--color-text-tertiary)] hover:!text-[var(--color-red-500)]">
                      Clear all
                    </Button>
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
                          <MessageRow key={msg.id} msg={msg} view="archive" onMarkRead={handleMarkRead} onArchive={handleArchive} onRestore={handleRestore} onApprove={handleApprove} onReject={handleReject} onAcceptInvite={handleAcceptInvite} onDeclineInvite={handleDeclineInvite} onUndoApproval={handleUndoApproval} onUndoInvite={handleUndoInvite} onNavigate={onNavigate} />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Undo archive toast ── */}
          <AnimatePresence>
            {undoToast && (
              <motion.div
                key="undo-toast"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
                className="absolute bottom-4 left-3 right-3 z-20 flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-neutral-800)] px-3 py-2.5 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#29CA88] shrink-0" />
                  <span className="text-[var(--font-size-xs)] text-[var(--color-neutral-100)]">{undoToast.label}</span>
                </div>
                <button
                  onClick={handleUndoArchive}
                  className="text-[var(--font-size-xs)] text-[var(--color-neutral-300)] underline underline-offset-2 hover:text-white transition-colors ml-3"
                >
                  Undo
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
