'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Bot,
  Loader2,
  Shield,
  Layers,
} from 'lucide-react';
import {
  NOTIFICATION_MVP_GROUPS,
  NOTIF_SETTINGS_SAVED_EVENT,
  NOTIF_SETTINGS_STORAGE_KEY,
  getInitialNotificationSettingsState,
  pillarInAppDelivering,
  saveQuickEnablePillar,
  type NotifChannelState,
  type NotifPillar,
} from '@/lib/notificationSettingsStorage';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { FilterChip, AppliedFiltersBar } from '@/components/ui/FilterChip';
import { Tag, SeverityTag } from '@/components/ui/Tag';
import type { SeverityLevel } from '@/components/ui/Tag';
import type { TagColor } from '@/components/ui/Tag';

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = 'critical' | 'high' | 'medium' | 'low';
type NotifType = 'workflow-failed' | 'workflow-shared' | 'workspace-invite' | 'case-mention' | 'socrates-approval';
type View = 'all' | 'unread' | 'needs-action' | 'archive';
interface Message {
  id: string;
  type: NotifType;
  source: string;          // Row 1: sender name (user, "Torq", "Socrates AI")
  subHeader: string;       // Row 2: action + context, e.g. "Invited you · Torq-dev"
  preview: string;         // Row 3: body text (grey, truncated 1 line)
  groupedCount?: number;   // Repeated notifications grouped into this one by throttling
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
  iconClass: string;
  Icon: React.ElementType;
}> = {
  critical: { label: 'Critical', iconClass: 'text-[var(--viz-critical)]', Icon: AlertOctagon },
  high: { label: 'High', iconClass: 'text-[var(--viz-high)]', Icon: AlertTriangle },
  medium: { label: 'Medium', iconClass: 'text-[var(--viz-medium)]', Icon: AlertCircle },
  low: { label: 'Low', iconClass: 'text-[var(--viz-neutral)]', Icon: Info },
};

const TYPE_CONFIG: Record<NotifType, { label: string; Icon: React.ElementType; color: string; tagColor: TagColor }> = {
  'workflow-failed':    { label: 'Workflow failed',   Icon: XCircle,  color: '#EA231A', tagColor: 'error'   },
  'workflow-shared':    { label: 'Workflow shared',   Icon: Zap,      color: '#2864FF', tagColor: 'primary' },
  'workspace-invite':   { label: 'Workspace invite', Icon: UserPlus, color: '#9275FF', tagColor: 'purple'  },
  'case-mention':       { label: 'Case mention',     Icon: AtSign,   color: '#FF8E2E', tagColor: 'warning' },
  'socrates-approval':  { label: 'Approval request', Icon: ThumbsUp, color: '#7C5CFC', tagColor: 'purple'  },
};

function messagePillar(m: Message): NotifPillar {
  switch (m.type) {
    case 'workflow-failed':
    case 'workflow-shared':
      return 'hyperautomation';
    case 'workspace-invite':
      return 'platform';
    case 'case-mention':
      return 'hypersoc';
    case 'socrates-approval':
      return 'socrates';
  }
}

function messageNeedsAction(m: Message): boolean {
  return m.approvalState === 'pending' || m.inviteState === 'pending';
}

type WSItem = { id: string; name: string; isCurrent?: boolean };
const WORKSPACES: WSItem[] = [
  { id: 'torq-dev', name: 'torq-dev', isCurrent: true },
  { id: 'torq-staging', name: 'Genesis-Dev-58' },
  { id: 'torq-prod', name: 'Pinnacle-Prod' },
  { id: 'acme-corp', name: 'acme-corp' },
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
    subHeader: 'Invited you · torq-dev',
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
    subHeader: 'Grouped workflow failures · Auto-Triage v2',
    preview: '6 workflow failure alerts from the last 10 min were grouped into one notification. Open to review all affected runs and the latest error details.',
    groupedCount: 6,
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
    time: '2d ago',
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
    time: '4d ago',
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
    time: '2w ago',
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
    time: '3w ago',
    isRead: true,
    workspace: 'torq-prod',
    isArchived: false,
    targetPage: 'workflows',
  },
];

// ─── Time grouping ─────────────────────────────────────────────────────────

function getTimeGroup(time: string): string {
  const m = time.match(/^(\d+)(m|h|d|w)\s+ago$/);
  if (!m) return 'Earlier';
  const val = parseInt(m[1]);
  const unit = m[2];
  let minutes = val;
  if (unit === 'h') minutes = val * 60;
  if (unit === 'd') minutes = val * 60 * 24;
  if (unit === 'w') minutes = val * 60 * 24 * 7;
  if (minutes < 60 * 24) return 'Today';
  if (minutes < 60 * 24 * 7) return 'This week';
  return 'Earlier';
}

function TimeSectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 pt-4 pb-1.5">
      <span className="text-[length:var(--font-size-body2)] font-medium select-none text-[var(--text-tertiary)]">
        {label}
      </span>
    </div>
  );
}

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

/** Torq wordmark — three left-aligned bars of decreasing width */
function TorqLogoMark() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0"  width="20" height="3" rx="1.5" fill="white"/>
      <rect x="0" y="5.5" width="13" height="3" rx="1.5" fill="white"/>
      <rect x="0" y="11" width="7"  height="3" rx="1.5" fill="white"/>
    </svg>
  );
}

function NotifAvatar({ msg }: { msg: Message }) {
  const isSocrates = msg.type === 'socrates-approval';
  const isTorq = msg.source === 'Torq';
  const typeCfg = TYPE_CONFIG[msg.type];
  const TypeIconEl = typeCfg.Icon;

  const badge = (
    <span className="absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-[2px] border-[var(--surface)] bg-white shadow-sm">
      <TypeIconEl className="h-2.5 w-2.5 text-[var(--neutral-9)]" strokeWidth={2.5} />
    </span>
  );

  if (isSocrates) {
    return (
      <div className="relative shrink-0">
        <div className="h-9 w-9 rounded-full flex items-center justify-center select-none bg-[#7C5CFC] text-white">
          <Bot className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
        {badge}
      </div>
    );
  }

  if (isTorq) {
    return (
      <div className="relative shrink-0">
        <div className="h-9 w-9 rounded-full flex items-center justify-center select-none bg-[var(--neutral-12)]">
          <TorqLogoMark />
        </div>
        {badge}
      </div>
    );
  }

  const color = avatarColor(msg.source);
  const initials = msg.source[0].toUpperCase();

  return (
    <div className="relative shrink-0">
      <div className="h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-bold select-none"
        style={{ backgroundColor: color.bg, color: color.text }}>
        {initials}
      </div>
      {badge}
    </div>
  );
}

// ─── Severity → Tag color map ─────────────────────────────────────────────

// Critical=Red  High=Orange  Medium=Yellow  Low=Grey
const SEVERITY_TAG_COLOR: Record<Severity, 'critical' | 'warning' | 'yellow' | 'neutral'> = {
  critical: 'critical',
  high: 'warning',
  medium: 'yellow',
  low: 'neutral',
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
          <div className="rounded-[var(--radius-sm)] bg-[var(--neutral-10)] px-2 py-1 text-[length:var(--font-size-body2)] text-white whitespace-nowrap shadow-lg">
            {label}
          </div>
          <div
            className="bg-[var(--neutral-10)]"
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
    'needs-action': {
      icon: AlertTriangle,
      title: 'No actions pending',
      body: 'Approvals and invites that need your response will appear here.',
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
      <div className="rounded-full bg-[var(--bg-hover-level-2)] p-5">
        <Icon className="h-7 w-7 text-[var(--text-tertiary)]" />
      </div>
      <div>
        <p className="text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)]">
          {config.title}
        </p>
        <p className="mt-1 text-[length:var(--font-size-body1)] text-[var(--text-tertiary)]">
          {config.body}
        </p>
      </div>
    </div>
  );
}

// ─── Countdown Undo Button ─────────────────────────────────────────────────

const COUNTDOWN_MS = 4000;
const DEBOUNCE_MS  = 500;
const EXECUTING_MS = 800;

type ActionPhase = 'idle' | 'countdown' | 'executing';
type PendingAction = 'approved' | 'rejected' | 'accepted' | 'declined';

/** Animated conic-gradient border that sweeps away over COUNTDOWN_MS. */
function CountdownUndoButton({
  progress,
  enabled,
  onUndo,
}: {
  progress: number;   // 1 = full ring, 0 = empty
  enabled: boolean;   // false during 500ms debounce
  onUndo: () => void;
}) {
  const deg = progress * 360;
  return (
    <div
      style={{
        display: 'inline-flex',
        padding: '1.5px',
        borderRadius: 'calc(var(--radius-sm) + 1.5px)',
        background: `conic-gradient(
          from -90deg,
          var(--ruby-10) 0deg,
          var(--ruby-10) ${deg}deg,
          var(--border-level-2) ${deg}deg,
          var(--border-level-2) 360deg
        )`,
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); if (enabled) onUndo(); }}
        disabled={!enabled}
        style={{ borderRadius: 'var(--radius-sm)' }}
        className={`flex items-center gap-1.5 px-3 bg-[var(--surface)] text-[length:var(--font-size-body1)] font-medium transition-colors select-none whitespace-nowrap ${
          enabled
            ? 'text-[var(--ruby-10)] cursor-pointer hover:bg-[var(--ruby-1)]'
            : 'text-[var(--text-disabled)] cursor-not-allowed'
        }`}
      >
        Undo
      </button>
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
  const isInvite   = msg.type === 'workspace-invite';
  const hasTarget  = !!msg.targetPage;

  // ── Action state machine ──────────────────────────────────────────────
  const [actionPhase, setActionPhase]         = useState<ActionPhase>('idle');
  const [pendingAction, setPendingAction]     = useState<PendingAction | null>(null);
  const [countdownProgress, setProgress]      = useState(1);
  const [undoBtnEnabled, setUndoBtnEnabled]   = useState(false);

  const phaseTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimer= useRef<ReturnType<typeof setTimeout> | null>(null);
  const execTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef       = useRef<number | null>(null);
  const startRef     = useRef(0);

  // Cleanup on unmount
  useEffect(() => () => {
    if (phaseTimer.current)    clearTimeout(phaseTimer.current);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (execTimer.current)     clearTimeout(execTimer.current);
    if (rafRef.current)        cancelAnimationFrame(rafRef.current);
  }, []);

  function startCountdown(action: PendingAction) {
    setActionPhase('countdown');
    setPendingAction(action);
    setProgress(1);
    setUndoBtnEnabled(false);

    // 500ms debounce before Undo is clickable
    debounceTimer.current = setTimeout(() => setUndoBtnEnabled(true), DEBOUNCE_MS);

    // rAF-driven progress
    startRef.current = performance.now();
    function tick(now: number) {
      const elapsed = now - startRef.current;
      const p = Math.max(0, 1 - elapsed / COUNTDOWN_MS);
      setProgress(p);
      if (p > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);

    // After COUNTDOWN_MS → execute phase
    phaseTimer.current = setTimeout(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setActionPhase('executing');
      setProgress(0);

      // After EXECUTING_MS → commit
      execTimer.current = setTimeout(() => {
        setActionPhase('idle');
        if (action === 'approved')  { onApprove(msg.id);      onMarkRead(msg.id); }
        if (action === 'rejected')  { onReject(msg.id);       onMarkRead(msg.id); }
        if (action === 'accepted')  { onAcceptInvite(msg.id); onMarkRead(msg.id); }
        if (action === 'declined')  { onDeclineInvite(msg.id); onMarkRead(msg.id); }
      }, EXECUTING_MS);
    }, COUNTDOWN_MS);
  }

  function handleUndo() {
    if (!undoBtnEnabled) return;
    if (phaseTimer.current)    clearTimeout(phaseTimer.current);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (execTimer.current)     clearTimeout(execTimer.current);
    if (rafRef.current)        cancelAnimationFrame(rafRef.current);
    setActionPhase('idle');
    setPendingAction(null);
    setProgress(1);
    setUndoBtnEnabled(false);
  }

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
      className={`relative flex items-start gap-3 px-4 py-3.5 transition-colors duration-150 ${
        hasTarget ? 'cursor-pointer' : 'cursor-default'
      } ${hovered ? 'bg-[var(--bg-hover-level-2)]' : 'bg-[var(--surface)]'}`}
    >
      {/* Avatar */}
      <NotifAvatar msg={msg} />

      {/* Main content */}
      <div className="min-w-0 flex-1">

        {/* Row 1: sender name + timestamp + unread dot */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)] truncate leading-snug">
            {msg.source}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[length:var(--font-size-body2)] text-[var(--neutral-6)] whitespace-nowrap">{msg.time}</span>
            {!msg.isRead && <span className="h-1.5 w-1.5 rounded-full bg-[var(--switch-bg-on-idle)] shrink-0" aria-hidden />}
          </div>
        </div>

        {/* Row 2: action subheader */}
        <p className="text-[length:var(--font-size-body2)] font-medium text-[var(--text-secondary)] truncate leading-snug mb-1">
          {msg.subHeader}
        </p>

        {/* Row 3: body preview — grey, single line */}
        <p className="text-[length:var(--font-size-body2)] truncate leading-relaxed mb-2 text-[var(--text-tertiary)]">
          {msg.preview}
        </p>

        {msg.groupedCount && msg.groupedCount > 1 && (
          <div className="mb-2 inline-flex max-w-full items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border-level-2)] bg-[var(--bg-static-2)] px-2 py-1">
            <Layers className="h-3 w-3 shrink-0 text-[var(--text-secondary)]" strokeWidth={2} />
            <span className="truncate text-[length:var(--font-size-body2)] font-medium text-[var(--text-secondary)]">
              Contains {msg.groupedCount} grouped notifications
            </span>
          </div>
        )}

        {/* ── Socrates: action chip ── */}
        {isSocrates && msg.approvalState === 'pending' && (
          <div className="flex items-center gap-1.5 mb-2 rounded-[var(--radius-sm)] bg-[var(--lilac-1)] border border-[var(--lilac-1)] px-2.5 py-1.5 min-w-0 overflow-hidden">
            <ThumbsUp className="h-3 w-3 text-[var(--lilac-10)] shrink-0" />
            <span className="text-[length:var(--font-size-body2)] text-[var(--lilac-10)] font-medium truncate min-w-0">{msg.approvalAction}</span>
          </div>
        )}

        {/* ── Socrates: Approve/Reject → countdown → executing → resolved ── */}
        {isSocrates && msg.approvalState === 'pending' && (
          <div className="mt-1 mb-1" onClick={(e) => e.stopPropagation()}>
            {actionPhase === 'idle' && (
              <div className="flex items-center gap-2">
                <Button theme="secondary" size="small" leftIcon={<Check />} onClick={() => startCountdown('approved')}>
                  Approve
                </Button>
                <Button theme="third" size="small" onClick={() => startCountdown('rejected')}>
                  Reject
                </Button>
              </div>
            )}
            {actionPhase === 'countdown' && (
              <div className="flex items-center gap-2">
                <CountdownUndoButton progress={countdownProgress} enabled={undoBtnEnabled} onUndo={handleUndo} />
                <span className="text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">
                  {pendingAction === 'approved' ? 'Approving…' : 'Rejecting…'}
                </span>
              </div>
            )}
            {actionPhase === 'executing' && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[var(--text-tertiary)]" />
                <span className="text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">Processing…</span>
              </div>
            )}
          </div>
        )}

        {/* ── Socrates: resolved ── */}
        {isSocrates && msg.approvalState && msg.approvalState !== 'pending' && (
          <div className="mb-1 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Check className="h-3.5 w-3.5 shrink-0 text-[#29CA88]" />
            <span className="text-[length:var(--font-size-body2)] font-medium text-[var(--neutral-8)]">
              {msg.approvalState === 'approved' ? 'Action approved' : 'Action rejected'}
            </span>
          </div>
        )}

        {/* ── Workspace invite: Accept/Decline → countdown → executing → resolved ── */}
        {isInvite && msg.inviteState === 'pending' && (
          <div className="flex items-center gap-2 mb-1" onClick={(e) => e.stopPropagation()}>
            {actionPhase === 'idle' && (
              <>
                <Button theme="secondary" size="small" leftIcon={<Check />} onClick={() => startCountdown('accepted')}>
                  Accept
                </Button>
                <Button theme="third" size="small" onClick={() => startCountdown('declined')}>
                  Decline
                </Button>
              </>
            )}
            {actionPhase === 'countdown' && (
              <>
                <CountdownUndoButton progress={countdownProgress} enabled={undoBtnEnabled} onUndo={handleUndo} />
                <span className="text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">
                  {pendingAction === 'accepted' ? 'Accepting…' : 'Declining…'}
                </span>
              </>
            )}
            {actionPhase === 'executing' && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[var(--text-tertiary)]" />
                <span className="text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">Processing…</span>
              </div>
            )}
          </div>
        )}

        {/* ── Workspace invite: resolved ── */}
        {isInvite && msg.inviteState && msg.inviteState !== 'pending' && (
          <div className="mb-1 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Check className="h-3.5 w-3.5 shrink-0 text-[#29CA88]" />
            <span className="text-[length:var(--font-size-body2)] font-medium text-[var(--neutral-8)]">
              {msg.inviteState === 'accepted' ? 'Invitation accepted' : 'Invitation declined'}
            </span>
          </div>
        )}

        {/* Meta row: severity + workspace */}
        <div className="flex items-center gap-1.5 mt-3.5 flex-wrap">
          <SeverityTag level={msg.severity as SeverityLevel} size="small" />
          <Tag color="neutral" appearance="surface" size="small" icon={<Building2 />}>
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
            className="absolute right-3 top-2.5 flex items-center gap-0.5 rounded-[var(--radius-md)] border border-[var(--border-level-2)] bg-[var(--surface)] px-1 py-1 shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            {view !== 'archive' ? (
              <>
                <Tooltip label={msg.isRead ? 'Mark as unread' : 'Mark as read'}>
                  <button onClick={(e) => { e.stopPropagation(); onMarkRead(msg.id); }}
                    className="flex items-center justify-center rounded-[var(--radius-sm)] p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-primary)] transition-colors">
                    {msg.isRead ? <BellOff className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                  </button>
                </Tooltip>
                <Tooltip label="Archive">
                  <button onClick={(e) => { e.stopPropagation(); onArchive(msg.id); }}
                    className="flex items-center justify-center rounded-[var(--radius-sm)] p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-primary)] transition-colors">
                    <ArchiveIcon className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              </>
            ) : (
              <Tooltip label="Restore to inbox">
                <button onClick={(e) => { e.stopPropagation(); onRestore(msg.id); }}
                  className="flex items-center justify-center rounded-[var(--radius-sm)] p-1.5 text-[var(--royal)] hover:bg-[var(--royal-1)] transition-colors">
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

// ─── Filter config (pillars = notification settings MVP groups) ────────────

const PILLAR_FILTER_ICONS: Record<NotifPillar, React.ElementType> = {
  platform: Building2,
  hypersoc: Shield,
  hyperautomation: Zap,
  socrates: Bot,
};

const NOTIFICATION_PILLARS = NOTIFICATION_MVP_GROUPS.map((g) => ({
  id: g.id as NotifPillar,
  label: g.label,
  Icon: PILLAR_FILTER_ICONS[g.id as NotifPillar],
}));

const ALL_SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low'];

interface FilterState {
  /** Selected categories (pillars); matches notification settings groups */
  pillars: NotifPillar[];
  /** Selected severities */
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
  iconClassName,
  checked,
  onToggle,
}: {
  label: string;
  Icon?: React.ElementType;
  iconClassName?: string;
  checked: boolean;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const showBox = checked || hovered;
  return (
    <label
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => e.stopPropagation()}
      className="flex w-full cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-[length:var(--font-size-body1)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-primary)] transition-colors"
    >
      <span className={showBox ? 'shrink-0' : 'shrink-0 invisible'} aria-hidden={!showBox}>
        <Checkbox checked={checked} onChange={onToggle} size="sm" aria-label={label} />
      </span>
      {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${iconClassName ?? ''}`} />}
      <span className="flex-1 text-left">{label}</span>
    </label>
  );
}

// ─── Quick enable pillar (from muted filter row) ───────────────────────────

function QuickEnablePillarModal({
  pillarId,
  onCancel,
  onConfirm,
}: {
  pillarId: NotifPillar;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const label = NOTIFICATION_MVP_GROUPS.find((g) => g.id === pillarId)?.label ?? pillarId;
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4" data-quick-enable-modal role="presentation">
      <button type="button" aria-label="Dismiss" className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-enable-title"
        className="relative z-[1] w-full max-w-md rounded-[var(--radius-md)] border border-[var(--border-level-2)] bg-[var(--surface)] p-5 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="quick-enable-title" className="text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)]">
          Turn on in-app notifications?
        </h2>
        <p className="mt-2 text-[length:var(--font-size-body1)] text-[var(--text-secondary)] leading-relaxed">
          You will start receiving <span className="font-medium text-[var(--text-primary)]">{label}</span> notifications in the inbox again. You can change this anytime in notification settings.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button theme="third" size="small" onClick={onCancel}>
            Cancel
          </Button>
          <Button theme="primary" size="small" onClick={onConfirm}>
            Enable
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Filter Popover (cascading, portalled) ────────────────────────────────

function FilterPopover({
  filter,
  onChange,
  onClose,
  anchorEl,
  channelSnapshot,
  onRequestEnablePillar,
}: {
  filter: FilterState;
  onChange: (f: FilterState) => void;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  channelSnapshot: NotifChannelState;
  onRequestEnablePillar: (pillar: NotifPillar) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<'pillar' | 'severity' | null>(null);
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
      const el = e.target as HTMLElement;
      if (el.closest?.('[data-quick-enable-modal]')) return;
      const t = e.target as Node;
      if (ref.current?.contains(t) || anchorEl?.contains(t)) return;
      onClose();
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [onClose, anchorEl]);

  function togglePillar(id: NotifPillar) {
    if (!pillarInAppDelivering(channelSnapshot, id)) return;
    const next = filter.pillars.includes(id)
      ? filter.pillars.filter((x) => x !== id)
      : [...filter.pillars, id];
    onChange({ ...filter, pillars: next });
  }

  function toggleSeverity(s: Severity) {
    const next = filter.severities.includes(s)
      ? filter.severities.filter((x) => x !== s)
      : [...filter.severities, s];
    onChange({ ...filter, severities: next });
  }

  const activePillarRows = NOTIFICATION_PILLARS.filter((p) => pillarInAppDelivering(channelSnapshot, p.id));
  const mutedPillarRows = NOTIFICATION_PILLARS.filter((p) => !pillarInAppDelivering(channelSnapshot, p.id));
  const hasFilters = filter.pillars.length > 0 || filter.severities.length > 0;

  if (!pos || typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      ref={ref}
      style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.13 }}
      className="w-52 rounded-[var(--radius-md)] border border-[var(--border-level-2)] bg-[var(--surface)] shadow-lg py-1"
      onMouseLeave={scheduleHide}
      onMouseEnter={cancelHide}
    >
      {/* Category (pillars) — aligned with notification settings groups */}
      <div
        className={`relative flex items-center gap-2 px-3 py-2 text-[length:var(--font-size-body1)] cursor-default transition-colors ${
          activeSubmenu === 'pillar'
            ? 'bg-[var(--bg-hover-level-2)] text-[var(--text-primary)]'
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-primary)]'
        }`}
        onMouseEnter={() => { cancelHide(); setActiveSubmenu('pillar'); }}
      >
        <span className="flex-1">Category</span>
        {filter.pillars.length > 0 && (
          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--neutral-12)] px-1 text-[9px] font-bold leading-none text-white">
            {filter.pillars.length}
          </span>
        )}
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]" />

        {activeSubmenu === 'pillar' && (
          <div
            className="absolute left-full top-0 -ml-px z-10 max-h-[min(70vh,420px)] w-60 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border-level-2)] bg-[var(--surface)] shadow-lg py-1"
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
          >
            <div className="absolute inset-y-0 -left-2 w-2" onMouseEnter={cancelHide} />
            {activePillarRows.map((t) => (
              <FilterCheckRow
                key={t.id}
                label={t.label}
                Icon={t.Icon}
                checked={filter.pillars.includes(t.id)}
                onToggle={() => togglePillar(t.id)}
              />
            ))}
            {mutedPillarRows.length > 0 && (
              <>
                <div className="my-1 border-t border-[var(--border-level-1)]" />
                <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
                  Muted in settings
                </p>
                {mutedPillarRows.map((p) => {
                  const PIcon = p.Icon;
                  return (
                    <div
                      key={p.id}
                      className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-[length:var(--font-size-body1)] text-[var(--text-tertiary)]"
                    >
                      <BellOff className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                      <PIcon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-left">{p.label}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestEnablePillar(p.id);
                        }}
                        className="shrink-0 rounded-[var(--radius-sm)] px-2 py-1 text-[length:var(--font-size-body2)] font-medium text-[var(--royal)] hover:bg-[var(--royal-1)] transition-colors"
                      >
                        Enable
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* Severity row */}
      <div
        className={`relative flex items-center gap-2 px-3 py-2 text-[length:var(--font-size-body1)] cursor-default transition-colors ${
          activeSubmenu === 'severity'
            ? 'bg-[var(--bg-hover-level-2)] text-[var(--text-primary)]'
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-primary)]'
        }`}
        onMouseEnter={() => { cancelHide(); setActiveSubmenu('severity'); }}
      >
        <span className="flex-1">Severity</span>
        {filter.severities.length > 0 && (
          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--neutral-12)] px-1 text-[9px] font-bold leading-none text-white">
            {filter.severities.length}
          </span>
        )}
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]" />

        {activeSubmenu === 'severity' && (
          <div
            className="absolute left-full top-0 -ml-px z-10 w-48 rounded-[var(--radius-md)] border border-[var(--border-level-2)] bg-[var(--surface)] shadow-lg py-1"
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
          >
            <div className="absolute inset-y-0 -left-2 w-2" onMouseEnter={cancelHide} />
            {ALL_SEVERITIES.map((s) => {
              const cfg = SEVERITY_CONFIG[s];
              const Icon = cfg.Icon;
              return (
                <FilterCheckRow
                  key={s}
                  label={cfg.label}
                  Icon={Icon}
                  iconClassName={cfg.iconClass}
                  checked={filter.severities.includes(s)}
                  onToggle={() => toggleSeverity(s)}
                />
              );
            })}
          </div>
        )}
      </div>

      {hasFilters && (
        <>
          <div className="my-1 border-t border-[var(--border-level-1)]" />
          <button
            onClick={() => { onChange({ pillars: [], severities: [] }); onClose(); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-[length:var(--font-size-body1)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--ruby-10)] transition-colors"
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

type FilterEditorFamily = 'severity' | 'pillar';

function FilterFamilyEditorPopover({
  family,
  filter,
  onChange,
  onClose,
  anchorEl,
  channelSnapshot,
  onRequestEnablePillar,
}: {
  family: FilterEditorFamily;
  filter: FilterState;
  onChange: (f: FilterState) => void;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  channelSnapshot: NotifChannelState;
  onRequestEnablePillar: (pillar: NotifPillar) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pos = usePortalPos(anchorEl, 'left', 8);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const el = e.target as HTMLElement;
      if (el.closest?.('[data-quick-enable-modal]')) return;
      const t = e.target as Node;
      if (ref.current?.contains(t) || anchorEl?.contains(t)) return;
      onClose();
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [onClose, anchorEl]);

  if (!pos || typeof document === 'undefined') return null;

  if (family === 'severity') {
    return createPortal(
      <motion.div
        ref={ref}
        style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 10000 }}
        initial={{ opacity: 0, y: -6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.97 }}
        transition={{ duration: 0.13 }}
        className="w-56 rounded-[var(--radius-md)] border border-[var(--border-level-2)] bg-[var(--surface)] p-1 shadow-lg"
      >
        {ALL_SEVERITIES.map((s) => {
          const cfg = SEVERITY_CONFIG[s];
          const Icon = cfg.Icon;
          const next = filter.severities.includes(s)
            ? filter.severities.filter((x) => x !== s)
            : [...filter.severities, s];
          return (
            <FilterCheckRow
              key={s}
              label={cfg.label}
              Icon={Icon}
              iconClassName={cfg.iconClass}
              checked={filter.severities.includes(s)}
              onToggle={() => onChange({ ...filter, severities: next })}
            />
          );
        })}
      </motion.div>,
      document.body,
    );
  }

  const activePillarRows = NOTIFICATION_PILLARS.filter((p) => pillarInAppDelivering(channelSnapshot, p.id));
  const mutedPillarRows = NOTIFICATION_PILLARS.filter((p) => !pillarInAppDelivering(channelSnapshot, p.id));

  return createPortal(
    <motion.div
      ref={ref}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 10000 }}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.13 }}
      className="max-h-[min(70vh,420px)] w-64 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border-level-2)] bg-[var(--surface)] p-1 shadow-lg"
    >
      {activePillarRows.map((row) => {
        const next = filter.pillars.includes(row.id)
          ? filter.pillars.filter((x) => x !== row.id)
          : [...filter.pillars, row.id];
        return (
          <FilterCheckRow
            key={row.id}
            label={row.label}
            Icon={row.Icon}
            checked={filter.pillars.includes(row.id)}
            onToggle={() => onChange({ ...filter, pillars: next })}
          />
        );
      })}

      {mutedPillarRows.length > 0 && (
        <>
          <div className="my-1 border-t border-[var(--border-level-1)]" />
          <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
            Muted in settings
          </p>
          {mutedPillarRows.map((row) => {
            const PIcon = row.Icon;
            return (
              <div
                key={row.id}
                className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-[length:var(--font-size-body1)] text-[var(--text-tertiary)]"
              >
                <BellOff className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                <PIcon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-left">{row.label}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestEnablePillar(row.id);
                  }}
                  className="shrink-0 rounded-[var(--radius-sm)] px-2 py-1 text-[length:var(--font-size-body2)] font-medium text-[var(--royal)] hover:bg-[var(--royal-1)] transition-colors"
                >
                  Enable
                </button>
              </div>
            );
          })}
        </>
      )}
    </motion.div>,
    document.body,
  );
}

function formatSeverityFilterSummary(severities: Severity[]): string {
  return ALL_SEVERITIES.filter((s) => severities.includes(s)).map((s) => SEVERITY_CONFIG[s].label).join(', ');
}

function formatTypeFilterSummary(pillars: NotifPillar[]): string {
  return NOTIFICATION_PILLARS.filter((p) => pillars.includes(p.id)).map((p) => p.label).join(', ');
}

function AppliedFiltersChipBar({
  filter,
  onChange,
  onClearSeverities,
  onClearPillars,
  onClearAll,
  channelSnapshot,
  onRequestEnablePillar,
  onBeginQuickEdit,
  showBottomBorder = false,
}: {
  filter: FilterState;
  onChange: (f: FilterState) => void;
  onClearSeverities: () => void;
  onClearPillars: () => void;
  onClearAll: () => void;
  channelSnapshot: NotifChannelState;
  onRequestEnablePillar: (pillar: NotifPillar) => void;
  onBeginQuickEdit?: () => void;
  showBottomBorder?: boolean;
}) {
  const hasSeverity = filter.severities.length > 0;
  const hasType = filter.pillars.length > 0;
  const [editingFamily, setEditingFamily] = useState<FilterEditorFamily | null>(null);
  const [addPopoverOpen, setAddPopoverOpen] = useState(false);
  const severityChipRef = useRef<HTMLButtonElement>(null);
  const typeChipRef = useRef<HTMLButtonElement>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (editingFamily === 'severity' && filter.severities.length === 0) {
      setEditingFamily(null);
    }
    if (editingFamily === 'pillar' && filter.pillars.length === 0) {
      setEditingFamily(null);
    }
  }, [editingFamily, filter.severities.length, filter.pillars.length]);

  if (!hasSeverity && !hasType) return null;

  return (
    <>
      <div className={`w-full shrink-0 bg-[var(--surface)] p-2 ${showBottomBorder ? 'border-b border-[var(--border-level-1)]' : ''}`}>
        <AppliedFiltersBar
          trailing={
            <button
              type="button"
              onClick={() => {
                setEditingFamily(null);
                setAddPopoverOpen(false);
                onClearAll();
              }}
              className="pointer-events-none shrink-0 self-start px-2 py-0.5 text-[length:var(--font-size-body2)] font-medium text-[var(--text-tertiary)] underline-offset-2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 hover:text-[var(--royal)] hover:underline focus:pointer-events-auto focus:opacity-100"
            >
              Clear all
            </button>
          }
        >
          {hasSeverity && (
            <FilterChip
              icon={<AlertTriangle className="h-3 w-3" strokeWidth={2} aria-hidden />}
              familyLabel="Severity"
              valueSummary={formatSeverityFilterSummary(filter.severities)}
              chipButtonRef={severityChipRef}
              expanded={editingFamily === 'severity'}
              onEdit={() => {
                onBeginQuickEdit?.();
                setAddPopoverOpen(false);
                setEditingFamily((prev) => (prev === 'severity' ? null : 'severity'));
              }}
              onRemove={() => {
                setEditingFamily((prev) => (prev === 'severity' ? null : prev));
                onClearSeverities();
              }}
              removeLabel="Clear severity filters"
            />
          )}
          {hasType && (
            <FilterChip
              icon={<Layers className="h-3 w-3" strokeWidth={2} aria-hidden />}
              familyLabel="Type"
              valueSummary={formatTypeFilterSummary(filter.pillars)}
              chipButtonRef={typeChipRef}
              expanded={editingFamily === 'pillar'}
              onEdit={() => {
                onBeginQuickEdit?.();
                setAddPopoverOpen(false);
                setEditingFamily((prev) => (prev === 'pillar' ? null : 'pillar'));
              }}
              onRemove={() => {
                setEditingFamily((prev) => (prev === 'pillar' ? null : prev));
                onClearPillars();
              }}
              removeLabel="Clear type filters"
            />
          )}
          <button
            ref={addBtnRef}
            type="button"
            onClick={() => {
              onBeginQuickEdit?.();
              setEditingFamily(null);
              setAddPopoverOpen((prev) => !prev);
            }}
            aria-expanded={addPopoverOpen}
            aria-label="Add filter"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-full)] text-[var(--text-primary)] transition-colors hover:bg-[var(--filter-chip-bg)] hover:shadow-[0_1px_2px_rgba(9,10,11,0.06)]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden />
          </button>
        </AppliedFiltersBar>
      </div>

      <AnimatePresence>
        {editingFamily && (
          <FilterFamilyEditorPopover
            family={editingFamily}
            filter={filter}
            onChange={onChange}
            onClose={() => setEditingFamily(null)}
            anchorEl={editingFamily === 'severity' ? severityChipRef.current : typeChipRef.current}
            channelSnapshot={channelSnapshot}
            onRequestEnablePillar={onRequestEnablePillar}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {addPopoverOpen && (
          <FilterPopover
            filter={filter}
            onChange={onChange}
            onClose={() => setAddPopoverOpen(false)}
            anchorEl={addBtnRef.current}
            channelSnapshot={channelSnapshot}
            onRequestEnablePillar={onRequestEnablePillar}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Workspace Popover ────────────────────────────────────────────────────

function WsCheckbox({ checked, partial }: { checked: boolean; partial?: boolean }) {
  return (
    <Checkbox
      checked={checked && !partial}
      indeterminate={Boolean(partial && !checked)}
      onChange={() => {}}
      size="sm"
      className="pointer-events-none"
      aria-hidden
    />
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
      className="w-56 rounded-[var(--radius-md)] border border-[var(--border-level-2)] bg-[var(--surface)] shadow-xl overflow-hidden"
    >
      {/* Search */}
      <div className="flex items-center gap-2 border-b border-[var(--border-level-1)] px-3 py-2.5">
        <Search className="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find workspace..."
          className="flex-1 bg-transparent text-[length:var(--font-size-body1)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
        />
      </div>

      <div className="py-1">
        {/* All workspaces row */}
        <button
          onClick={toggleAll}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-[length:var(--font-size-body1)] text-[var(--text-primary)] hover:bg-[var(--bg-hover-level-2)] transition-colors"
        >
          <WsCheckbox checked={allSelected} partial={!allSelected && local.length > 0} />
          <span className="flex-1 text-left font-medium">
            All workspaces ({WORKSPACES.length})
          </span>
        </button>

        <div className="mx-3 my-1 border-t border-[var(--border-level-1)]" />

        {/* Individual workspace rows */}
        {filtered.map((ws) => {
          const isChecked = allSelected || local.includes(ws.id);
          return (
            <button
              key={ws.id}
              onClick={() => toggleWs(ws.id)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-[length:var(--font-size-body1)] hover:bg-[var(--bg-hover-level-2)] transition-colors"
            >
              <WsCheckbox checked={isChecked} />
              <span className="flex flex-col items-start min-w-0">
                <span className="truncate text-[var(--text-primary)]">{ws.name}</span>
                {ws.isCurrent && (
                  <span className="text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">
                    Current workspace
                  </span>
                )}
              </span>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p className="px-3 py-3 text-center text-[length:var(--font-size-body1)] text-[var(--text-tertiary)]">
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
  onOpenSettings,
  anchorEl,
}: {
  onMarkAllRead: () => void;
  onArchiveAll: () => void;
  onArchiveRead: () => void;
  onViewArchive: () => void;
  onClose: () => void;
  onOpenSettings?: () => void;
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
    'flex w-full items-center gap-2.5 px-3 py-2 text-[length:var(--font-size-body1)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-primary)] transition-colors';

  if (!pos || typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      ref={ref}
      style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
      initial={{ opacity: 0, scale: 0.95, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -6 }}
      transition={{ duration: 0.13 }}
      className="w-56 rounded-[var(--radius-md)] border border-[var(--border-level-2)] bg-[var(--surface)] shadow-lg py-1"
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
      <div className="my-1 border-t border-[var(--border-level-1)]" />
      <button onClick={() => { onViewArchive(); onClose(); }} className={btnClass}>
        <Eye className="h-3.5 w-3.5 shrink-0" />
        View archive
      </button>
      <div className="my-1 border-t border-[var(--border-level-1)]" />
      <button
        onClick={() => {
          window.dispatchEvent(new CustomEvent('torq:open-settings', { detail: 'notifications' }));
          onClose();
        }}
        className={btnClass}
      >
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
  onOpenSettings?: () => void;
}

export function InboxPanel({ isOpen, onClose, onNavigate, onOpenSettings }: InboxPanelProps) {
  const [view, setView] = useState<View>('all');
  const [prevView, setPrevView] = useState<'all' | 'unread' | 'needs-action'>('all');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [archiveSearch, setArchiveSearch] = useState('');
  const archiveSearchRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<FilterState>({ pillars: [], severities: [] });
  const [filterOpen, setFilterOpen] = useState(false);
  const [channelSnapshot, setChannelSnapshot] = useState<NotifChannelState>(() => getInitialNotificationSettingsState().channels);
  const [quickEnablePillar, setQuickEnablePillar] = useState<NotifPillar | null>(null);
  const [filterToast, setFilterToast] = useState<string | null>(null);
  const filterToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [inboxScrolled, setInboxScrolled] = useState(false);
  const [archiveScrolled, setArchiveScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [panelHovered, setPanelHovered] = useState(false);
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

  useEffect(() => () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    if (filterToastTimerRef.current) clearTimeout(filterToastTimerRef.current);
  }, []);

  useEffect(() => {
    function syncChannels() {
      setChannelSnapshot(getInitialNotificationSettingsState().channels);
    }
    syncChannels();
    function onStorage(e: StorageEvent) {
      if (e.key === NOTIF_SETTINGS_STORAGE_KEY || e.key === null) syncChannels();
    }
    window.addEventListener(NOTIF_SETTINGS_SAVED_EVENT, syncChannels);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(NOTIF_SETTINGS_SAVED_EVENT, syncChannels);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    setFilter((f) => ({
      ...f,
      pillars: f.pillars.filter((p) => pillarInAppDelivering(channelSnapshot, p)),
    }));
  }, [channelSnapshot]);

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

  function showFilterToast(message: string) {
    if (filterToastTimerRef.current) clearTimeout(filterToastTimerRef.current);
    setFilterToast(message);
    filterToastTimerRef.current = setTimeout(() => {
      setFilterToast(null);
      filterToastTimerRef.current = null;
    }, 2600);
  }

  function confirmQuickEnable() {
    if (!quickEnablePillar) return;
    saveQuickEnablePillar(quickEnablePillar);
    setQuickEnablePillar(null);
    window.setTimeout(() => showFilterToast('Updated successfully'), 0);
  }

  function removeSeverityFilter() {
    setFilter((f) => ({ ...f, severities: [] }));
  }
  function removePillarFilter() {
    setFilter((f) => ({ ...f, pillars: [] }));
  }

  function matchesWorkspace(m: Message) {
    if (wsFilter.length === 0) return true;
    return wsFilter.includes(m.workspace);
  }

  function goToArchive() {
    if (view !== 'archive') setPrevView(view as 'all' | 'unread' | 'needs-action');
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
    if (view === 'needs-action' && !messageNeedsAction(m)) return false;
    if (search) {
      const q = search.toLowerCase();
      const match = m.source.toLowerCase().includes(q) || m.subHeader.toLowerCase().includes(q) || m.preview.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filter.severities.length > 0 && !filter.severities.includes(m.severity)) return false;
    if (filter.pillars.length > 0 && !filter.pillars.includes(messagePillar(m))) return false;
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
    if (filter.pillars.length > 0 && !filter.pillars.includes(messagePillar(m))) return false;
    if (!matchesWorkspace(m)) return false;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.isArchived && !m.isRead).length;
  const needsActionCount = messages.filter((m) => !m.isArchived && messageNeedsAction(m)).length;
  const activeFilterCount = filter.pillars.length + filter.severities.length;

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
          animate={{ width: 480, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          className="relative shrink-0 h-full overflow-hidden bg-[var(--surface)] flex flex-col font-[family-name:var(--font-family)]"
          style={{ minWidth: 0, boxShadow: '12px 0 40px 0 rgba(0,0,0,0.08), 1px 0 0 0 rgba(0,0,0,0.06)', clipPath: 'inset(0 -60px 0 0)' }}
          onMouseEnter={() => setPanelHovered(true)}
          onMouseLeave={() => setPanelHovered(false)}
        >

          {/* ══════════════════════════════════════════════════
              BASE LAYER — Inbox (always rendered beneath)
          ══════════════════════════════════════════════════ */}

          {/* Inbox Row 1: Inbox | workspace | collapse | ⋮ */}
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 shrink-0">
            <span className="text-[length:var(--font-size-body0)] font-semibold text-[var(--text-primary)] leading-none">
              Inbox
            </span>

            {/* Workspace chip */}
            <div className="relative">
              <button
                ref={wsBtnRef}
                onClick={() => { setWsOpen((o) => !o); setFilterOpen(false); setMoreOpen(false); }}
                className="flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--neutral-2)] px-2.5 py-1 text-[length:var(--font-size-body1)] text-[var(--text-secondary)] hover:bg-[var(--bg-active-level-1)] transition-colors"
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

            {/* Collapse button — appears on panel hover */}
            <AnimatePresence>
              {panelHovered && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.12 }}
                  onClick={onClose}
                  title="Collapse panel"
                  className="flex items-center justify-center rounded-[var(--radius-sm)] p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-secondary)] transition-colors"
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
                className={`flex items-center justify-center rounded-[var(--radius-sm)] p-1.5 transition-colors ${moreOpen ? 'bg-[var(--bg-hover-level-2)] text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-secondary)]'}`}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <MoreMenu anchorEl={moreBtnRef.current} onMarkAllRead={handleMarkAllRead}
                    onArchiveAll={handleArchiveAll} onArchiveRead={handleArchiveRead}
                    onViewArchive={goToArchive} onClose={() => setMoreOpen(false)}
                    onOpenSettings={onOpenSettings}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Inbox Row 2: Tabs ↔ inline search + filter */}
          <div className="flex items-center border-b border-[var(--border-level-2)] px-4 shrink-0 min-h-[40px]">
            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait" initial={false}>
                {searchOpen ? (
                  <motion.div key="search-input" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex items-center gap-2 py-2">
                    <button onClick={toggleSearch} className="flex items-center justify-center rounded-[var(--radius-sm)] p-1 shrink-0 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-secondary)] transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <input ref={searchInputRef} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search all notifications…" className="flex-1 min-w-0 bg-transparent text-[length:var(--font-size-body1)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none" />
                  </motion.div>
                ) : (
                  <motion.div key="tabs" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex items-center">
                    {([
                      { id: 'all' as const, label: 'All' },
                      { id: 'unread' as const, label: 'Unread', count: unreadCount },
                      { id: 'needs-action' as const, label: 'Needs action', count: needsActionCount },
                    ]).map((tab) => (
                      <button key={tab.id} onClick={() => setView(tab.id)}
                        className={`relative flex items-center gap-1.5 pb-2.5 pt-1 mr-4 text-[length:var(--font-size-body1)] transition-colors ${view === tab.id ? 'font-semibold text-[var(--text-primary)]' : 'font-normal text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                      >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                          <span className="flex h-4 min-w-[18px] items-center justify-center rounded-full bg-[var(--neutral-2)] px-1 text-[length:var(--font-size-body2)] font-semibold text-[var(--text-primary)]">
                            {tab.count}
                          </span>
                        )}
                        {view === tab.id && (
                          <motion.span layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[var(--text-primary)]" transition={{ duration: 0.18, ease: 'easeInOut' }} />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!searchOpen && (
              <button onClick={toggleSearch} className="flex items-center justify-center rounded-[var(--radius-sm)] p-1.5 mb-1 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-secondary)] transition-colors">
                <Search className="h-4 w-4" />
              </button>
            )}

            <div className="relative ml-0.5">
              <button
                ref={filterBtnRef}
                onClick={() => { setFilterOpen((o) => !o); setMoreOpen(false); setWsOpen(false); }}
                className={`flex items-center justify-center rounded-[var(--radius-sm)] p-1.5 mb-1 transition-colors ${filterOpen || activeFilterCount > 0 ? 'bg-[var(--neutral-2)] text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-secondary)]'}`}
              >
                <ListFilter className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--neutral-12)] text-[9px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {filterOpen && (
                  <FilterPopover
                    anchorEl={filterBtnRef.current}
                    filter={filter}
                    onChange={setFilter}
                    onClose={() => setFilterOpen(false)}
                    channelSnapshot={channelSnapshot}
                    onRequestEnablePillar={(p) => setQuickEnablePillar(p)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Applied filters — quick-edit from chip */}
          <AppliedFiltersChipBar
            filter={filter}
            onChange={setFilter}
            onClearSeverities={removeSeverityFilter}
            onClearPillars={removePillarFilter}
            onClearAll={() => setFilter({ pillars: [], severities: [] })}
            channelSnapshot={channelSnapshot}
            onRequestEnablePillar={(p) => setQuickEnablePillar(p)}
            onBeginQuickEdit={() => setFilterOpen(false)}
            showBottomBorder={inboxScrolled}
          />

          {/* Inbox message list */}
          <div
            className="flex-1 overflow-y-auto overflow-x-hidden"
            onScroll={(e) => setInboxScrolled(e.currentTarget.scrollTop > 0)}
          >
            {inboxVisible.length === 0 ? (
              <EmptyState view={view} />
            ) : (
              <motion.div layout>
                <AnimatePresence mode="popLayout">
                  {(() => {
                    const items: React.ReactNode[] = [];
                    let lastGroup = '';
                    inboxVisible.forEach((msg) => {
                      const group = getTimeGroup(msg.time);
                      if (group !== lastGroup) {
                        lastGroup = group;
                        items.push(<TimeSectionHeader key={`header-${group}`} label={group} />);
                      }
                      items.push(
                        <MessageRow key={msg.id} msg={msg} view={view} onMarkRead={handleMarkRead} onArchive={handleArchive} onRestore={handleRestore} onApprove={handleApprove} onReject={handleReject} onAcceptInvite={handleAcceptInvite} onDeclineInvite={handleDeclineInvite} onUndoApproval={handleUndoApproval} onUndoInvite={handleUndoInvite} onNavigate={onNavigate} />
                      );
                    });
                    return items;
                  })()}
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
                className="absolute inset-0 bg-[var(--surface)] flex flex-col z-10"
                style={{ boxShadow: '-4px 0 20px 0 rgba(0,0,0,0.08)' }}
              >
                {/* Archive Row 1: ← | Archived | workspace | ⋮ */}
                <div className="flex items-center gap-2 px-4 pt-4 pb-3 shrink-0">
                  <button
                    onClick={goBackFromArchive}
                    className="flex items-center justify-center rounded-[var(--radius-sm)] p-1 text-[var(--text-secondary)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <span className="text-[length:var(--font-size-body0)] font-semibold text-[var(--text-primary)] leading-none">
                    Archived
                  </span>

                  {/* Workspace chip — uses archive-specific ref */}
                  <div className="relative">
                    <button
                      ref={archiveWsBtnRef}
                      onClick={() => { setWsOpen((o) => !o); setFilterOpen(false); setMoreOpen(false); }}
                      className="flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--neutral-2)] px-2.5 py-1 text-[length:var(--font-size-body1)] text-[var(--text-secondary)] hover:bg-[var(--bg-active-level-1)] transition-colors"
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
                      className={`flex items-center justify-center rounded-[var(--radius-sm)] p-1.5 transition-colors ${moreOpen ? 'bg-[var(--bg-hover-level-2)] text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-secondary)]'}`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    <AnimatePresence>
                      {moreOpen && (
                        <MoreMenu anchorEl={archiveMoreBtnRef.current} onMarkAllRead={handleMarkAllRead}
                          onArchiveAll={handleArchiveAll} onArchiveRead={handleArchiveRead}
                          onViewArchive={goToArchive} onClose={() => setMoreOpen(false)}
                          onOpenSettings={onOpenSettings}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Archive Row 2: always-visible search + filter */}
                <div className="flex items-center gap-2 border-b border-[var(--border-level-2)] px-4 py-2.5 shrink-0">
                  <Search className="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]" />
                  <input
                    ref={archiveSearchRef}
                    value={archiveSearch}
                    onChange={(e) => setArchiveSearch(e.target.value)}
                    placeholder="Search in archive…"
                    className="flex-1 min-w-0 bg-transparent text-[length:var(--font-size-body1)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
                  />
                  {archiveSearch && (
                    <button onClick={() => setArchiveSearch('')} className="shrink-0 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {/* Filter — uses archive-specific ref */}
                  <div className="relative shrink-0">
                    <button
                      ref={archiveFilterBtnRef}
                      onClick={() => { setFilterOpen((o) => !o); setMoreOpen(false); setWsOpen(false); }}
                      className={`flex items-center justify-center rounded-[var(--radius-sm)] p-1 transition-colors ${filterOpen || activeFilterCount > 0 ? 'bg-[var(--royal-1)] text-[var(--royal)]' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-secondary)]'}`}
                    >
                      <ListFilter className="h-4 w-4" />
                      {activeFilterCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--neutral-12)] text-[9px] font-bold text-white">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                    <AnimatePresence>
                      {filterOpen && (
                        <FilterPopover
                          anchorEl={archiveFilterBtnRef.current}
                          filter={filter}
                          onChange={setFilter}
                          onClose={() => setFilterOpen(false)}
                          channelSnapshot={channelSnapshot}
                          onRequestEnablePillar={(p) => setQuickEnablePillar(p)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Archive applied filters — quick-edit from chip */}
                <AppliedFiltersChipBar
                  filter={filter}
                  onChange={setFilter}
                  onClearSeverities={removeSeverityFilter}
                  onClearPillars={removePillarFilter}
                  onClearAll={() => setFilter({ pillars: [], severities: [] })}
                  channelSnapshot={channelSnapshot}
                  onRequestEnablePillar={(p) => setQuickEnablePillar(p)}
                  onBeginQuickEdit={() => setFilterOpen(false)}
                  showBottomBorder={archiveScrolled}
                />

                {/* Archive message list */}
                <div
                  className="flex-1 overflow-y-auto overflow-x-hidden"
                  onScroll={(e) => setArchiveScrolled(e.currentTarget.scrollTop > 0)}
                >
                  {archiveVisible.length === 0 ? (
                    <EmptyState view="archive" />
                  ) : (
                    <motion.div layout>
                      <AnimatePresence mode="popLayout">
                        {(() => {
                          const items: React.ReactNode[] = [];
                          let lastGroup = '';
                          archiveVisible.forEach((msg) => {
                            const group = getTimeGroup(msg.time);
                            if (group !== lastGroup) {
                              lastGroup = group;
                              items.push(<TimeSectionHeader key={`header-${group}`} label={group} />);
                            }
                            items.push(
                              <MessageRow key={msg.id} msg={msg} view="archive" onMarkRead={handleMarkRead} onArchive={handleArchive} onRestore={handleRestore} onApprove={handleApprove} onReject={handleReject} onAcceptInvite={handleAcceptInvite} onDeclineInvite={handleDeclineInvite} onUndoApproval={handleUndoApproval} onUndoInvite={handleUndoInvite} onNavigate={onNavigate} />
                            );
                          });
                          return items;
                        })()}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Quick enable pillar modal ── */}
          {quickEnablePillar && (
            <QuickEnablePillarModal
              pillarId={quickEnablePillar}
              onCancel={() => setQuickEnablePillar(null)}
              onConfirm={confirmQuickEnable}
            />
          )}

          <AnimatePresence>
            {filterToast && (
              <motion.div
                key="filter-toast"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
                className="absolute bottom-16 left-3 right-3 z-[25] flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-level-2)] bg-[var(--surface)] px-3 py-2.5 shadow-lg"
                role="status"
              >
                <Check className="h-3.5 w-3.5 shrink-0 text-[#29CA88]" />
                <span className="text-[length:var(--font-size-body2)] font-medium text-[var(--text-primary)]">{filterToast}</span>
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
                className="absolute bottom-4 left-3 right-3 z-20 flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--neutral-10)] px-3 py-2.5 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#29CA88] shrink-0" />
                  <span className="text-[length:var(--font-size-body2)] text-[var(--neutral-2)]">{undoToast.label}</span>
                </div>
                <button
                  onClick={handleUndoArchive}
                  className="text-[length:var(--font-size-body2)] text-[var(--color-neutral-300)] underline underline-offset-2 hover:text-white transition-colors ml-3"
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
