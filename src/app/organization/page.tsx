'use client';

import { OrganizationAdminExperience } from '@/components/organization/OrganizationAdminExperience';

export default function OrganizationPage() {
  return (
    <OrganizationAdminExperience
      onBackToWorkspace={() => {
        window.location.href = '/';
      }}
      onWorkspaceSelect={(workspaceId) => {
        window.location.href = `/?workspace=${encodeURIComponent(workspaceId)}`;
      }}
    />
  );
}
