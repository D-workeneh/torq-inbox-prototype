'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, ChevronsLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { PHASE1_NOTIFICATIONS } from './data';
import { getPhase1NotificationsForWorkspace } from './phase1InboxWorkspace';
import { Phase1UserAvatar } from './phase1Avatars';
import {
  IconCheck,
  IconInboxEmpty,
  IconMarkRead,
  IconMarkUnread,
  IconMoreVertical,
  IconNotifAvatar,
  CaseMentionShieldIcon,
  PHASE1_CASE_MENTION_AVATAR_BG,
  PHASE1_TORQ_AVATAR_BG,
  PHASE1_WORKFLOW_AVATAR_BG,
  PHASE1_WORKFLOW_AVATAR_ICON,
  PHASE1_NOTIF_AVATAR_BADGE_SIZE,
  PHASE1_NOTIF_AVATAR_SIZE,
  PHASE1_NOTIF_BADGE_ICON_SIZE,
  IconWorkflowAvatar,
  TorqLogoMark,
  WorkflowFailBadgeIcon,
} from './icons';
import type { Phase1NotifRow, Phase1Tab } from './types';
import { getPhase1BadgeConfig } from './phase1BadgeConfig';
import { getPhase1NotifRowActionLabel } from './phase1NotificationDrawerContent';
import { rowBackground, isSystemAvatarIcon } from './utils';
import { formatPhase1InboxTimestamp, groupPhase1InboxRows } from './formatTimestamp';
import { parsePhase1NotifTitle } from './parseNotifTitle';
import { p1Font, p1Text } from './phase1Typography';

function NotificationTitle({ row }: { row: Phase1NotifRow }) {
  const segments = parsePhase1NotifTitle(row.title);
  const isRead = row.state === 'read';
  const color = isRead ? p1Text.secondary : p1Text.primary;

  return (
    <div
      style={{
        fontSize: p1Font.body1,
        fontFamily: p1Font.family,
        lineHeight: 1.4,
        minWidth: 0,
        flex: 1,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        color,
      }}
    >
      {segments.map((seg, i) => (
        <span
          key={i}
          style={{
            fontWeight: seg.bold ? (isRead ? 500 : 600) : 400,
          }}
        >
          {seg.text}
        </span>
      ))}
    </div>
  );
}

/** Premium ease — smooth deceleration for inbox micro-interactions */
const NOTIF_ROW_EASE = [0.22, 1, 0.36, 1] as const;
const NOTIF_ROW_MOTION = { type: 'tween' as const, duration: 0.17, ease: NOTIF_ROW_EASE };

/** Brief pause before CTA expands — row hover chrome is instant (Linear/Notion-style) */
const NOTIF_ACTION_DWELL_MS = 140;

const NOTIF_BODY_LINE_CLAMP = 2;
/** Slack-style expand/collapse link */
const NOTIF_BODY_EXPAND_LINK_COLOR = '#1264a3';

function NotificationRowExpandLink({
  label,
  expanded,
  onClick,
  background,
}: {
  label: string;
  expanded: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  background?: string;
}) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={onClick}
      style={{
        margin: 0,
        padding: 0,
        border: 'none',
        background: background ?? 'transparent',
        fontSize: p1Font.body2,
        fontFamily: p1Font.family,
        fontWeight: 400,
        color: NOTIF_BODY_EXPAND_LINK_COLOR,
        cursor: 'pointer',
        lineHeight: 1.35,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function NotificationRowBody({
  body,
  showExpandAction,
  rowHovered,
  fadeBackground,
  expanded,
  onExpandedChange,
}: {
  body: string;
  /** Read-more prototype: Slack-style Show more / Show less */
  showExpandAction: boolean;
  rowHovered: boolean;
  fadeBackground: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}) {
  const italic = body.startsWith('"');
  const [truncated, setTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const checkTruncation = useCallback(() => {
    if (expanded) return;
    const el = textRef.current;
    if (!el) return;
    setTruncated(el.scrollHeight > el.clientHeight + 1);
  }, [expanded, body]);

  useEffect(() => {
    checkTruncation();
  }, [checkTruncation]);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => checkTruncation());
    ro.observe(el);
    return () => ro.disconnect();
  }, [checkTruncation]);

  const textStyle: React.CSSProperties = {
    margin: 0,
    fontSize: p1Font.body2,
    fontFamily: p1Font.family,
    color: p1Text.secondary,
    lineHeight: 1.35,
    fontStyle: italic ? 'italic' : 'normal',
    ...(!expanded
      ? {
          display: '-webkit-box',
          WebkitLineClamp: NOTIF_BODY_LINE_CLAMP,
          WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden',
        }
      : {}),
  };

  const showMore =
    showExpandAction && rowHovered && truncated && !expanded;
  const showLess = showExpandAction && rowHovered && truncated && expanded;
  const lineHeightPx = 'calc(1.35 * 1em)';

  return (
    <div
      style={{
        marginTop: 2,
        position: 'relative',
        fontSize: p1Font.body2,
        fontFamily: p1Font.family,
      }}
    >
      <p ref={textRef} style={textStyle}>
        {body}
      </p>
      {showMore ? (
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            height: lineHeightPx,
            maxHeight: lineHeightPx,
            pointerEvents: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span
            aria-hidden
            style={{
              width: 64,
              height: '100%',
              flexShrink: 0,
              background: `linear-gradient(to right, transparent 0%, ${fadeBackground} 48%, ${fadeBackground} 100%)`,
            }}
          />
          <NotificationRowExpandLink
            label="Show more"
            expanded={false}
            background={fadeBackground}
            onClick={(e) => {
              e.stopPropagation();
              onExpandedChange(true);
            }}
          />
        </div>
      ) : null}
      {showLess ? (
        <div style={{ marginTop: 2 }} onClick={(e) => e.stopPropagation()}>
          <NotificationRowExpandLink
            label="Show less"
            expanded
            onClick={(e) => {
              e.stopPropagation();
              onExpandedChange(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function InboxTimeSectionHeader({ label }: { label: string }) {
  return (
    <div style={{ padding: '12px 16px 6px 16px' }}>
      <span
        style={{
          fontSize: p1Font.body2,
          fontFamily: p1Font.family,
          fontWeight: 500,
          color: 'var(--neutral-9)',
          lineHeight: 1.35,
          userSelect: 'none',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function buildRows(
  states: Record<string, 'unseen' | 'seen' | 'read'>,
  workspaceId: string,
): Phase1NotifRow[] {
  const now = new Date();
  const notifications = getPhase1NotificationsForWorkspace(workspaceId, PHASE1_NOTIFICATIONS);
  return notifications.map((n) => ({
    ...n,
    state: states[n.id] ?? 'read',
    timestamp: formatPhase1InboxTimestamp(new Date(n.occurredAt), now),
  }));
}

/** Fixed width for timestamp + unread dot and mark-read action (prevents title shift on hover) */
const NOTIF_ROW_TRAILING_SLOT_W = 84;

const readUnreadActionBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 8,
  border: '1px solid var(--border-level-2)',
  background: '#FFFFFF',
  boxShadow: '0 1px 3px rgba(9, 10, 11, 0.1), 0 1px 2px rgba(9, 10, 11, 0.06)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  flexShrink: 0,
};

function ReadUnreadActionButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip label={label}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick(e);
        }}
        style={readUnreadActionBtnStyle}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover-level-1, #FAFAFA)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
        }}
      >
        {children}
      </button>
    </Tooltip>
  );
}

/** Portal tooltip so it is not clipped by the inbox panel overflow */
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
    <div
      ref={wrapRef}
      style={{ display: 'flex' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible &&
        pos &&
        typeof document !== 'undefined' &&
        createPortal(
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
            <div
              style={{
                background: 'var(--neutral-12)',
                color: 'var(--text-on-primary)',
                fontSize: p1Font.body3,
                fontFamily: p1Font.family,
                fontWeight: 500,
                padding: '4px 8px',
                borderRadius: 5,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(9, 10, 11, 0.15)',
              }}
            >
              {label}
            </div>
            <div
              style={{
                width: 6,
                height: 6,
                margin: '-3px auto 0',
                transform: 'rotate(45deg)',
                background: 'var(--neutral-12)',
              }}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}

function NotificationRow({
  row,
  isActive,
  onSelect,
  onMarkRead,
  onMarkUnread,
  onHover,
  showHoverAction,
  showReadMore,
}: {
  row: Phase1NotifRow;
  isActive: boolean;
  onSelect: () => void;
  onMarkRead: () => void;
  onMarkUnread: () => void;
  onHover?: (el: HTMLElement | null) => void;
  /** Show contextual CTA below workspace tag on hover */
  showHoverAction?: boolean;
  /** Slack-style Show more on hover at end of line 2 */
  showReadMore?: boolean;
}) {
  const [hoverSettled, setHoverSettled] = useState(false);
  const [actionReady, setActionReady] = useState(false);
  const [bodyExpanded, setBodyExpanded] = useState(false);
  const actionDwellRef = useRef<number | null>(null);
  const rowFadeBg = rowBackground(row, isActive, hoverSettled);

  const hoverActionLabel = showHoverAction ? getPhase1NotifRowActionLabel(row) : null;
  const isUnread = row.state !== 'read';
  const showStatusDot = isUnread && !isActive;
  const statusDotColor =
    row.state === 'unseen' ? 'var(--switch-bg-on-idle)' : 'var(--neutral-12)';
  const isWorkflowAvatar = row.avatarIcon === 'workflow';
  const isMentionAvatar = row.avatarIcon === 'mention';
  const isSystemAvatar = isSystemAvatarIcon(row.avatarIcon);
  /** Share/connector/etc. keep Torq shell even when `personAvatar` is set for copy */
  const isPersonAvatar =
    Boolean(row.personAvatar) && !isMentionAvatar && !isSystemAvatar;
  const avatarBg = isWorkflowAvatar
    ? PHASE1_WORKFLOW_AVATAR_BG
    : isMentionAvatar
      ? PHASE1_CASE_MENTION_AVATAR_BG
      : isSystemAvatar
        ? PHASE1_TORQ_AVATAR_BG
        : isPersonAvatar
          ? row.personAvatar!.color
          : row.avatarBg;
  const avatarShellBg = isPersonAvatar ? 'transparent' : avatarBg;
  const avatarIconColor = isWorkflowAvatar ? PHASE1_WORKFLOW_AVATAR_ICON : 'white';
  const badgeConfig = getPhase1BadgeConfig(row);
  const showAction = Boolean(actionReady && hoverActionLabel);

  const clearActionDwellTimer = useCallback(() => {
    if (actionDwellRef.current) {
      window.clearTimeout(actionDwellRef.current);
      actionDwellRef.current = null;
    }
  }, []);

  useEffect(() => () => clearActionDwellTimer(), [clearActionDwellTimer]);

  const resetHover = useCallback(() => {
    clearActionDwellTimer();
    setHoverSettled(false);
    setActionReady(false);
    setBodyExpanded(false);
    onHover?.(null);
  }, [clearActionDwellTimer, onHover]);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      onMouseEnter={(e) => {
        clearActionDwellTimer();
        setHoverSettled(true);
        setActionReady(false);
        onHover?.(e.currentTarget);
        if (showHoverAction && hoverActionLabel) {
          actionDwellRef.current = window.setTimeout(() => {
            setActionReady(true);
          }, NOTIF_ACTION_DWELL_MS);
        }
      }}
      onMouseLeave={resetHover}
      animate={{
        paddingBottom: showAction ? 14 : 8,
      }}
      transition={{
        paddingBottom: NOTIF_ROW_MOTION,
      }}
      style={{
        position: 'relative',
        display: 'flex',
        gap: 12,
        paddingTop: 8,
        paddingLeft: 16,
        paddingRight: 16,
        cursor: 'pointer',
        background: rowFadeBg,
        transition: 'background 0.14s ease',
      }}
    >
      <div
        style={{
          position: 'relative',
          flexShrink: 0,
          width: PHASE1_NOTIF_AVATAR_SIZE,
          height: PHASE1_NOTIF_AVATAR_SIZE,
        }}
      >
        <div
          style={{
            width: PHASE1_NOTIF_AVATAR_SIZE,
            height: PHASE1_NOTIF_AVATAR_SIZE,
            borderRadius: '50%',
            background: avatarShellBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isSystemAvatar ? (
            <TorqLogoMark />
          ) : isMentionAvatar ? (
            <CaseMentionShieldIcon />
          ) : isPersonAvatar && row.personAvatar ? (
            <Phase1UserAvatar
              name=""
              initials={row.personAvatar.initials}
              avatarColor={row.personAvatar.color}
              size={PHASE1_NOTIF_AVATAR_SIZE}
            />
          ) : isWorkflowAvatar ? (
            <IconWorkflowAvatar />
          ) : (
            <IconNotifAvatar icon={row.avatarIcon} color={avatarIconColor} />
          )}
        </div>
        {badgeConfig && (
          <span
            style={{
              position: 'absolute',
              right: -2,
              bottom: -2,
              width: PHASE1_NOTIF_AVATAR_BADGE_SIZE,
              height: PHASE1_NOTIF_AVATAR_BADGE_SIZE,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              boxShadow: '0 1px 3px rgba(9, 10, 11, 0.12)',
              ...(badgeConfig.variant === 'fail'
                ? {
                    background: '#EA231A',
                    border: '2px solid #FFFFFF',
                  }
                : {
                    background: '#FFFFFF',
                    border: '2px solid #FFFFFF',
                  }),
            }}
          >
            {badgeConfig.variant === 'fail' ? (
              <WorkflowFailBadgeIcon />
            ) : (
              <badgeConfig.Icon
                size={PHASE1_NOTIF_BADGE_ICON_SIZE}
                color={badgeConfig.iconColor}
                strokeWidth={2.5}
                aria-hidden
              />
            )}
          </span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: title + timestamp / mark-read (fixed trailing width) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: row.body ? 2 : 0,
          }}
        >
          <NotificationTitle row={row} />
          <div
            style={{
              width: NOTIF_ROW_TRAILING_SLOT_W,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              minHeight: 28,
            }}
            onClick={(e) => hoverSettled && e.stopPropagation()}
          >
            <div
              style={{
                display: hoverSettled ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 6,
                width: '100%',
              }}
              aria-hidden={hoverSettled}
            >
              <span
                style={{
                  fontSize: p1Font.body2,
                  fontFamily: p1Font.family,
                  fontWeight: isUnread ? 500 : 400,
                  color: isUnread ? 'var(--neutral-12)' : 'var(--neutral-6)',
                  lineHeight: 1.35,
                  whiteSpace: 'nowrap',
                }}
              >
                {row.timestamp}
              </span>
              {showStatusDot ? (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: statusDotColor,
                    flexShrink: 0,
                  }}
                  aria-hidden
                />
              ) : (
                <span style={{ width: 8, flexShrink: 0 }} aria-hidden />
              )}
            </div>
            <div
              style={{
                display: hoverSettled ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'flex-end',
                width: '100%',
              }}
            >
              {row.state === 'read' ? (
                <ReadUnreadActionButton label="Mark as unread" onClick={() => onMarkUnread()}>
                  <IconMarkUnread />
                </ReadUnreadActionButton>
              ) : (
                <ReadUnreadActionButton label="Mark as read" onClick={() => onMarkRead()}>
                  <IconMarkRead />
                </ReadUnreadActionButton>
              )}
            </div>
          </div>
        </div>
        {row.body ? (
          <NotificationRowBody
            body={row.body}
            showExpandAction={Boolean(showReadMore)}
            rowHovered={hoverSettled}
            fadeBackground={rowFadeBg}
            expanded={bodyExpanded}
            onExpandedChange={setBodyExpanded}
          />
        ) : null}
        <div style={{ marginTop: 8 }}>
          <Tag
            color="neutral"
            appearance="surface"
            size="small"
            icon={<Building2 className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />}
          >
            {row.workspace}
          </Tag>
        </div>
        <AnimatePresence initial={false}>
          {showAction && (
            <motion.div
              key="row-action"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: NOTIF_ROW_MOTION,
                opacity: { type: 'tween', duration: 0.14, ease: NOTIF_ROW_EASE },
              }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ marginTop: 8 }}>
                <Button
                  theme="secondary"
                  size="small"
                  className="self-start"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                  }}
                >
                  {hoverActionLabel}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export type Phase1InboxInteraction =
  | 'navigate'
  | 'hover-preview'
  | 'hover-action'
  | 'read-more';

export interface Phase1InboxPanelProps {
  states: Record<string, 'unseen' | 'seen' | 'read'>;
  onStatesChange: React.Dispatch<React.SetStateAction<Record<string, 'unseen' | 'seen' | 'read'>>>;
  onNavigate: (row: Phase1NotifRow) => void;
  onClose: () => void;
  /** Active sidebar workspace — inbox rows prioritize this workspace */
  currentWorkspaceId?: string;
  interaction?: Phase1InboxInteraction;
  onRowHover?: (row: Phase1NotifRow | null, el: HTMLElement | null) => void;
  variant?: 'docked' | 'floating';
}

export function Phase1InboxPanel({
  states,
  onStatesChange,
  onNavigate,
  onClose,
  currentWorkspaceId = 'torq-dev',
  interaction = 'navigate',
  onRowHover,
  variant = 'docked',
}: Phase1InboxPanelProps) {
  const [tab, setTab] = useState<Phase1Tab>('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelHovered, setPanelHovered] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const unreadSnapshotRef = useRef<Set<string> | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(
    () => buildRows(states, currentWorkspaceId),
    [states, currentWorkspaceId],
  );

  const trueUnreadIds = useMemo(
    () =>
      new Set(
        rows
          .filter((r) => r.state === 'unseen' || r.state === 'seen')
          .map((r) => r.id),
      ),
    [rows],
  );

  const unreadCount = trueUnreadIds.size;

  const refreshUnreadSnapshot = useCallback(() => {
    unreadSnapshotRef.current = new Set(trueUnreadIds);
  }, [trueUnreadIds]);

  useEffect(() => {
    if (tab === 'unread' && unreadSnapshotRef.current === null) {
      refreshUnreadSnapshot();
    }
    if (tab === 'all') {
      unreadSnapshotRef.current = null;
    }
  }, [tab, refreshUnreadSnapshot]);

  function switchTab(next: Phase1Tab) {
    if (next === 'unread') {
      refreshUnreadSnapshot();
    }
    setTab(next);
  }

  const tabFiltered = useMemo(() => {
    if (tab === 'all') return rows;
    const snap = unreadSnapshotRef.current ?? trueUnreadIds;
    return rows.filter((r) => snap.has(r.id));
  }, [tab, rows, trueUnreadIds]);

  const groupedFeed = useMemo(() => groupPhase1InboxRows(tabFiltered), [tabFiltered]);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(t)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [menuOpen]);

  function markRead(id: string) {
    onStatesChange((s) => ({ ...s, [id]: 'read' }));
  }

  function markUnread(id: string) {
    onStatesChange((s) => ({ ...s, [id]: 'seen' }));
  }

  function markAllRead() {
    onStatesChange((s) => {
      const next = { ...s };
      for (const id of Object.keys(next)) next[id] = 'read';
      return next;
    });
    setMenuOpen(false);
  }

  function handleRowSelect(row: Phase1NotifRow) {
    setActiveId(row.id);
    if (row.state !== 'read') {
      markRead(row.id);
    }
    onNavigate(row);
  }

  function handleRowHover(row: Phase1NotifRow, el: HTMLElement | null) {
    onRowHover?.(el ? row : null, el);
  }

  const empty = tabFiltered.length === 0;

  return (
    <section
      onMouseEnter={() => setPanelHovered(true)}
      onMouseLeave={() => setPanelHovered(false)}
      style={{
        width: '100%',
        minWidth: variant === 'floating' ? 0 : 354,
        height: '100%',
        background: '#FFFFFF',
        borderRight: variant === 'floating' ? 'none' : '1px solid var(--border-level-2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: variant === 'floating' ? 12 : 0,
      }}
    >
      {/* Header — Figma 6177-32782 */}
      <header style={{ flexShrink: 0, borderBottom: '1px solid #E5E7EB' }}>
        {/* Row 1: Inbox | (spacer) | collapse on panel hover | ··· */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 16px 0',
            minHeight: 36,
          }}
        >
            <h2
              style={{
                margin: 0,
                fontSize: p1Font.body0,
                fontWeight: 600,
                fontFamily: p1Font.family,
                color: p1Text.primary,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              Inbox
            </h2>

          <div style={{ flex: 1, minWidth: 8 }} aria-hidden />

          <AnimatePresence>
            {panelHovered && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.12 }}
                onClick={onClose}
                title="Collapse panel"
                aria-label="Collapse panel"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: 'none',
                  borderRadius: 6,
                  padding: 6,
                  cursor: 'pointer',
                  background: 'transparent',
                  color: p1Text.tertiary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F3F4F6';
                  e.currentTarget.style.color = p1Text.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = p1Text.tertiary;
                }}
              >
                <ChevronsLeft className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>

            <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                type="button"
                aria-label="More actions"
                onClick={() => setMenuOpen((o) => !o)}
                style={{
                  background: menuOpen ? '#F3F4F6' : 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  padding: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  if (!menuOpen) e.currentTarget.style.background = '#F3F4F6';
                }}
                onMouseLeave={(e) => {
                  if (!menuOpen) e.currentTarget.style.background = 'transparent';
                }}
              >
                <IconMoreVertical />
              </button>
              {menuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 4,
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    minWidth: 160,
                    zIndex: 30,
                    padding: 4,
                  }}
                >
                  <button
                    type="button"
                    onClick={markAllRead}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '8px 10px',
                      border: 'none',
                      background: 'transparent',
                      borderRadius: 6,
                      fontSize: p1Font.body1,
                      fontFamily: p1Font.family,
                      color: p1Text.primary,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <IconCheck />
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
        </div>

        {/* Row 2: tabs — +4px gap below row 1 */}
        <div
          role="tablist"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 16,
            padding: '14px 16px 0',
          }}
        >
          {(['all', 'unread'] as const).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => switchTab(t)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '0 2px 10px',
                fontSize: p1Font.body1,
                fontFamily: p1Font.family,
                fontWeight: active ? 600 : 400,
                color: p1Text.primary,
                  border: 'none',
                  borderBottom: active ? '2px solid #111827' : '2px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  marginBottom: -1,
                  lineHeight: 1.25,
                }}
              >
                {t === 'all' ? 'All' : 'Unread'}
                {t === 'unread' && unreadCount > 0 && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 18,
                      height: 18,
                      padding: '0 5px',
                      fontSize: p1Font.body2,
                      fontWeight: 500,
                      fontFamily: p1Font.family,
                      color: p1Text.secondary,
                      background: '#F3F4F6',
                      borderRadius: 5,
                      lineHeight: 1,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Feed */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <div ref={feedRef} style={{ height: '100%', overflowY: 'auto' }}>
          {empty ? (
            <div
              style={{
                height: 220,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 24,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconInboxEmpty />
              </div>
              <div style={{ fontSize: p1Font.body1, fontFamily: p1Font.family, fontWeight: 600, color: p1Text.primary }}>
                {tab === 'unread' ? 'No unread notifications' : 'All caught up'}
              </div>
              <div style={{ fontSize: p1Font.body2, fontFamily: p1Font.family, color: p1Text.tertiary, textAlign: 'center' }}>
                {tab === 'unread'
                  ? 'Switch to All to see your history'
                  : 'New notifications will appear here'}
              </div>
            </div>
          ) : (
            <>
              {groupedFeed.map(({ label, rows: sectionRows }) => (
                <div key={label}>
                  <InboxTimeSectionHeader label={label} />
                  {sectionRows.map((row) => (
                    <NotificationRow
                      key={row.id}
                      row={row}
                      isActive={activeId === row.id}
                      onSelect={() => handleRowSelect(row)}
                      onMarkRead={() => markRead(row.id)}
                      onMarkUnread={() => markUnread(row.id)}
                      showHoverAction={interaction === 'hover-action'}
                      showReadMore={interaction === 'read-more'}
                      onHover={
                        interaction === 'hover-preview'
                          ? (el) => handleRowHover(row, el)
                          : undefined
                      }
                    />
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
