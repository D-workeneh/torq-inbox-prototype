'use client';

import { useRef, useState } from 'react';
import {
  NotificationPolicyContent,
  type NotificationPolicyHandle,
} from '@/components/settings/WorkspaceNotificationPolicyContent';
import type { OrgAdminPageId } from '@/lib/organizationAdminConfig';
import { OrgAdminPageHeader } from './OrgAdminPageHeader';
import { OrgAdminSidebar } from './OrgAdminSidebar';
import { OrgRolesView } from './OrgRolesView';
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
  const notificationsPolicyRef = useRef<NotificationPolicyHandle>(null);

  function guardedNavigate(page: OrgAdminPageId) {
    if (currentPage === 'notifications' && page !== 'notifications') {
      notificationsPolicyRef.current?.requestLeave(() => setCurrentPage(page));
      return;
    }
    setCurrentPage(page);
  }

  function guardedBackToWorkspace() {
    if (currentPage === 'notifications') {
      notificationsPolicyRef.current?.requestLeave(onBackToWorkspace);
      return;
    }
    onBackToWorkspace();
  }

  function guardedWorkspaceSelect(workspaceId: string) {
    if (currentPage === 'notifications') {
      notificationsPolicyRef.current?.requestLeave(() => onWorkspaceSelect(workspaceId));
      return;
    }
    onWorkspaceSelect(workspaceId);
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--color-surface-primary)]">
      <OrgAdminSidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        currentPage={currentPage}
        onNavigate={guardedNavigate}
        onBackToWorkspace={guardedBackToWorkspace}
        onWorkspaceSelect={guardedWorkspaceSelect}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {currentPage === 'workspaces' && <OrgWorkspacesView />}
        {currentPage === 'notifications' && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <OrgAdminPageHeader
              title="Notifications"
              description="Set organization-wide notification policies. These apply to all workspaces and users unless overridden at a lower level."
            />
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <NotificationPolicyContent
                ref={notificationsPolicyRef}
                scope="organization"
                showHeader={false}
              />
            </div>
          </div>
        )}
        {currentPage === 'cases-dashboards' && <PlaceholderPage title="Cases Dashboards" />}
        {currentPage === 'roles' && <OrgRolesView />}
      </div>
    </div>
  );
}
