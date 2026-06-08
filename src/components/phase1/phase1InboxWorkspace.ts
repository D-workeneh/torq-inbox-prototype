import { APP_WORKSPACES } from '@/lib/appNavConfig';
import type { Phase1Notification } from './types';

/** User belongs to these three workspaces; inbox mix is 50% current + 25% each other. */
export const PHASE1_INBOX_MEMBER_WORKSPACES = [
  'torq-dev',
  'torq-staging',
  'torq-prod',
] as const;

export type Phase1InboxMemberWorkspace = (typeof PHASE1_INBOX_MEMBER_WORKSPACES)[number];

/** Visible inbox rows after workspace mix (even split → 11 / 5 / 5). */
export const PHASE1_INBOX_MIX_TOTAL = 22;

export function workspaceLabel(workspaceId: string): string {
  return APP_WORKSPACES.find((w) => w.id === workspaceId)?.name ?? workspaceId;
}

export function workspaceAccentColor(workspaceId: string): string {
  return APP_WORKSPACES.find((w) => w.id === workspaceId)?.color ?? '#2864FF';
}

function isMemberWorkspace(workspaceId: string): workspaceId is Phase1InboxMemberWorkspace {
  return (PHASE1_INBOX_MEMBER_WORKSPACES as readonly string[]).includes(workspaceId);
}

function memberTrio(currentWorkspaceId: string): [string, string, string] {
  if (isMemberWorkspace(currentWorkspaceId)) {
    const others = PHASE1_INBOX_MEMBER_WORKSPACES.filter((id) => id !== currentWorkspaceId);
    return [currentWorkspaceId, others[0], others[1]];
  }
  return [PHASE1_INBOX_MEMBER_WORKSPACES[0], PHASE1_INBOX_MEMBER_WORKSPACES[1], PHASE1_INBOX_MEMBER_WORKSPACES[2]];
}

function sortByNewest(items: Phase1Notification[]): Phase1Notification[] {
  return [...items].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shuffleItems<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let state = seed || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Newest first globally, but shuffle within each day so types are not clustered */
function sortInboxFeedRealistic(
  items: Phase1Notification[],
  seed: string,
): Phase1Notification[] {
  const byDay = new Map<string, Phase1Notification[]>();
  for (const item of sortByNewest(items)) {
    const day = item.occurredAt.slice(0, 10);
    const bucket = byDay.get(day) ?? [];
    bucket.push(item);
    byDay.set(day, bucket);
  }

  const days = [...byDay.keys()].sort((a, b) => b.localeCompare(a));
  return days.flatMap((day, index) =>
    shuffleItems(byDay.get(day) ?? [], hashSeed(`${seed}:${day}:${index}`)),
  );
}

function pickShuffled(
  pool: Phase1Notification[],
  count: number,
  seed: string,
  excludeIds: Set<string>,
): Phase1Notification[] {
  const available = pool.filter((n) => !excludeIds.has(n.id));
  const picked = shuffleItems(available, hashSeed(seed)).slice(0, count);
  for (const item of picked) excludeIds.add(item.id);
  return picked;
}

/**
 * Mix inbox notifications: 50% from the active workspace, 25% from each of the other two
 * member workspaces (3 workspaces total).
 */
export function getPhase1NotificationsForWorkspace(
  currentWorkspaceId: string,
  all: Phase1Notification[],
): Phase1Notification[] {
  const [current, otherA, otherB] = memberTrio(currentWorkspaceId);
  const total = PHASE1_INBOX_MIX_TOTAL;
  const countCurrent = Math.round(total * 0.5);
  const countEachOther = Math.floor((total - countCurrent) / 2);
  const excludeIds = new Set<string>();

  const merged = [
    ...pickShuffled(
      all.filter((n) => n.workspaceId === current),
      countCurrent,
      `${currentWorkspaceId}:current`,
      excludeIds,
    ),
    ...pickShuffled(
      all.filter((n) => n.workspaceId === otherA),
      countEachOther,
      `${currentWorkspaceId}:${otherA}`,
      excludeIds,
    ),
    ...pickShuffled(
      all.filter((n) => n.workspaceId === otherB),
      countEachOther,
      `${currentWorkspaceId}:${otherB}`,
      excludeIds,
    ),
  ];

  if (merged.length < total) {
    const remainder = pickShuffled(
      all.filter((n) => !excludeIds.has(n.id)),
      total - merged.length,
      `${currentWorkspaceId}:fill`,
      excludeIds,
    );
    merged.push(...remainder);
  }

  return sortInboxFeedRealistic(merged, currentWorkspaceId);
}
