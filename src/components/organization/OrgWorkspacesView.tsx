'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ORG_WORKSPACES } from '@/lib/organizationAdminConfig';

function WorkspaceRowAvatar({ color, letter }: { color: string; letter: string }) {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {letter}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[var(--border-level-2)] bg-[var(--surface)] px-4 py-3">
      <p className="text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">{label}</p>
      <p className="mt-1 text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  );
}

const WORKSPACE_STATS: Record<string, { workflows: number; nested: number; editors: number; operators: number; runners: number; ai: string }> = {
  'a-roma': { workflows: 0, nested: 1, editors: 0, operators: 0, runners: 0, ai: '0 of 5000' },
  'a-test': { workflows: 2, nested: 0, editors: 1, operators: 0, runners: 1, ai: '120 of 5000' },
  'e2e': { workflows: 5, nested: 2, editors: 3, operators: 1, runners: 2, ai: '890 of 5000' },
  'torq-dev': { workflows: 12, nested: 4, editors: 5, operators: 2, runners: 3, ai: '2100 of 5000' },
  'genesis': { workflows: 8, nested: 1, editors: 2, operators: 1, runners: 1, ai: '450 of 5000' },
};

const WORKSPACE_OWNERS: Record<string, { name: string; email: string }[]> = {
  'a-roma': [
    { name: 'Roman Kunicher', email: 'roman.kunicher@torq.io' },
    { name: 'nadav.kanon@torq.io', email: 'nadav.kanon@torq.io' },
  ],
  'torq-dev': [{ name: 'David Workeneh', email: 'david.workeneh@torq.io' }],
};

export function OrgWorkspacesView() {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('a-roma');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ORG_WORKSPACES;
    return ORG_WORKSPACES.filter((ws) => ws.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--color-surface-primary)]">
      <div className="border-b border-[var(--color-border-2)] px-8 py-5">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workspace"
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] py-2 pl-9 pr-3 text-[var(--font-size-sm)] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary-400)]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-4">
        <div className="space-y-2">
          {filtered.map((ws) => {
            const open = expandedId === ws.id;
            const stats = WORKSPACE_STATS[ws.id] ?? WORKSPACE_STATS['a-roma'];
            const owners = WORKSPACE_OWNERS[ws.id] ?? [];

            return (
              <div
                key={ws.id}
                className="overflow-hidden rounded-xl border border-[var(--color-border-2)] bg-[var(--color-surface-primary)]"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(open ? null : ws.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-surface-tertiary)]"
                >
                  <WorkspaceRowAvatar
                    color={ws.color}
                    letter={(ws.avatarLetter ?? ws.name[0]).toUpperCase()}
                  />
                  <span className="flex-1 text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">
                    {ws.name}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[var(--color-text-tertiary)] transition-transform ${open ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-[var(--color-border-2)] px-4 py-5">
                        <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
                          <StatCard label="Workspace plan" value="N/A" />
                          <StatCard label="Workflows" value={stats.workflows} />
                          <StatCard label="Nested workflows" value={stats.nested} />
                          <StatCard label="Workflow editors" value={stats.editors} />
                          <StatCard label="Case operators" value={stats.operators} />
                          <StatCard label="Runners" value={stats.runners} />
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-3 lg:grid-cols-6">
                          <StatCard label="AI Management" value={stats.ai} />
                        </div>

                        {owners.length > 0 && (
                          <div className="mt-4 max-w-sm rounded-xl border border-[var(--color-border-2)] bg-[var(--color-surface-secondary)] p-4">
                            <p className="mb-3 text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)]">
                              Owners {owners.length}
                            </p>
                            <div className="space-y-3">
                              {owners.map((owner) => (
                                <div key={owner.email}>
                                  <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">
                                    {owner.name}
                                  </p>
                                  <p className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">
                                    {owner.email}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
