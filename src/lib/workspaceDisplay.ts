import { APP_WORKSPACES, type Workspace } from '@/lib/appNavConfig';

export function getWorkspaceById(workspaceId: string): Workspace {
  return APP_WORKSPACES.find((w) => w.id === workspaceId) ?? APP_WORKSPACES[0];
}

export function getWorkspaceDisplayName(workspaceId: string): string {
  return getWorkspaceById(workspaceId).name;
}

export function getWorkspaceAvatarLetter(workspaceId: string): string {
  const ws = getWorkspaceById(workspaceId);
  return (ws.avatarLetter ?? ws.name[0]).toUpperCase();
}
