'use client';

import { useState } from 'react';
import { NotificationPolicyContent } from '@/components/settings/WorkspaceNotificationPolicyContent';
import type { OrgAdminPageId } from '@/lib/organizationAdminConfig';
import { OrgAdminSidebar } from './OrgAdminSidebar';
import { OrgWorkspacesView } from './OrgWorkspacesView';

export interface OrganizationAdminExperienceProps {
  onBackToWorkspace: () => void;
  onWorkspaceSelect: (workspaceId: string) => void;
  initialPage?: OrgAdminPageId;
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-[var(--color-surface-primary)]">
      <p className="text-[var(--font-size-sm)] text-[var(--color-text-tertiary)]">
        {title} — coming soon in prototype
      </p>
    </div>
  );
}

export function OrganizationAdminExperience({
  onBackToWorkspace,
  onWorkspaceSelect,
  initialPage = 'workspaces',
}: OrganizationAdminExperienceProps) {
  const [currentPage, setCurrentPage] = useState<OrgAdminPageId>(initialPage);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--color-surface-primary)]">
      <OrgAdminSidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onBackToWorkspace={onBackToWorkspace}
        onWorkspaceSelect={onWorkspaceSelect}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {currentPage === 'workspaces' && <OrgWorkspacesView />}
        {currentPage === 'notifications' && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b border-[var(--color-border-2)] px-8 py-6">
              <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Notifications</h1>
              <p className="mt-1 text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
                Set organization-wide notification policies. These apply to all workspaces and users unless overridden at a lower level.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <NotificationPolicyContent scope="organization" showHeader={false} />
            </div>
          </div>
        )}
        {currentPage === 'cases-dashboards' && <PlaceholderPage title="Cases Dashboards" />}
        {currentPage === 'roles' && <PlaceholderPage title="Roles" />}
      </div>
    </div>
  );
}
