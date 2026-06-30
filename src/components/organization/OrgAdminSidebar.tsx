'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookMarked,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Crown,
  Inbox as InboxIcon,
  Search,
  Settings as SettingsIcon,
} from 'lucide-react';
import {
  ORG_ADMIN_NAV_SECTIONS,
  ORG_MANAGEMENT_WORKSPACE,
  ORG_PICKER_WORKSPACES,
  ORG_SIDEBAR_WIDTH_COLLAPSED,
  ORG_SIDEBAR_WIDTH_EXPANDED,
  type OrgAdminPageId,
  type OrgPickerWorkspace,
} from '@/lib/organizationAdminConfig';

function OrgSidebarTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="group/stip relative flex w-full items-center justify-center">
      {children}
      <div className="pointer-events-none absolute left-full z-[9999] ml-2.5 whitespace-nowrap opacity-0 transition-opacity duration-100 group-hover/stip:opacity-100">
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-neutral-800)] px-2 py-1 text-[var(--font-size-xs)] text-white shadow-lg">
          {label}
        </div>
      </div>
    </div>
  );
}

function OrgBrandAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sz =
    size === 'sm'
      ? 'h-5 w-5 text-[7px]'
      : size === 'lg'
        ? 'h-8 w-8 text-[9px]'
        : 'h-6 w-6 text-[8px]';

  return (
    <div
      className={`${sz} flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-primary-500)]`}
    >
      <span className="flex h-[72%] w-[72%] items-center justify-center rounded-full bg-white font-bold text-[var(--color-primary-500)]">
        .org
      </span>
    </div>
  );
}

function OrgPickerWorkspaceAvatar({ ws, size = 'sm' }: { ws: OrgPickerWorkspace; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'h-5 w-5 text-[9px]' : 'h-6 w-6 text-[10px]';

  if (ws.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={ws.image} alt={ws.name} className={`${sz} shrink-0 rounded-full object-cover`} />
    );
  }

  return (
    <div
      className={`${sz} flex shrink-0 items-center justify-center rounded-full font-bold text-white`}
      style={{ backgroundColor: ws.color }}
    >
      {(ws.avatarLetter ?? ws.name[0]).toUpperCase()}
    </div>
  );
}

function OrgWorkspacePicker({
  onSelectWorkspace,
  onClose,
  anchorRef,
}: {
  onSelectWorkspace: (workspaceId: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [query, setQuery] = useState('');

  useLayoutEffect(() => {
    if (anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left });
    }
  }, [anchorRef]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current?.contains(e.target as Node) || anchorRef.current?.contains(e.target as Node)) {
        return;
      }
      onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, anchorRef]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ORG_PICKER_WORKSPACES;
    return ORG_PICKER_WORKSPACES.filter((ws) => ws.name.toLowerCase().includes(q));
  }, [query]);

  if (!pos) return null;

  return createPortal(
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.14 }}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
      className="w-60 rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] py-1 shadow-xl"
    >
      <div className="px-2 pb-1 pt-1.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-surface-primary)] py-1.5 pl-8 pr-2.5 text-[var(--font-size-sm)] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary-500)]"
          />
        </div>
      </div>

      <div className="max-h-[200px] overflow-y-auto py-0.5">
        {filtered.length === 0 ? (
          <p className="px-3 py-3 text-center text-[var(--font-size-sm)] text-[var(--color-text-tertiary)]">
            No workspaces found
          </p>
        ) : (
          filtered.map((ws) => (
            <button
              key={ws.id}
              type="button"
              onClick={() => {
                onSelectWorkspace(ws.id);
                onClose();
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]"
            >
              <OrgPickerWorkspaceAvatar ws={ws} />
              <span className="flex-1 truncate text-left">{ws.name}</span>
            </button>
          ))
        )}
      </div>

      <div className="mx-3 my-1.5 h-px bg-[var(--color-border-2)]" role="separator" />

      <button
        type="button"
        onClick={onClose}
        className="mx-1.5 flex w-[calc(100%-12px)] items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-tertiary)]"
      >
        <Crown className="h-4 w-4 shrink-0 text-[var(--color-text-primary)]" strokeWidth={1.75} />
        <span>Organization Management</span>
      </button>
    </motion.div>,
    document.body,
  );
}

function OrgSidebarSection({
  section,
  collapsed,
  currentPage,
  onNavigate,
  openSection,
  onCollapsedIconClick,
}: {
  section: (typeof ORG_ADMIN_NAV_SECTIONS)[number];
  collapsed: boolean;
  currentPage: OrgAdminPageId;
  onNavigate: (pageId: OrgAdminPageId) => void;
  openSection?: boolean;
  onCollapsedIconClick?: (section: (typeof ORG_ADMIN_NAV_SECTIONS)[number]) => void;
}) {
  const [open, setOpen] = useState(section.defaultOpen ?? true);
  const SectionIcon = section.icon;
  const hasActive = section.items.some((i) => i.pageId === currentPage);

  useEffect(() => {
    if (openSection) setOpen(true);
  }, [openSection]);

  if (collapsed) {
    return (
      <OrgSidebarTooltip label={section.title}>
        <button
          type="button"
          aria-label={`Open ${section.title}`}
          onClick={(e) => {
            e.stopPropagation();
            onCollapsedIconClick?.(section);
          }}
          className={`flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] transition-colors ${
            hasActive
              ? 'bg-[var(--color-neutral-150)] text-[var(--color-text-primary)]'
              : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <SectionIcon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        </button>
      </OrgSidebarTooltip>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-3 py-2 text-[var(--font-size-sm)] font-bold text-[var(--color-text-primary)]"
      >
        <SectionIcon className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" strokeWidth={1.75} />
        <span className="flex-1 text-left">{section.title}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-[var(--color-text-tertiary)] transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mb-1.5 ml-[2.1rem] flex flex-col gap-0.5 border-l border-[var(--color-border-2)] pl-3">
              {section.items.map((item) => {
                const isActive = item.pageId === currentPage;
                return (
                  <button
                    key={item.pageId}
                    type="button"
                    onClick={() => onNavigate(item.pageId)}
                    className={`block w-full rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-[var(--font-size-sm)] transition-colors ${
                      isActive
                        ? 'bg-[var(--color-neutral-150)] font-medium text-[var(--color-text-primary)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}

export interface OrgAdminSidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  currentPage: OrgAdminPageId;
  onNavigate: (pageId: OrgAdminPageId) => void;
  onBackToWorkspace: () => void;
  onWorkspaceSelect: (workspaceId: string) => void;
}

export function OrgAdminSidebar({
  collapsed,
  onCollapsedChange,
  currentPage,
  onNavigate,
  onBackToWorkspace,
  onWorkspaceSelect,
}: OrgAdminSidebarProps) {
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sectionToOpen, setSectionToOpen] = useState<string | null>(null);
  const workspaceBtnRef = useRef<HTMLButtonElement>(null);

  const sidebarW = collapsed ? ORG_SIDEBAR_WIDTH_COLLAPSED : ORG_SIDEBAR_WIDTH_EXPANDED;

  function expandSidebar() {
    onCollapsedChange(false);
  }

  function expandAndOpenPicker() {
    expandSidebar();
    window.setTimeout(() => setPickerOpen(true), 260);
  }

  useEffect(() => {
    if (!collapsed && sectionToOpen) {
      const t = window.setTimeout(() => setSectionToOpen(null), 300);
      return () => window.clearTimeout(t);
    }
  }, [collapsed, sectionToOpen]);

  return (
    <motion.aside
      animate={{ width: sidebarW }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      style={{ position: 'relative', zIndex: 45 }}
      onMouseEnter={() => setSidebarHovered(true)}
      onMouseLeave={() => setSidebarHovered(false)}
      className="flex h-full shrink-0 flex-col overflow-hidden border-r border-[var(--color-border-2)] bg-[var(--color-surface-secondary)]"
    >
      <div className="relative shrink-0 border-b border-[var(--color-border-1)]">
        <AnimatePresence mode="wait" initial={false}>
          {collapsed ? (
            <motion.div
              key="collapsed-brand"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center gap-2 px-2 py-3"
            >
              <AnimatePresence>
                {sidebarHovered && (
                  <motion.button
                    key="expand-btn"
                    type="button"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 28 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      expandSidebar();
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-neutral-150)] hover:text-[var(--color-text-primary)]"
                    title="Expand sidebar"
                  >
                    <ChevronsRight className="h-4 w-4 shrink-0" />
                  </motion.button>
                )}
              </AnimatePresence>

              <motion.button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  expandAndOpenPicker();
                }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                title="Switch workspace"
                className="outline-none"
              >
                <OrgBrandAvatar size="lg" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="expanded-brand"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex w-full items-center gap-2 px-3 py-3"
            >
              <button
                ref={workspaceBtnRef}
                type="button"
                onClick={() => setPickerOpen((o) => !o)}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-sm)] text-left transition-colors hover:bg-[var(--color-surface-tertiary)]"
              >
                <OrgBrandAvatar />
                <span className="min-w-0 flex-1">
                  <span className="block text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">
                    Workspace
                  </span>
                  <span className="block truncate text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)]">
                    {ORG_MANAGEMENT_WORKSPACE.name}
                  </span>
                </span>
              </button>

              <AnimatePresence>
                {sidebarHovered && (
                  <motion.button
                    key="collapse-btn"
                    type="button"
                    initial={{ opacity: 0, scale: 0.8, width: 0 }}
                    animate={{ opacity: 1, scale: 1, width: 'auto' }}
                    exit={{ opacity: 0, scale: 0.8, width: 0 }}
                    transition={{ duration: 0.12 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCollapsedChange(true);
                    }}
                    className="flex shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] p-1 text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]"
                    title="Collapse sidebar"
                  >
                    <ChevronsLeft className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>

              <button
                type="button"
                onClick={() => setPickerOpen((o) => !o)}
                className="flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] p-1 text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]"
                aria-label="Open workspace menu"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-150 ${pickerOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {pickerOpen && (
                  <OrgWorkspacePicker
                    onSelectWorkspace={onWorkspaceSelect}
                    onClose={() => setPickerOpen(false)}
                    anchorRef={workspaceBtnRef}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className={`flex-1 overflow-y-auto py-2 ${collapsed ? 'flex min-h-0 flex-col items-center gap-1 px-1' : 'space-y-1'}`}
      >
        {ORG_ADMIN_NAV_SECTIONS.map((section) => (
          <OrgSidebarSection
            key={section.title}
            section={section}
            collapsed={collapsed}
            currentPage={currentPage}
            onNavigate={onNavigate}
            openSection={sectionToOpen === section.title}
            onCollapsedIconClick={(s) => {
              setSectionToOpen(s.title);
              onCollapsedChange(false);
            }}
          />
        ))}
      </div>

      <div className="shrink-0 border-t border-[var(--color-border-1)]">
        {collapsed ? (
          <>
            <div className="flex flex-col items-center gap-1 px-1 pt-2">
              <OrgSidebarTooltip label="Inbox">
                <button
                  type="button"
                  onClick={onBackToWorkspace}
                  className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]"
                >
                  <InboxIcon className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </OrgSidebarTooltip>
              <OrgSidebarTooltip label="Knowledge Hub">
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]"
                >
                  <BookMarked className="h-4 w-4" strokeWidth={1.75} />
                </a>
              </OrgSidebarTooltip>
              <OrgSidebarTooltip label="Settings">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]"
                >
                  <SettingsIcon className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </OrgSidebarTooltip>
            </div>
            <button
              type="button"
              className="mt-1 flex w-full justify-center border-t border-[var(--color-border-1)] px-2 py-2.5"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-neutral-800)] text-[var(--font-size-xs)] font-bold text-white">
                D
              </span>
            </button>
          </>
        ) : (
          <>
            <div className="px-2 pt-2">
              <button
                type="button"
                onClick={onBackToWorkspace}
                className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-[var(--font-size-sm)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                <InboxIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                Inbox
              </button>
            </div>
            <div className="px-2">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-[var(--font-size-sm)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                <BookMarked className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                Knowledge Hub
              </a>
            </div>
            <div className="px-2 pb-2">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-neutral-150)] px-2 py-1.5 text-[var(--font-size-sm)] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-tertiary)]"
              >
                <SettingsIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                Settings
              </button>
            </div>

            <button
              type="button"
              className="flex w-full items-center gap-2 border-t border-[var(--color-border-1)] px-3 py-2.5 transition-colors hover:bg-[var(--color-surface-tertiary)]"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-neutral-800)] text-[var(--font-size-xs)] font-bold text-white">
                D
              </span>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">
                  David Workeneh — Or...
                </p>
                <p className="truncate text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">
                  david.workeneh@torq.io
                </p>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-tertiary)]" />
            </button>
          </>
        )}
      </div>
    </motion.aside>
  );
}
