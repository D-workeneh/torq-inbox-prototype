import type { ElementType } from 'react';
import {
  Bot,
  Database,
  Lightbulb,
  MousePointerClick,
  Shield,
  Table2,
  Target,
  TrendingUp,
  Workflow,
} from 'lucide-react';

export type NavItem = { label: string; pageId: string };
export type NavSection = {
  title: string;
  icon: ElementType;
  items: NavItem[];
  defaultOpen?: boolean;
};
export type Workspace = {
  id: string;
  /** Inbox pills, picker, tooltips */
  name: string;
  color: string;
  image?: string;
  /** Sidebar avatar letter when `name` would collide (e.g. both start with T) */
  avatarLetter?: string;
};

export const ACME_AVATAR_SRC = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%25' stop-color='%23FF8E2E'/><stop offset='100%25' stop-color='%23FDD711'/></linearGradient></defs><rect width='40' height='40' rx='6' fill='url(%23g)'/><text x='50%25' y='56%25' font-family='system-ui,sans-serif' font-size='15' font-weight='800' fill='white' text-anchor='middle' dominant-baseline='central'>AC</text></svg>`)}`;

export const APP_WORKSPACES: Workspace[] = [
  { id: 'torq-dev', name: 'torq-dev', color: '#2864FF' },
  {
    id: 'torq-staging',
    name: 'Genesis-Dev-58',
    color: '#9275FF',
    avatarLetter: 'G',
  },
  {
    id: 'torq-prod',
    name: 'Pinnacle-Prod',
    color: '#EA231A',
    avatarLetter: 'P',
  },
  { id: 'acme-corp', name: 'acme-corp', color: '#FF8E2E', image: ACME_AVATAR_SRC },
  { id: 'content-team', name: 'content-team', color: '#0D652D', avatarLetter: 'C' },
  { id: 'd-work', name: 'D_work', color: '#12B5CB', avatarLetter: 'D' },
  {
    id: 'session-permissions',
    name: 'torqing-session-permissions',
    color: '#E37400',
    avatarLetter: 'T',
  },
  { id: 'uri-playground', name: 'uri-playground', color: '#8FBF1A', avatarLetter: 'U' },
  { id: 'falcon-soc', name: 'Falcon-SOC', color: '#D93025', avatarLetter: 'F' },
  { id: 'nebula-ops', name: 'nebula-ops', color: '#1A73E8', avatarLetter: 'N' },
];

export const APP_NAV_SECTIONS: NavSection[] = [
  {
    title: 'Build',
    icon: Workflow,
    defaultOpen: true,
    items: [
      { label: 'Workflows', pageId: 'workflows' },
      { label: 'Integrations', pageId: 'integrations' },
      { label: 'Workspace Variables', pageId: 'workspace-variables' },
      { label: 'Templates', pageId: 'templates' },
    ],
  },
  {
    title: 'Investigate',
    icon: Shield,
    defaultOpen: false,
    items: [
      { label: 'Cases', pageId: 'cases' },
      { label: 'Runbooks', pageId: 'runbooks' },
      { label: 'Observables', pageId: 'observables' },
      { label: 'Sources', pageId: 'sources' },
    ],
  },
  {
    title: 'Monitor',
    icon: TrendingUp,
    defaultOpen: false,
    items: [
      { label: 'Activity Log', pageId: 'activity-log' },
      { label: 'Insights', pageId: 'insights' },
      { label: 'Case Dashboards', pageId: 'case-dashboards' },
    ],
  },
  {
    title: 'Interact',
    icon: MousePointerClick,
    defaultOpen: false,
    items: [
      { label: 'Interact data picker', pageId: 'interact-picker' },
      { label: 'Table for interact', pageId: 'interact-table' },
      { label: 'Snappy bot', pageId: 'snappy-bot' },
      { label: 'Insights', pageId: 'interact-insights' },
      { label: 'Indicator Investigation', pageId: 'indicator-investigation' },
      { label: 'Bring me the data', pageId: 'bring-data' },
    ],
  },
];

/** Lucide icons for ContentRouter coming-soon pages */
export const COMING_SOON_ICONS = {
  'interact-picker': Table2,
  'interact-table': Table2,
  'snappy-bot': Bot,
  'interact-insights': Lightbulb,
  'indicator-investigation': Target,
  'bring-data': Database,
} as const;

export const SIDEBAR_WIDTH_EXPANDED = 220;
export const SIDEBAR_WIDTH_COLLAPSED = 52;
