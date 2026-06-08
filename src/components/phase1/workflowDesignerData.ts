export type WorkflowDesignerCategory =
  | 'operators'
  | 'ai-agents'
  | 'integrations'
  | 'cases'
  | 'utilities'
  | 'custom'
  | 'hypersteps';

export const WORKFLOW_DESIGNER_CATEGORIES: {
  id: WorkflowDesignerCategory;
  label: string;
}[] = [
  { id: 'operators', label: 'Operators' },
  { id: 'ai-agents', label: 'AI Agents' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'cases', label: 'Cases' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'custom', label: 'Custom' },
  { id: 'hypersteps', label: 'Hypersteps' },
];

/** Pastel tile backgrounds — workflow designer step library */
export const WORKFLOW_OPERATOR_TILES = [
  { id: 'if', label: 'If', bg: '#D8F3DC' },
  { id: 'switch', label: 'Switch', bg: '#D0F5EE' },
  { id: 'ai-agent', label: 'AI Agent', bg: '#E8E0F5' },
  { id: 'ai-task', label: 'AI Task', bg: '#EDE5F8' },
  { id: 'loop', label: 'Loop', bg: '#DCE8FF' },
  { id: 'break', label: 'Break', bg: '#E8EDF3' },
  { id: 'collect', label: 'Collect', bg: '#D6EEF8' },
  { id: 'exit', label: 'Exit', bg: '#FCE4E8' },
  { id: 'wait', label: 'Wait', bg: '#FFE8D6' },
  { id: 'workflow', label: 'Workflow', bg: '#FFF4D6' },
  { id: 'dedup', label: 'Dedup', bg: '#FFE8D9' },
  { id: 'interact', label: 'Interact', bg: '#D5F5F0' },
  { id: 'loading', label: 'Loading screen', bg: '#DCE8FF' },
  { id: 'transform', label: 'Transform', bg: '#FCE7F3' },
] as const;

export interface WorkflowCanvasStep {
  id: string;
  kind: 'trigger' | 'step';
  category: string;
  title: string;
  iconBg: string;
  iconLabel: string;
  /** Last run failed — red × on step corner */
  failed?: boolean;
  warn?: boolean;
}

/** Demo workflow opened when navigating from a notification target */
export const DEFAULT_SESSION_WORKFLOW_NAME =
  'Notification Center Test — Intentional failure demo';

/** Default selected step when opening designer (failed HTTP step) */
export const DEFAULT_SELECTED_STEP_ID = 's2';

export const DEFAULT_WORKFLOW_CANVAS_STEPS: WorkflowCanvasStep[] = [
  {
    id: 'trigger',
    kind: 'trigger',
    category: 'Trigger',
    title: 'On-demand',
    iconBg: '#090A0B',
    iconLabel: '⚡',
  },
  {
    id: 's1',
    kind: 'step',
    category: 'HTTP',
    title: 'Send an HTTP request',
    iconBg: '#E8EDF3',
    iconLabel: '⌁',
  },
  {
    id: 's2',
    kind: 'step',
    category: 'HTTP',
    title: 'Send an HTTP request 1',
    iconBg: '#E8EDF3',
    iconLabel: '⌁',
    failed: true,
  },
  {
    id: 's3',
    kind: 'step',
    category: 'HTTP',
    title: 'Send an HTTP request 2',
    iconBg: '#E8EDF3',
    iconLabel: '⌁',
  },
];
