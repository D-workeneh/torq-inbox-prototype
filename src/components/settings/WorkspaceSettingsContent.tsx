'use client';

import { useState } from 'react';
import {
  Box,
  Briefcase,
  ChevronRight,
  GitBranch,
  Shield,
  Sparkles,
  User,
  UserPen,
  Workflow,
} from 'lucide-react';
import { AiCreditUsageContent } from './AiCreditUsageContent';
import {
  SettingsCard,
  SettingsCardBody,
  SettingsEyebrow,
} from './SettingsPrimitives';
import {
  getWorkspaceUsage,
  type WorkspaceMetric,
  type WorkspaceOwner,
  type WorkspaceUsageSnapshot,
} from './workspaceSettingsData';

const METRIC_ICONS: Record<string, React.ElementType> = {
  workflows: Workflow,
  nested: GitBranch,
  cases: Briefcase,
  editors: UserPen,
  operators: Shield,
  runners: Box,
  ai: Sparkles,
};

const METRIC_GROUPS: { title: string; ids: string[] }[] = [
  { title: 'Automation', ids: ['workflows', 'nested', 'cases', 'runners'] },
  { title: 'People', ids: ['editors', 'operators'] },
];

function MetricStat({
  metric,
  onAiCredits,
}: {
  metric: WorkspaceMetric;
  onAiCredits?: () => void;
}) {
  const Icon = METRIC_ICONS[metric.id] ?? Workflow;
  const isClickable = metric.action === 'ai-credits' && onAiCredits;
  const progressPct = metric.progress
    ? Math.min(100, Math.round((metric.progress.used / metric.progress.limit) * 100))
    : null;
  const progressAtLimit = progressPct !== null && progressPct >= 100;

  const body = (
    <>
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-static-2)]">
          <Icon className="h-4 w-4 text-[var(--text-tertiary)]" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[length:var(--font-size-body2)] text-[var(--text-secondary)]">
            {metric.label}
          </p>
          <p className="mt-0.5 text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)]">
            {metric.value}
          </p>
          {metric.hint && (
            <p className="mt-1 text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">
              {metric.hint}
            </p>
          )}
        </div>
        {isClickable && (
          <ChevronRight
            className="mt-1 h-4 w-4 shrink-0 text-[var(--text-tertiary)]"
            strokeWidth={2}
            aria-hidden
          />
        )}
      </div>
      {progressPct !== null && (
        <div className="mt-3 pl-11">
          <div
            className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-static-3)]"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`h-full rounded-full transition-[width] ${
                progressAtLimit ? 'bg-[#DC2626]' : 'bg-[var(--neutral-12)]'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
    </>
  );

  if (isClickable) {
    return (
      <button
        type="button"
        onClick={onAiCredits}
        className="w-full rounded-[var(--radius-lg)] border border-[var(--border-level-2)] bg-[var(--surface)] p-4 text-left transition-colors hover:border-[var(--border-level-3)] hover:bg-[var(--bg-hover-level-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
      >
        {body}
      </button>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-level-2)] bg-[var(--surface)] p-4">
      {body}
    </div>
  );
}

function OwnersList({ owners }: { owners: WorkspaceOwner[] }) {
  return (
    <ul className="divide-y divide-[var(--border-level-1)]">
      {owners.map((o) => (
        <li key={o.email} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          {o.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={o.avatarUrl}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg-static-3)] text-[length:var(--font-size-body2)] font-medium text-[var(--text-secondary)]"
              aria-hidden
            >
              {o.initials}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-[length:var(--font-size-body1)] font-medium text-[var(--text-primary)]">
              {o.name}
            </p>
            <p className="truncate text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">
              {o.email}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function CurrentWorkspaceUsage({
  workspace,
  onOpenAiCredits,
}: {
  workspace: WorkspaceUsageSnapshot;
  onOpenAiCredits: (workspaceName: string) => void;
}) {
  const metricsById = Object.fromEntries(workspace.metrics.map((m) => [m.id, m]));
  const aiMetric = metricsById.ai;

  return (
    <div className="space-y-6 w-full">
      <SettingsCard>
        <div className="flex items-center gap-3 border-b border-[var(--border-level-1)] px-4 py-4">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ background: workspace.color }}
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)]">
              {workspace.name}
            </p>
            <p className="text-[length:var(--font-size-body2)] text-[var(--text-secondary)]">
              {workspace.plan} plan
            </p>
          </div>
        </div>

        <SettingsCardBody divided={false}>
          {METRIC_GROUPS.map((group) => (
            <div key={group.title} className="px-4 pb-5 pt-4 first:pt-4">
              <SettingsEyebrow>{group.title}</SettingsEyebrow>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {group.ids.map((id) => {
                  const metric = metricsById[id];
                  if (!metric) return null;
                  return <MetricStat key={metric.id} metric={metric} />;
                })}
              </div>
            </div>
          ))}

          {aiMetric && (
            <div className="border-t border-[var(--border-level-1)] px-4 py-5">
              <SettingsEyebrow>AI</SettingsEyebrow>
              <div className="mt-3">
                <MetricStat
                  metric={aiMetric}
                  onAiCredits={() => onOpenAiCredits(workspace.name)}
                />
              </div>
            </div>
          )}
        </SettingsCardBody>
      </SettingsCard>

      {workspace.owners.length > 0 && (
        <SettingsCard>
          <SettingsCardBody divided={false}>
            <div className="px-4 py-4">
              <div className="mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-[var(--text-tertiary)]" strokeWidth={1.75} aria-hidden />
                <p className="text-[length:var(--font-size-body2)] font-semibold text-[var(--text-primary)]">
                  Owners
                </p>
                <span className="text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">
                  {workspace.owners.length}
                </span>
              </div>
              <OwnersList owners={workspace.owners} />
            </div>
          </SettingsCardBody>
        </SettingsCard>
      )}
    </div>
  );
}

export function WorkspaceSettingsContent({
  workspaceId = 'torq-dev',
  workspaceDisplayName,
  initialView = 'list',
  initialWorkspaceName,
  onOpenAiCredits,
}: {
  /** Active workspace from the app shell (e.g. torq-dev) */
  workspaceId?: string;
  workspaceDisplayName?: string;
  initialView?: 'list' | 'ai-credits';
  initialWorkspaceName?: string;
  onOpenAiCredits?: (workspaceName: string) => void;
}) {
  const workspace = getWorkspaceUsage(workspaceId, workspaceDisplayName);
  const [view, setView] = useState<'list' | 'ai-credits'>(initialView);
  const [aiWorkspace, setAiWorkspace] = useState(
    initialWorkspaceName ?? workspace.name,
  );

  function openAiCredits(name: string) {
    setAiWorkspace(name);
    setView('ai-credits');
    onOpenAiCredits?.(name);
  }

  if (view === 'ai-credits') {
    return (
      <AiCreditUsageContent
        workspaceId={workspace.id}
        workspaceName={aiWorkspace}
        onBack={() => setView('list')}
      />
    );
  }

  return (
    <CurrentWorkspaceUsage workspace={workspace} onOpenAiCredits={openAiCredits} />
  );
}
