import { PHASE1_WORKSPACES } from './data';
import type { Phase1AvatarIcon, Phase1NotifRow } from './types';

/** Platform/system notifications use Torq black avatar (not workflow or user mention) */
export function isSystemAvatarIcon(icon: Phase1AvatarIcon): boolean {
  return icon !== 'workflow' && icon !== 'mention';
}

export function rowBackground(
  row: Phase1NotifRow,
  isActive: boolean,
  isHovered: boolean,
): string {
  if (isActive) return '#F3F4F6';
  if (!isHovered) return '#FFFFFF';
  return row.state === 'read' ? '#FAFAFA' : '#F9FAFB';
}

/** empty wsFilter = all workspaces (Phase 2 pattern) */
export function matchesWorkspaceFilter(wsFilter: string[], workspaceName: string): boolean {
  if (wsFilter.length === 0) return true;
  return wsFilter.some(
    (id) => PHASE1_WORKSPACES.find((w) => w.id === id)?.name === workspaceName,
  );
}

export function isUnreadState(state: string): boolean {
  return state === 'unseen' || state === 'seen';
}
