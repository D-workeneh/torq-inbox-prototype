'use client';

import { WorkspaceSettingsContent } from './WorkspaceSettingsContent';

/** Current workspace resource usage */
export function UsageSettingsContent({
  workspaceId,
  workspaceDisplayName,
  onOpenAiCredits,
}: {
  workspaceId: string;
  workspaceDisplayName?: string;
  onOpenAiCredits: (workspaceName: string) => void;
}) {
  return (
    <WorkspaceSettingsContent
      workspaceId={workspaceId}
      workspaceDisplayName={workspaceDisplayName}
      onOpenAiCredits={onOpenAiCredits}
    />
  );
}
