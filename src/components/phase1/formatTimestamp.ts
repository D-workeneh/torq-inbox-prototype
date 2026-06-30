import type { Phase1NotifRow } from './types';

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const CLOCK_AFTER_MS = 3 * HOUR_MS;

export type Phase1InboxTimeSection = 'today' | 'thisWeek' | 'older';

export const PHASE1_INBOX_TIME_SECTIONS: { id: Phase1InboxTimeSection; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'thisWeek', label: 'This week' },
  { id: 'older', label: 'Older' },
];

function startOfLocalDay(d: Date): number {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

function formatClockTime(d: Date): string {
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatMonthDayTime(d: Date): string {
  const date = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  return `${date}, ${formatClockTime(d)}`;
}

function formatWeekdayTime(d: Date): string {
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  return `${weekday}, ${formatClockTime(d)}`;
}

export function getPhase1InboxTimeSection(
  occurredAt: Date,
  now: Date = new Date(),
): Phase1InboxTimeSection {
  const t = occurredAt.getTime();
  if (t >= startOfLocalDay(now)) return 'today';
  if (t >= now.getTime() - WEEK_MS) return 'thisWeek';
  return 'older';
}

function formatTodayTimestamp(occurredAt: Date, diffMs: number): string {
  if (diffMs < MINUTE_MS) return 'Just now';

  const minutes = Math.floor(diffMs / MINUTE_MS);
  if (minutes < 60) {
    return minutes === 1 ? '1 min ago' : `${minutes} min ago`;
  }

  if (diffMs < CLOCK_AFTER_MS) {
    const hours = Math.floor(diffMs / HOUR_MS);
    return hours === 1 ? '1h ago' : `${hours}h ago`;
  }

  return formatClockTime(occurredAt);
}

/** Inbox row timestamp — relative for today; "Mon 09:48" this week; "Jun 7, 09:12" when older */
export function formatPhase1InboxTimestamp(occurredAt: Date, now: Date = new Date()): string {
  const diffMs = Math.max(0, now.getTime() - occurredAt.getTime());
  const section = getPhase1InboxTimeSection(occurredAt, now);

  if (section === 'today') {
    return formatTodayTimestamp(occurredAt, diffMs);
  }

  if (section === 'thisWeek') {
    return formatWeekdayTime(occurredAt);
  }

  return formatMonthDayTime(occurredAt);
}

export function groupPhase1InboxRows(
  rows: Phase1NotifRow[],
  now: Date = new Date(),
): { section: Phase1InboxTimeSection; label: string; rows: Phase1NotifRow[] }[] {
  const buckets: Record<Phase1InboxTimeSection, Phase1NotifRow[]> = {
    today: [],
    thisWeek: [],
    older: [],
  };

  for (const row of rows) {
    buckets[getPhase1InboxTimeSection(new Date(row.occurredAt), now)].push(row);
  }

  const byNewest = (a: Phase1NotifRow, b: Phase1NotifRow) =>
    new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();

  for (const id of PHASE1_INBOX_TIME_SECTIONS.map((s) => s.id)) {
    buckets[id].sort(byNewest);
  }

  return PHASE1_INBOX_TIME_SECTIONS.map(({ id, label }) => ({
    section: id,
    label,
    rows: buckets[id],
  })).filter((g) => g.rows.length > 0);
}
