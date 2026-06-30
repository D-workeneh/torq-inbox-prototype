/** Integration catalog + detail copy for the Integrations prototype screens */

export type Phase1IntegrationCategory = 'trigger' | 'step';

export interface Phase1IntegrationCatalogItem {
  id: string;
  name: string;
  category: Phase1IntegrationCategory;
  /** Tile background */
  color: string;
  /** Short label on tile */
  shortLabel?: string;
}

export interface Phase1IntegrationInstance {
  name: string;
  workspace: string;
  isDefault?: boolean;
  sharedStatus?: 'Received' | 'Sent';
  hasEvents?: boolean;
}

export interface Phase1IntegrationDetail {
  name: string;
  title: string;
  description: string;
  instances: Phase1IntegrationInstance[];
}

export const PHASE1_INTEGRATION_CATALOG: Phase1IntegrationCatalogItem[] = [
  { id: 'slack', name: 'Slack', category: 'trigger', color: '#4A154B' },
  { id: 'jira', name: 'Jira Cloud', category: 'trigger', color: '#0052CC' },
  { id: 'crowdstrike', name: 'CrowdStrike', category: 'trigger', color: '#E01E5A' },
  { id: 'github', name: 'GitHub', category: 'trigger', color: '#24292F' },
  { id: 'gmail', name: 'Gmail', category: 'trigger', color: '#EA4335' },
  { id: 'datadog', name: 'Datadog', category: 'trigger', color: '#632CA6' },
  { id: 'okta', name: 'Okta', category: 'trigger', color: '#007DC1' },
  { id: 'aws', name: 'AWS', category: 'trigger', color: '#FF9900' },
  { id: 'azure', name: 'Azure DevOps', category: 'trigger', color: '#0078D4' },
  { id: 'sentinelone', name: 'SentinelOne', category: 'trigger', color: '#6B21A8' },
  { id: 'cloudflare', name: 'Cloudflare', category: 'trigger', color: '#F38020' },
  { id: 'pagerduty', name: 'PagerDuty', category: 'trigger', color: '#06AC38' },
];

const INTEGRATION_DETAILS: Record<string, Omit<Phase1IntegrationDetail, 'name' | 'title'>> = {
  Slack: {
    description:
      'This integration connects Slack and Torq to establish a bi-directional relationship and adds a bot to your Slack Workspace that allows you to communicate with Torq directly, either receiving data from workflow steps or interacting with the Torq platform.',
    instances: [
      { name: 'igorslack', workspace: 'EagerK', isDefault: true, sharedStatus: 'Received', hasEvents: true },
    ],
  },
  'Jira Cloud': {
    description:
      'Connect Jira Cloud with Torq to ingest issues, sync status changes, and trigger workflows from project activity across your workspaces.',
    instances: [
      { name: 'jira-prod', workspace: 'Genesis-Dev-58', isDefault: true, sharedStatus: 'Received', hasEvents: true },
    ],
  },
  CrowdStrike: {
    description:
      'Integrate CrowdStrike Falcon detections with Torq to automate triage, enrichment, and response workflows using shared connector credentials.',
    instances: [
      { name: 'cs-torq-dev', workspace: 'torq-dev', isDefault: true, sharedStatus: 'Received', hasEvents: true },
    ],
  },
};

const DEFAULT_DETAIL_DESCRIPTION =
  'Connect this integration with Torq to receive events, automate workflows, and collaborate across workspaces.';

export function parseSharedIntegrationName(title: string): string | null {
  const match = title.match(/^(.+?)\s+integration was shared with\s+/i);
  if (!match) return null;
  return match[1].replace(/\s+connector$/i, '').trim();
}

export function isSharedIntegrationNotif(title: string): boolean {
  return title.includes('integration was shared with');
}

export function getPhase1IntegrationDetail(integrationName: string): Phase1IntegrationDetail {
  const preset = INTEGRATION_DETAILS[integrationName];
  return {
    name: integrationName,
    title: `${integrationName} Integrations`,
    description: preset?.description ?? DEFAULT_DETAIL_DESCRIPTION,
    instances: preset?.instances ?? [
      {
        name: integrationName.toLowerCase().replace(/\s+/g, '-'),
        workspace: 'torq-dev',
        isDefault: true,
        sharedStatus: 'Received',
        hasEvents: true,
      },
    ],
  };
}

export function findIntegrationCatalogItem(name: string): Phase1IntegrationCatalogItem | undefined {
  const normalized = name.toLowerCase();
  return PHASE1_INTEGRATION_CATALOG.find(
    (item) =>
      item.name.toLowerCase() === normalized ||
      item.id === normalized.replace(/\s+/g, '-'),
  );
}
