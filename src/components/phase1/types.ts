export type Phase1Severity = 'critical' | 'high' | 'low';
export type Phase1Zone = 'pinned' | 'feed';
export type Phase1NotifState = 'unseen' | 'seen' | 'read';
export type Phase1Tab = 'all' | 'unread';

export interface Phase1BrowserTab {
  id: string;
  workspaceId: string;
  isActive: boolean;
  isPending?: boolean;
}
export type Phase1ContentScreen = 'workflows' | 'cases';

export type Phase1NotifTarget =
  | { type: 'case'; caseKey: string }
  | { type: 'workflows' }
  | { type: 'workflow'; workflowName: string }
  | { type: 'integration'; integrationName: string };

export type Phase1CasePriority = 'low' | 'medium' | 'high' | 'critical';

export type Phase1TimelineIcon = 'flag' | 'lock' | 'user' | 'link' | 'workflow' | 'branch';

export interface Phase1TimelineEvent {
  id: string;
  icon: Phase1TimelineIcon;
  title: string;
  who: string;
  time: string;
  dateLabel: string;
}

export interface Phase1CaseSummarySections {
  what: string;
  when: string;
  impact: string;
  keyIndicators: string[];
}

export interface Phase1SecurityContext {
  alertId: string;
  incidentId: string;
  source: string;
  sourceProduct: string;
  detectionName: string;
  startTime: string;
  endTime: string;
  sourceSeverity: string;
}

export interface Phase1CaseTabCounts {
  observables: number;
  notes: number;
  attachments: number;
  linkedCases: number;
  events: number;
}

export interface Phase1CaseDetail {
  caseKey: string;
  /** Shown in header, e.g. #4380 */
  displayId: string;
  torqId: string;
  title: string;
  openedAt: string;
  editedAt: string;
  restricted: boolean;
  priority: Phase1CasePriority;
  slaElapsed: string;
  slaRemaining: string;
  pod: string;
  substateLabel: string;
  capLabel: string;
  teamTag: string;
  statusTag: string;
  tags: string[];
  extraTagCount: number;
  attentionCount: number;
  summary: string;
  summarySections: Phase1CaseSummarySections;
  summaryGeneratedAt: string;
  description: string;
  timeline: Phase1TimelineEvent[];
  tabCounts: Phase1CaseTabCounts;
  securityContext: Phase1SecurityContext;
  assigneeInitials: string;
  assigneeColor: string;
}

/** Built-in row actions (Notification + Action prototype) */
export type Phase1BuiltInActionSet =
  | 'publish-approval'
  | 'share-request'
  | 'export-retry'
  | 'export-download'
  | 'org-activate'
  | 'invite-accept';

export type Phase1AvatarIcon =
  | 'workflow'
  | 'ai'
  | 'mention'
  | 'share'
  | 'export'
  | 'publish'
  | 'connector'
  | 'invite'
  | 'organization';

export interface Phase1PersonAvatar {
  initials: string;
  color: string;
}

export interface Phase1Notification {
  id: string;
  zone: Phase1Zone;
  severity: Phase1Severity;
  title: string;
  body?: string;
  /** Sidebar workspace id (e.g. torq-dev) */
  workspaceId: string;
  /** Label on the workspace pill */
  workspace: string;
  avatarBg: string;
  badgeBg: string;
  /** ISO-8601 instant for display formatting */
  occurredAt: string;
  avatarIcon: Phase1AvatarIcon;
  contentScreen: Phase1ContentScreen;
  target: Phase1NotifTarget;
  /** Person circle on mention / share rows (matches workspace accent when set) */
  personAvatar?: Phase1PersonAvatar;
  /** AI credit row — drives preview % and Usage alignment */
  aiCreditsSnapshot?: { used: number; limit: number };
  /** Inline docs link appended to body copy (e.g. export size limits) */
  bodyLearnMore?: { label: string; url: string };
  /** Always-visible inbox actions in the built-in action prototype */
  builtInActionSet?: Phase1BuiltInActionSet;
}

export interface Phase1NotifRow extends Phase1Notification {
  state: Phase1NotifState;
  /** Formatted for display (relative or "Apr 20" when ≥ 1 week old) */
  timestamp: string;
}

export type Phase1WorkflowState = 'active' | 'inactive' | 'error';
export type Phase1WorkflowTriggerType = 'schedule' | 'webhook' | 'slack' | 'manual';
/** Status column icon in workflows table */
export type Phase1WorkflowStatusIcon = 'globe' | 'globe-linked' | 'progress';

export interface Phase1WorkflowUserRef {
  name: string;
  initials: string;
  avatarColor: string;
  /** Photo URL for prototype realism */
  avatarUrl?: string;
  timestamp: string;
}

export interface Phase1Workflow {
  id: string;
  name: string;
  state: Phase1WorkflowState;
  statusBar: 'success' | 'warning' | 'error';
  /** Overrides default mapping from statusBar + state */
  statusIcon?: Phase1WorkflowStatusIcon;
  triggerType: Phase1WorkflowTriggerType;
  tags: string[];
  triggeredBy: {
    label: string;
    timestamp?: string;
    initials?: string;
    avatarColor?: string;
    avatarUrl?: string;
  };
  lastModifiedBy: Phase1WorkflowUserRef;
  shared: boolean;
  executions7d: number;
}

export interface Phase1WorkflowGroup {
  id: string;
  name: string;
  workflows: Phase1Workflow[];
  expanded?: boolean;
  /** Header badge when rows are not expanded in prototype */
  itemCount?: number;
}
