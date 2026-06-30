import type { ElementType } from 'react';
import { SlidersHorizontal, TrendingUp } from 'lucide-react';

export type OrgAdminPageId =
  | 'workspaces'
  | 'notifications'
  | 'cases-dashboards'
  | 'roles';

export type OrgAdminNavItem = { label: string; pageId: OrgAdminPageId };
export type OrgAdminNavSection = {
  title: string;
  icon: ElementType;
  items: OrgAdminNavItem[];
  defaultOpen?: boolean;
};

export const ORG_SIDEBAR_WIDTH_EXPANDED = 220;
export const ORG_SIDEBAR_WIDTH_COLLAPSED = 52;

export const ORG_MANAGEMENT_WORKSPACE = {
  id: 'torq-management',
  name: 'torq-management',
};

export type OrgPickerWorkspace = {
  id: string;
  name: string;
  color: string;
  avatarLetter?: string;
  image?: string;
};

/** Workspaces shown on the org Workspaces admin page */
export const ORG_WORKSPACES: OrgPickerWorkspace[] = [
  { id: 'a-roma', name: 'A-roma', color: '#16A34A', avatarLetter: 'A' },
  { id: 'a-test', name: 'A-test', color: '#DC2626', avatarLetter: 'A' },
  { id: 'e2e', name: 'E2E', color: '#E91E8C', avatarLetter: 'E' },
  { id: 'torq-dev', name: 'torq-dev', color: '#2864FF', avatarLetter: 'T' },
  { id: 'genesis', name: 'Genesis-Dev-58', color: '#9275FF', avatarLetter: 'G' },
];

/** Workspaces shown in the org-admin workspace switcher */
export const ORG_PICKER_WORKSPACES: OrgPickerWorkspace[] = [
  { id: 'content-team-stg', name: 'ContentTeamStg', color: '#2864FF', avatarLetter: 'C' },
  { id: 'hypersoc-bears-stg', name: 'hypersoc-bears-stg', color: '#0D652D', avatarLetter: 'H' },
  { id: 'sso-workspace-0', name: 'sso-workspace-0', color: '#D97706', avatarLetter: 'S' },
  { id: 'torq', name: 'torq', color: '#9275FF', avatarLetter: 'T' },
];

export const ORG_ADMIN_NAV_SECTIONS: OrgAdminNavSection[] = [
  {
    title: 'Monitor',
    icon: TrendingUp,
    defaultOpen: true,
    items: [{ label: 'Workspaces', pageId: 'workspaces' }],
  },
  {
    title: 'Manage',
    icon: SlidersHorizontal,
    defaultOpen: true,
    items: [
      { label: 'Notifications', pageId: 'notifications' },
      { label: 'Cases Dashboards', pageId: 'cases-dashboards' },
      { label: 'Roles', pageId: 'roles' },
    ],
  },
];
