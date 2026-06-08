'use client';

import type { ReactNode } from 'react';
import {
  AppWindow,
  Bot,
  Braces,
  Brackets,
  CircleDashed,
  Copy,
  Flag,
  GitBranch,
  GitFork,
  Hourglass,
  Layers,
  LayoutGrid,
  List,
  MousePointerClick,
  Repeat,
  Shield,
  Sparkles,
  SquarePen,
  Workflow,
  Wrench,
} from 'lucide-react';
import type { WorkflowDesignerCategory } from './workflowDesignerData';

export const WF_LINE_ICON = '#090A0B';
const S = 20;
const SW = 1.5;

function LineIcon({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: WF_LINE_ICON,
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

const lucideProps = {
  size: S,
  strokeWidth: SW,
  color: WF_LINE_ICON,
  absoluteStrokeWidth: true,
} as const;

export function WorkflowOperatorIcon({ id }: { id: string }) {
  switch (id) {
    case 'if':
      return (
        <LineIcon>
          <GitBranch {...lucideProps} />
        </LineIcon>
      );
    case 'switch':
      return (
        <LineIcon>
          <GitFork {...lucideProps} />
        </LineIcon>
      );
    case 'ai-agent':
      return (
        <LineIcon>
          <Bot {...lucideProps} />
        </LineIcon>
      );
    case 'ai-task':
      return (
        <LineIcon>
          <Sparkles {...lucideProps} />
        </LineIcon>
      );
    case 'loop':
      return (
        <LineIcon>
          <Repeat {...lucideProps} />
        </LineIcon>
      );
    case 'break':
      return (
        <LineIcon>
          <svg width={S} height={S} viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M5 14l10-10M14 14V6H6"
              stroke={WF_LINE_ICON}
              strokeWidth={SW}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </LineIcon>
      );
    case 'collect':
      return (
        <LineIcon>
          <List {...lucideProps} />
        </LineIcon>
      );
    case 'exit':
      return (
        <LineIcon>
          <Flag {...lucideProps} />
        </LineIcon>
      );
    case 'wait':
      return (
        <LineIcon>
          <Hourglass {...lucideProps} />
        </LineIcon>
      );
    case 'workflow':
      return (
        <LineIcon>
          <Workflow {...lucideProps} />
        </LineIcon>
      );
    case 'dedup':
      return (
        <LineIcon>
          <Copy {...lucideProps} />
        </LineIcon>
      );
    case 'interact':
      return (
        <LineIcon>
          <MousePointerClick {...lucideProps} />
        </LineIcon>
      );
    case 'loading':
      return (
        <LineIcon>
          <CircleDashed {...lucideProps} />
        </LineIcon>
      );
    case 'transform':
      return (
        <LineIcon>
          <Braces {...lucideProps} />
        </LineIcon>
      );
    default:
      return (
        <LineIcon>
          <AppWindow {...lucideProps} />
        </LineIcon>
      );
  }
}

export function WorkflowCategoryIcon({ id }: { id: WorkflowDesignerCategory }) {
  switch (id) {
    case 'operators':
      return (
        <LineIcon>
          <LayoutGrid {...lucideProps} size={18} />
        </LineIcon>
      );
    case 'ai-agents':
      return (
        <LineIcon>
          <Bot {...lucideProps} size={18} />
        </LineIcon>
      );
    case 'integrations':
      return (
        <LineIcon>
          <Brackets {...lucideProps} size={18} />
        </LineIcon>
      );
    case 'cases':
      return (
        <LineIcon>
          <Shield {...lucideProps} size={18} />
        </LineIcon>
      );
    case 'utilities':
      return (
        <LineIcon>
          <Wrench {...lucideProps} size={18} />
        </LineIcon>
      );
    case 'custom':
      return (
        <LineIcon>
          <SquarePen {...lucideProps} size={18} />
        </LineIcon>
      );
    case 'hypersteps':
      return (
        <LineIcon>
          <Layers {...lucideProps} size={18} />
        </LineIcon>
      );
    default:
      return null;
  }
}
