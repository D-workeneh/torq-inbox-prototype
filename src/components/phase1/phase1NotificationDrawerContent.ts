import type { Phase1NotifRow } from './types';

export interface Phase1NotificationDrawerContent {
  /** Short title for drawer header */
  drawerTitle: string;
  headline: string;
  summary: string;
  meta: string;
  ctaLabel: string;
  preview?: 'comment' | 'export' | 'workflow-error';
}

export function getPhase1DrawerTitle(row: Phase1NotifRow): string {
  const sep = ' — ';
  const idx = row.title.indexOf(sep);
  if (idx >= 0) return row.title.slice(idx + sep.length).trim();
  if (row.title.length > 42) return `${row.title.slice(0, 40)}…`;
  return row.title;
}

export function getPhase1NotificationDrawerContent(
  row: Phase1NotifRow,
): Phase1NotificationDrawerContent {
  const meta = `${row.workspace} · ${row.timestamp}`;

  if (row.target.type === 'case') {
    const isExport = row.avatarIcon === 'export';
    const isMention = row.avatarIcon === 'mention';
    return {
      drawerTitle: isMention ? `Case #${row.target.caseKey}` : getPhase1DrawerTitle(row),
      headline: row.title,
      summary: isMention
        ? 'You were mentioned in a case discussion.'
        : (row.body ?? 'Case activity requires your attention.'),
      meta,
      ctaLabel: isExport ? 'Retry export' : 'Open full case view',
      preview: isExport ? 'export' : isMention ? 'comment' : undefined,
    };
  }

  if (row.target.type === 'workflow') {
    const isPublish = row.avatarIcon === 'publish';
    return {
      drawerTitle: getPhase1DrawerTitle(row),
      headline: row.title,
      summary: row.body ?? 'Workflow activity in your workspace.',
      meta,
      ctaLabel: isPublish ? 'Review publish request' : 'Open workflow',
      preview: row.avatarIcon === 'workflow' ? 'workflow-error' : undefined,
    };
  }

  if (row.avatarIcon === 'ai') {
    const critical = row.severity === 'critical';
    return {
      drawerTitle: 'AI credits',
      headline: row.title,
      summary: row.body ?? 'AI usage update for your organization.',
      meta,
      ctaLabel: critical ? 'View usage & limits' : 'Open usage dashboard',
    };
  }

  if (row.avatarIcon === 'invite') {
    return {
      drawerTitle: 'Invitation',
      headline: row.title,
      summary: row.body ?? 'Workspace invitation pending your response.',
      meta,
      ctaLabel: 'Review invitation',
    };
  }

  if (row.avatarIcon === 'organization') {
    return {
      drawerTitle: 'Organization',
      headline: row.title,
      summary: row.body ?? 'Organization role change for your account.',
      meta,
      ctaLabel: 'Activate account',
    };
  }

  if (row.avatarIcon === 'share' || row.avatarIcon === 'connector') {
    const body = row.body ?? '';
    const ctaLabel = body.includes('Review workflow')
      ? 'Review workflow'
      : body.includes('Review integration')
        ? 'Review integration'
        : body.includes('Review step')
          ? 'Review step'
          : body.includes('Edit sharing settings')
            ? 'Edit sharing settings'
            : 'Open integration settings';
    return {
      drawerTitle: getPhase1DrawerTitle(row),
      headline: row.title,
      summary: row.body ?? 'Sharing update for an integration.',
      meta,
      ctaLabel,
    };
  }

  return {
    drawerTitle: getPhase1DrawerTitle(row),
    headline: row.title,
    summary: row.body ?? 'Notification summary.',
    meta,
    ctaLabel: 'View details',
  };
}

/** In-row hover action (floating drawer + action) — null when no CTA applies */
export function getPhase1NotifRowActionLabel(row: Phase1NotifRow): string | null {
  if (row.target.type === 'case') {
    if (row.avatarIcon === 'export') return 'Retry export';
    return 'Open case';
  }

  if (row.target.type === 'workflow') {
    if (row.avatarIcon === 'publish') return 'Review publish';
    return 'Open workflow';
  }

  if (row.avatarIcon === 'ai') {
    return row.severity === 'critical' ? 'View usage & limits' : 'View usage';
  }

  if (row.avatarIcon === 'invite') {
    return 'Accept invite';
  }

  if (row.avatarIcon === 'organization') {
    return 'Activate account';
  }

  if (row.avatarIcon === 'share' || row.avatarIcon === 'connector') {
    const body = row.body ?? '';
    if (body.includes('Review workflow')) return 'Review workflow';
    if (body.includes('Review integration')) return 'Review integration';
    if (body.includes('Review step')) return 'Review step';
    if (body.includes('Edit sharing settings')) return 'Edit sharing settings';
    return 'View integration';
  }

  if (row.target.type === 'workflows') {
    return 'View workflows';
  }

  return null;
}
