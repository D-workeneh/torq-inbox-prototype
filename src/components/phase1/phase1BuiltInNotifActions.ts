import type { Phase1BuiltInActionSet, Phase1NotifRow } from './types';
import type { ButtonTheme } from '@/components/ui/Button';

export const PHASE1_CASE_EXPORT_CSV_DOCS_URL =
  'https://kb.torq.io/en/articles/13733023-workflow-template-export-observables-as-csv';

export type Phase1BuiltInActionId =
  | 'approve'
  | 'reject'
  | 'retry'
  | 'download'
  | 'activate'
  | 'accept';

export type Phase1BuiltInActionButton = {
  id: Phase1BuiltInActionId;
  label: string;
  theme: ButtonTheme;
  icon?: 'download';
};

export type Phase1BuiltInNotifActions = {
  actions: Phase1BuiltInActionButton[];
};

const APPROVE_REJECT: Phase1BuiltInActionButton[] = [
  { id: 'approve', label: 'Approve', theme: 'secondary' },
  { id: 'reject', label: 'Reject', theme: 'third' },
];

const ACCEPT_REJECT: Phase1BuiltInActionButton[] = [
  { id: 'accept', label: 'Accept', theme: 'secondary' },
  { id: 'reject', label: 'Reject', theme: 'third' },
];

const ACTION_SETS: Record<Phase1BuiltInActionSet, Phase1BuiltInActionButton[]> = {
  'publish-approval': APPROVE_REJECT,
  'share-request': ACCEPT_REJECT,
  'export-retry': [{ id: 'retry', label: 'Retry', theme: 'secondary' }],
  'export-download': [
    { id: 'download', label: 'Download CSV', theme: 'secondary', icon: 'download' },
  ],
  'org-activate': [{ id: 'activate', label: 'Activate account', theme: 'secondary' }],
  'invite-accept': [{ id: 'accept', label: 'Accept', theme: 'secondary' }],
};

export function getPhase1BuiltInNotifActions(
  row: Phase1NotifRow,
): Phase1BuiltInNotifActions | null {
  if (row.builtInActionSet) {
    return { actions: ACTION_SETS[row.builtInActionSet] };
  }

  if (row.avatarIcon === 'publish') {
    return { actions: APPROVE_REJECT };
  }

  if (row.avatarIcon === 'export' && row.title.includes('please try again')) {
    return { actions: [{ id: 'retry', label: 'Retry', theme: 'secondary' }] };
  }

  if (
    row.avatarIcon === 'export' &&
    (row.title.includes('export succeeded') || row.title.includes('ready for download'))
  ) {
    return {
      actions: [
        { id: 'download', label: 'Download CSV', theme: 'secondary', icon: 'download' },
      ],
    };
  }

  if (
    row.title.includes('was shared with') ||
    row.title.includes('integration was shared with') ||
    row.title.includes('step was shared with')
  ) {
    return { actions: ACCEPT_REJECT };
  }

  if (row.avatarIcon === 'organization') {
    return { actions: [{ id: 'activate', label: 'Activate account', theme: 'secondary' }] };
  }

  if (row.avatarIcon === 'invite') {
    return { actions: [{ id: 'accept', label: 'Accept', theme: 'secondary' }] };
  }

  return null;
}

export function getPhase1BuiltInActionFeedback(
  actionId: Phase1BuiltInActionId,
  row: Phase1NotifRow,
): string {
  switch (actionId) {
    case 'approve':
      return `Approved — ${row.title}`;
    case 'reject':
      return `Rejected — ${row.title}`;
    case 'retry':
      return 'Retrying case export…';
    case 'download':
      return 'Download started — CSV export bundle';
    case 'activate':
      return 'Account activation started';
    case 'accept':
      if (row.builtInActionSet === 'invite-accept' || row.avatarIcon === 'invite') {
        return `Invitation accepted — ${row.workspace}`;
      }
      return `Accepted — ${row.title}`;
    default:
      return 'Action completed';
  }
}

export function getPhase1BuiltInActionResultLabel(
  actionId: Phase1BuiltInActionId,
  row: Phase1NotifRow,
): string {
  switch (actionId) {
    case 'approve':
      return 'Action approved';
    case 'reject':
      if (row.builtInActionSet === 'share-request') {
        return 'Request declined';
      }
      return 'Action rejected';
    case 'retry':
      return 'Retry started';
    case 'download':
      return 'Download started';
    case 'activate':
      return 'Account activation started';
    case 'accept':
      if (row.builtInActionSet === 'invite-accept' || row.avatarIcon === 'invite') {
        return 'Invitation accepted';
      }
      return 'Request accepted';
    default:
      return 'Action completed';
  }
}
