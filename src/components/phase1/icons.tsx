/** Phase 1 — inline SVG icons only (no icon library) */

export function IconTorqMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect width="28" height="28" rx="7" fill="#111827" />
      <text x="14" y="18" textAnchor="middle" fill="white" fontSize="14" fontWeight="700" fontFamily="system-ui,sans-serif">
        T
      </text>
    </svg>
  );
}

export function IconGrid({ active }: { active?: boolean }) {
  const c = active ? '#2563EB' : '#6B7280';
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="2" y="2" width="6" height="6" rx="1.5" stroke={c} strokeWidth="1.5" />
      <rect x="10" y="2" width="6" height="6" rx="1.5" stroke={c} strokeWidth="1.5" />
      <rect x="2" y="10" width="6" height="6" rx="1.5" stroke={c} strokeWidth="1.5" />
      <rect x="10" y="10" width="6" height="6" rx="1.5" stroke={c} strokeWidth="1.5" />
    </svg>
  );
}

export function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M9 2L3 4.5v4c0 3.5 2.5 6.5 6 7.5 3.5-1 6-4 6-7.5v-4L9 2z" stroke="#6B7280" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M3 14V8M7 14V5M11 14V10M15 14V3" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconInbox({ color = '#6B7280' }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M2 4h14v10H2V4z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M2 8h4l1.5 2h3L11 8h5" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChat() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M3 4h12v8H6l-3 3V4z" stroke="#6B7280" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="2.5" stroke="#6B7280" strokeWidth="1.5" />
      <path
        d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M4.2 4.2l1 1M12.8 12.8l1 1M4.2 13.8l1-1M12.8 5.2l1-1"
        stroke="#6B7280"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconMoreHorizontal() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="3" cy="8" r="1.25" fill="#6B7280" />
      <circle cx="8" cy="8" r="1.25" fill="#6B7280" />
      <circle cx="13" cy="8" r="1.25" fill="#6B7280" />
    </svg>
  );
}

/** Header ··· menu — vertical kebab */
export function IconMoreVertical() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="3.5" r="1.25" fill="#374151" />
      <circle cx="8" cy="8" r="1.25" fill="#374151" />
      <circle cx="8" cy="12.5" r="1.25" fill="#374151" />
    </svg>
  );
}

export function IconChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M9 3L5 7l4 4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M3 4.5L6 7.5 9 4.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronRight({ open }: { open?: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      style={{ transform: open ? 'rotate(90deg)' : undefined, transition: 'transform 0.15s' }}
    >
      <path d="M4.5 3L7.5 6 4.5 9" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M3 7l3 3 5-6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Inbox overflow menu — square check (Figma tq filter menu) */
export function IconInboxMenuMarkAllRead() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="#090A0B" strokeWidth="1.25" />
      <path
        d="M5 8.25l2.25 2.25L11 6.5"
        stroke="#090A0B"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Inbox overflow menu — gear (Figma tq filter menu) */
export function IconInboxMenuSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
        stroke="#090A0B"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="#090A0B" strokeWidth="1.75" />
    </svg>
  );
}

const MARK_ACTION_ICON_COLOR = '#808080';

export function IconMarkRead() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="3" y="3" width="10" height="10" rx="2" stroke={MARK_ACTION_ICON_COLOR} strokeWidth="1.5" />
      <path
        d="M5.5 8l2 2 3.5-4.5"
        stroke={MARK_ACTION_ICON_COLOR}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconMarkUnread() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="3" y="3" width="10" height="10" rx="2" stroke="var(--neutral-12)" strokeWidth="1.5" />
    </svg>
  );
}

export function IconInboxEmpty() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M2 5h16v11H2V5z" stroke="#9CA3AF" strokeWidth="1.5" />
      <path d="M2 9h5l1.5 2h3L13 9h5" stroke="#9CA3AF" strokeWidth="1.5" />
    </svg>
  );
}

export function IconLayers({ color = 'white' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M10 2L3 6l7 4 7-4-7-4z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 10l7 4 7-4" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 14l7 4 7-4" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="4" stroke="#9CA3AF" strokeWidth="1.5" />
      <path d="M9 9l3 3" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 3v8M3 7h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Inbox notification avatar (34px design spec) */
export const PHASE1_NOTIF_AVATAR_SIZE = 34;
export const PHASE1_NOTIF_AVATAR_BADGE_SIZE = 18;
export const PHASE1_NOTIF_BADGE_ICON_SIZE = 10;

/** Torq system notification avatar */
export const PHASE1_TORQ_AVATAR_BG = 'var(--neutral-12)';

/** Case mention — royal circle + white shield */
export const PHASE1_CASE_MENTION_AVATAR_BG = 'var(--royal)';

export function CaseMentionShieldIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.5L3.25 3.75v3.25c0 2.85 2.05 5.35 4.75 6.2 2.7-.85 4.75-3.35 4.75-6.2V3.75L8 1.5z"
        stroke="white"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M8 4.25v6.5" stroke="white" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

/** Workflow notification avatar — yellow circle + black path icon */
export const PHASE1_WORKFLOW_AVATAR_BG = '#FDD711';
export const PHASE1_WORKFLOW_AVATAR_ICON = '#111827';

/** Torq wordmark — three left-aligned bars (white on dark circle), 20% smaller than 20×14 */
export function TorqLogoMark({ width = 16, height = 11 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 20 14" fill="none" aria-hidden>
      <rect x="0" y="0" width="20" height="3" rx="1.5" fill="white" />
      <rect x="0" y="5.5" width="13" height="3" rx="1.5" fill="white" />
      <rect x="0" y="11" width="7" height="3" rx="1.5" fill="white" />
    </svg>
  );
}

export function IconWorkflowAvatar({
  color = PHASE1_WORKFLOW_AVATAR_ICON,
  size = 18,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1.5" y="3.25" width="6" height="2.5" rx="0.75" fill={color} />
      <rect x="10.5" y="12.25" width="6" height="2.5" rx="0.75" fill={color} />
      <path
        d="M7.5 4.5H9.25C10.75 4.5 10.75 6.75 9.25 8.25C7.75 9.75 9.25 12 10.75 13.25H10.5"
        stroke={color}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

const WF_STATUS_GREEN = '#16A34A';
const WF_STATUS_ORANGE = '#F97316';

/** Active workflow — green globe (workflows table status column) */
export function WorkflowStatusGlobeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7.25" stroke={WF_STATUS_GREEN} strokeWidth="1.5" />
      <ellipse cx="10" cy="10" rx="3.25" ry="7.25" stroke={WF_STATUS_GREEN} strokeWidth="1.5" />
      <path d="M3.25 7.5h13.5M3.25 12.5h13.5" stroke={WF_STATUS_GREEN} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Linked / partial — green globe + grey ring overlap (top-right) */
export function WorkflowStatusGlobeLinkedIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7.25" stroke={WF_STATUS_GREEN} strokeWidth="1.5" />
      <ellipse cx="10" cy="10" rx="3.25" ry="7.25" stroke={WF_STATUS_GREEN} strokeWidth="1.5" />
      <path d="M3.25 7.5h13.5M3.25 12.5h13.5" stroke={WF_STATUS_GREEN} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14.5" cy="5.5" r="3.25" stroke="#9CA3AF" strokeWidth="1.5" fill="#fff" />
    </svg>
  );
}

/** Scheduled / in-progress — orange pie (~75% filled) */
export function WorkflowStatusProgressIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="8" fill="#FFEDD5" />
      <path
        d="M10 2a8 8 0 0 1 0 16V10l6.93-4A8 8 0 0 1 10 2z"
        fill={WF_STATUS_ORANGE}
      />
      <circle cx="10" cy="10" r="8" stroke={WF_STATUS_ORANGE} strokeWidth="1.25" fill="none" />
    </svg>
  );
}

/** Filled white X for workflow-failure badge (on red circle) */
export function WorkflowFailBadgeIcon({ size = PHASE1_NOTIF_BADGE_ICON_SIZE }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" aria-hidden>
      <path
        fill="white"
        d="M6.47 5 8.77 2.7 7.77 1.7 5.47 4 3.23 1.7 2.23 2.7 4.53 5 2.23 7.3 3.23 8.3 5.47 6 7.77 8.3 8.77 7.3 6.47 5Z"
      />
    </svg>
  );
}

export function IconNotifAvatar({
  icon,
  color = 'white',
  size = 16,
}: {
  icon: string;
  color?: string;
  size?: number;
}) {
  const s = size;
  switch (icon) {
    case 'workflow':
      return <IconWorkflowAvatar color={color} />;
    case 'ai':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M8 2v2M8 12v2M2 8h2M12 8h2M4.5 4.5l1.5 1.5M10 10l1.5 1.5M4.5 11.5l1.5-1.5M10 6l1.5-1.5" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case 'mention':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M8 10a2 2 0 100-4 2 2 0 000 4z" stroke={color} strokeWidth="1.25" />
          <path d="M5 5.5C5 3.5 10 3.5 10 5.5V8" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case 'share':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="12" cy="4" r="1.5" fill={color} />
          <circle cx="4" cy="8" r="1.5" fill={color} />
          <circle cx="12" cy="12" r="1.5" fill={color} />
          <path d="M5.5 7l5-2M5.5 9l5 2" stroke={color} strokeWidth="1.25" />
        </svg>
      );
    case 'export':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M8 3v7M5.5 7.5L8 10l2.5-2.5" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 13h8" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case 'publish':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M3 13l5-10 5 10" stroke={color} strokeWidth="1.25" strokeLinejoin="round" />
        </svg>
      );
    case 'connector':
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M6 4h4v4H6V4zM3 9h4v3H3V9zM9 9h4v3H9V9z" stroke={color} strokeWidth="1.25" strokeLinejoin="round" />
        </svg>
      );
  }
}
