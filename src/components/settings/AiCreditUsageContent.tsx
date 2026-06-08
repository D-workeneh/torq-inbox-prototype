'use client';

import { ChevronLeft, ChevronRight, Info, X as XIcon } from 'lucide-react';
import {
  AI_CREDIT_EXCEEDED_BODY,
  formatCreditsValue,
  getAiCreditsMetricHint,
  getAiUsagePercent,
  getWorkspaceAiCredits,
  resolveWorkspaceIdFromName,
} from '@/lib/workspaceAiCredits';

export function AiCreditUsageContent({
  workspaceName,
  workspaceId: workspaceIdProp,
  onBack,
  onClose,
}: {
  workspaceName: string;
  workspaceId?: string;
  onBack?: () => void;
  onClose?: () => void;
}) {
  const workspaceId = workspaceIdProp ?? resolveWorkspaceIdFromName(workspaceName);
  const credits = getWorkspaceAiCredits(workspaceId);
  const pct = getAiUsagePercent(credits.used, credits.limit);
  const isExceeded = credits.level === 'exceeded' || pct >= 100;

  return (
    <div className="flex min-h-[420px] flex-col">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[length:var(--font-size-h3)] font-semibold text-[var(--text-primary)]">
            AI credit usage
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">
            <span>{credits.workspaceName}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              Last update: Jun 1, 09:59 AM (UTC)
              <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </span>
          </p>
        </div>
        {(onBack || onClose) && (
          <button
            type="button"
            onClick={onBack ?? onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-primary)]"
            aria-label={onBack ? 'Back to workspaces' : 'Close'}
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mb-8 flex items-center justify-center gap-3">
        <button
          type="button"
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover-level-2)]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[120px] text-center text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)]">
          June, 2026
        </span>
        <button
          type="button"
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover-level-2)]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-level-2)] bg-[var(--surface)] p-6">
        <p className="text-[length:var(--font-size-body2)] text-[var(--text-secondary)]">
          Credits this month
        </p>
        <p
          className={`mt-2 text-[length:var(--font-size-h2)] font-semibold tabular-nums ${
            isExceeded ? 'text-[#DC2626]' : 'text-[var(--text-primary)]'
          }`}
        >
          {formatCreditsValue(credits.used, credits.limit)}
        </p>
        <p className="mt-1 text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">
          {getAiCreditsMetricHint(credits)}
        </p>
        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--bg-static-3)]"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full transition-[width] ${
              isExceeded ? 'bg-[#DC2626]' : pct >= 80 ? 'bg-[#F97316]' : 'bg-[var(--neutral-12)]'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-right text-[length:var(--font-size-body2)] font-medium text-[var(--text-secondary)]">
          {pct}% used
        </p>
      </div>

      {isExceeded && (
        <p className="mt-6 text-[length:var(--font-size-body1)] text-[var(--text-secondary)]">
          {AI_CREDIT_EXCEEDED_BODY}
        </p>
      )}
    </div>
  );
}
