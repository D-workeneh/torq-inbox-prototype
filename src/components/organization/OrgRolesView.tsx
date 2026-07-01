'use client';

import { ChevronDown, Lock, Pencil, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { OrgAdminPageHeader } from './OrgAdminPageHeader';

type OrgRoleRow = {
  id: string;
  name: string;
  description: string;
  users: number | null;
  workspaces: number | null;
  type: 'default' | 'custom';
};

const ORG_ROLES: OrgRoleRow[] = [
  {
    id: 'administrator',
    name: 'Administrator',
    description: 'Provides permissions for the entire Torq platform',
    users: null,
    workspaces: null,
    type: 'default',
  },
  {
    id: 'workspace-admin',
    name: 'Workspace Admin',
    description:
      'Provides permissions to control workspace-specific resources within a workspace',
    users: null,
    workspaces: null,
    type: 'default',
  },
  {
    id: 'operator',
    name: 'Operator',
    description: 'Provides permissions to operate workflows',
    users: null,
    workspaces: null,
    type: 'default',
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Provides read-only access to workspace resources',
    users: null,
    workspaces: null,
    type: 'default',
  },
  {
    id: 'runner',
    name: 'Runner',
    description: 'Provides permissions to run workflows',
    users: null,
    workspaces: null,
    type: 'default',
  },
  {
    id: 'soc-analyst',
    name: 'SOC Analyst',
    description: 'example for specific workspaces',
    users: 16,
    workspaces: 4,
    type: 'custom',
  },
];

function RoleTypeBadge({ type }: { type: OrgRoleRow['type'] }) {
  if (type === 'custom') {
    return (
      <span className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--color-teal-500)]/15 px-2 py-0.5 text-[length:var(--font-size-body2)] font-medium text-[var(--color-teal-500)]">
        <Pencil className="h-3 w-3" strokeWidth={2} aria-hidden />
        Custom
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--bg-static-2)] px-2 py-0.5 text-[length:var(--font-size-body2)] font-medium text-[var(--text-secondary)]">
      <Lock className="h-3 w-3" strokeWidth={2} aria-hidden />
      Default
    </span>
  );
}

function StaticFilterTrigger({ label, value }: { label: string; value: string }) {
  return (
    <div
      aria-hidden
      className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] px-3 py-2 text-[length:var(--font-size-body2)] text-[var(--color-text-secondary)]"
    >
      <span>
        {label}: <span className="font-semibold text-[var(--color-text-primary)]">{value}</span>
      </span>
      <ChevronDown className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" strokeWidth={2} />
    </div>
  );
}

export function OrgRolesView() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--color-surface-primary)]">
      <OrgAdminPageHeader
        title="Organization roles"
        description="Create, assign, and manage roles for use across the organization."
      />

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              strokeWidth={1.75}
              aria-hidden
            />
            <div
              aria-hidden
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] py-2 pl-9 pr-3 text-[length:var(--font-size-body2)] text-[var(--color-text-tertiary)]"
            >
              Search roles
            </div>
          </div>
          <StaticFilterTrigger label="Filter by workspace" value="All" />
          <StaticFilterTrigger label="Type" value="All types" />
          <div className="pointer-events-none ml-auto select-none">
            <Button theme="primary" size="medium" type="button" tabIndex={-1}>
              Create Role
            </Button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--color-border-2)] bg-[var(--bg-static-2)]">
                {['Role Name', 'Description', 'Users', 'Workspaces', 'Type'].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-[length:var(--font-size-body2)] font-semibold text-[var(--color-text-secondary)]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ORG_ROLES.map((role, index) => (
                <tr
                  key={role.id}
                  className={
                    index < ORG_ROLES.length - 1 ? 'border-b border-[var(--color-border-1)]' : ''
                  }
                >
                  <td className="px-4 py-4 text-[length:var(--font-size-body1)] font-medium text-[var(--color-text-primary)]">
                    {role.name}
                  </td>
                  <td className="max-w-md px-4 py-4 text-[length:var(--font-size-body1)] text-[var(--color-text-secondary)]">
                    {role.description}
                  </td>
                  <td className="px-4 py-4 text-[length:var(--font-size-body1)] text-[var(--color-text-primary)]">
                    {role.users ?? '—'}
                  </td>
                  <td className="px-4 py-4 text-[length:var(--font-size-body1)] text-[var(--color-text-primary)]">
                    {role.workspaces ?? '—'}
                  </td>
                  <td className="px-4 py-4">
                    <RoleTypeBadge type={role.type} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
