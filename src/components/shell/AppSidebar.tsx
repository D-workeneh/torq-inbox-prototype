'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  BookMarked,
  Check,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Inbox as InboxSidebarIcon,
  Search,
  Settings as SettingsIcon,
} from 'lucide-react';
import { UserProfileMenu, type ProfileMenuUser } from '@/components/shell/UserProfileMenu';
import {
  APP_NAV_SECTIONS,
  APP_WORKSPACES,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
  type NavSection,
  type Workspace,
} from '@/lib/appNavConfig';

const SIDEBAR_USER: ProfileMenuUser = {
  name: 'David Workeneh',
  role: 'Owner',
  email: 'david.workeneh@torq.io',
  initials: 'D',
  avatarColor: '#2864FF',
} as const;

function UserAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sz =
    size === 'sm'
      ? 'h-6 w-6 text-[10px]'
      : size === 'lg'
        ? 'h-10 w-10 text-base'
        : 'h-8 w-8 text-sm';

  return (
    <span
      className={`${sz} flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white`}
      style={{ backgroundColor: SIDEBAR_USER.avatarColor }}
    >
      {SIDEBAR_USER.initials}
    </span>
  );
}

function SidebarTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  if (!label) return <>{children}</>;
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

export function WorkspaceAvatar({
  wsId,
  size = 'md',
}: {
  wsId: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const ws = APP_WORKSPACES.find((w) => w.id === wsId) ?? APP_WORKSPACES[0];
  const sz =
    size === 'sm'
      ? 'h-5 w-5 text-[9px]'
      : size === 'lg'
        ? 'h-8 w-8 text-sm'
        : 'h-6 w-6 text-[10px]';

  if (ws.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={ws.image}
        alt={ws.name}
        className={`${sz} shrink-0 rounded-[var(--radius-sm)] object-cover`}
      />
    );
  }
  return (
    <div
      className={`${sz} flex shrink-0 select-none items-center justify-center rounded-[var(--radius-sm)] font-bold text-white`}
      style={{ backgroundColor: ws.color }}
    >
      {(ws.avatarLetter ?? ws.name[0]).toUpperCase()}
    </div>
  );
}

function WorkspacePicker({
  current,
  onSelect,
  onManageOrganization,
  onClose,
  anchorRef,
}: {
  current: string;
  onSelect: (w: string) => void;
  onManageOrganization?: () => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [query, setQuery] = useState('');
  const [manageHover, setManageHover] = useState(false);
  const [showManageTooltip, setShowManageTooltip] = useState(false);
  const manageTooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(
    () => () => {
      if (manageTooltipTimer.current) clearTimeout(manageTooltipTimer.current);
    },
    [],
  );

  const filteredWorkspaces = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return APP_WORKSPACES;
    return APP_WORKSPACES.filter((ws) => ws.name.toLowerCase().includes(q));
  }, [query]);

  function handleManageEnter() {
    setManageHover(true);
    if (manageTooltipTimer.current) clearTimeout(manageTooltipTimer.current);
    manageTooltipTimer.current = setTimeout(() => setShowManageTooltip(true), 600);
  }

  function handleManageLeave() {
    setManageHover(false);
    setShowManageTooltip(false);
    if (manageTooltipTimer.current) clearTimeout(manageTooltipTimer.current);
  }

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
            placeholder="Search workspace"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border-2)] bg-[var(--color-surface-secondary)] py-1.5 pl-8 pr-2.5 text-[var(--font-size-sm)] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary-500)]"
          />
        </div>
      </div>

      {/* Scrollable list — sized to ~5 rows, rest reachable by scroll/search */}
      <div className="max-h-[200px] overflow-y-auto py-0.5">
        {filteredWorkspaces.length === 0 ? (
          <p className="px-3 py-3 text-center text-[var(--font-size-sm)] text-[var(--color-text-tertiary)]">
            No workspaces found
          </p>
        ) : (
          filteredWorkspaces.map((ws) => {
            const isActive = ws.id === current;
            return (
              <button
                key={ws.id}
                type="button"
                onClick={() => {
                  onSelect(ws.id);
                  onClose();
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-[var(--font-size-sm)] transition-colors ${
                  isActive
                    ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-500)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <WorkspaceAvatar wsId={ws.id} size="sm" />
                <span className="flex-1 truncate text-left">{ws.name}</span>
                {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary-500)]" />}
              </button>
            );
          })
        )}
      </div>

      <div className="mx-3 my-1.5 h-px bg-[var(--color-border-2)]" role="separator" />

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            onManageOrganization?.();
            onClose();
          }}
          onMouseEnter={handleManageEnter}
          onMouseLeave={handleManageLeave}
          className="mx-1.5 flex w-[calc(100%-12px)] items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-[var(--font-size-sm)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]"
        >
          <span className="flex-1 text-left">Manage organization</span>
          <ArrowUpRight
            className={`h-3.5 w-3.5 shrink-0 text-[var(--color-text-tertiary)] transition-opacity duration-100 ${
              manageHover ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </button>

        <AnimatePresence>
          {showManageTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.12 }}
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1.5 right-1.5 z-[10000] mb-1.5 rounded-[var(--radius-sm)] bg-[var(--color-neutral-800)] px-2.5 py-1.5 text-[var(--font-size-xs)] leading-snug text-white shadow-lg"
            >
              Opens organization management in a new tab, where you can manage members,
              workspaces, and settings.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>,
    document.body,
  );
}

function SidebarSection({
  section,
  defaultOpen,
  collapsed,
  currentPage,
  onNavigate,
  openSection,
  onCollapsedIconClick,
}: {
  section: NavSection;
  defaultOpen: boolean;
  collapsed: boolean;
  currentPage: string;
  onNavigate: (pageId: string) => void;
  /** Expand sidebar with this section's sub-nav open */
  openSection?: boolean;
  onCollapsedIconClick?: (section: NavSection) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const SectionIcon = section.icon;
  const hasActive = section.items.some((i) => i.pageId === currentPage);

  useEffect(() => {
    if (openSection) setOpen(true);
  }, [openSection]);

  if (collapsed) {
    return (
      <SidebarTooltip label={section.title}>
        <button
          type="button"
          aria-label={`Open ${section.title}`}
          onClick={(e) => {
            e.stopPropagation();
            onCollapsedIconClick?.(section);
          }}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border-0 transition-colors ${
            hasActive
              ? 'bg-[var(--color-neutral-150)] text-[var(--color-text-primary)]'
              : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <SectionIcon className="h-4 w-4 shrink-0" />
        </button>
      </SidebarTooltip>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-3 py-2 text-[var(--font-size-sm)] font-bold text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-text-primary)]"
      >
        <SectionIcon className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" />
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

export interface AppSidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  currentWorkspace: string;
  onWorkspaceChange: (workspaceId: string) => void;
  onManageOrganization?: () => void;
  onManageNotifications?: () => void;
  onOpenSettings?: () => void;
  currentPage: string;
  onNavigate: (pageId: string) => void;
  inboxOpen: boolean;
  onInboxToggle: () => void;
  /** Unread count for inbox badge; omit to hide badge */
  inboxUnreadCount?: number;
  /** Red badge when true, amber when false and count > 0 */
  inboxBadgeCritical?: boolean;
}

export function AppSidebar({
  collapsed,
  onCollapsedChange,
  currentWorkspace,
  onWorkspaceChange,
  onManageOrganization,
  onManageNotifications,
  onOpenSettings,
  currentPage,
  onNavigate,
  inboxOpen,
  onInboxToggle,
  inboxUnreadCount,
  inboxBadgeCritical = false,
}: AppSidebarProps) {
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sectionToOpen, setSectionToOpen] = useState<string | null>(null);
  const workspaceBtnRef = useRef<HTMLButtonElement>(null);
  const profileBtnRef = useRef<HTMLButtonElement>(null);

  const sidebarW = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  function expandSidebar() {
    onCollapsedChange(false);
  }

  function openSectionFromCollapsedIcon(section: NavSection) {
    setSectionToOpen(section.title);
    onCollapsedChange(false);
  }

  useEffect(() => {
    if (!collapsed && sectionToOpen) {
      const t = window.setTimeout(() => setSectionToOpen(null), 300);
      return () => window.clearTimeout(t);
    }
  }, [collapsed, sectionToOpen]);

  function expandAndOpenPicker() {
    expandSidebar();
    setTimeout(() => setWorkspaceOpen(true), 260);
  }

  const showInboxBadge = inboxUnreadCount !== undefined && inboxUnreadCount > 0;
  const badgeLabel = inboxUnreadCount! > 9 ? '9+' : String(inboxUnreadCount);

  return (
    <motion.aside
      animate={{ width: sidebarW }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      style={{ position: 'relative', zIndex: 45 }}
      onMouseEnter={() => setSidebarHovered(true)}
      onMouseLeave={() => setSidebarHovered(false)}
      className="flex h-full shrink-0 flex-col overflow-hidden border-r border-[var(--phase1-chrome-separator,var(--color-border-2))] bg-[var(--color-surface-secondary)]"
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
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 28, marginBottom: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      expandSidebar();
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-neutral-150)] hover:text-[var(--color-text-primary)]"
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
                <WorkspaceAvatar wsId={currentWorkspace} size="lg" />
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
              onClick={(e) => e.stopPropagation()}
            >
              <WorkspaceAvatar wsId={currentWorkspace} />
              <span className="flex-1 truncate text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)]">
                {currentWorkspace}
              </span>

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
                ref={workspaceBtnRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setWorkspaceOpen((o) => !o);
                }}
                className="flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] p-1 text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-150 ${workspaceOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {workspaceOpen && (
                  <WorkspacePicker
                    current={currentWorkspace}
                    onSelect={onWorkspaceChange}
                    onManageOrganization={onManageOrganization}
                    onClose={() => setWorkspaceOpen(false)}
                    anchorRef={workspaceBtnRef}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className={`flex-1 overflow-y-auto py-2 ${collapsed ? 'flex min-h-0 flex-col items-center px-1' : 'space-y-1'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {collapsed ? (
          <>
            <div className="flex shrink-0 flex-col items-center gap-1">
              {APP_NAV_SECTIONS.map((s) => (
                <SidebarSection
                  key={s.title}
                  section={s}
                  defaultOpen={s.defaultOpen ?? false}
                  collapsed={collapsed}
                  currentPage={currentPage}
                  onNavigate={onNavigate}
                  onCollapsedIconClick={openSectionFromCollapsedIcon}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Expand navigation sidebar"
              onClick={expandSidebar}
              className="mt-1 w-full min-h-8 flex-1 cursor-pointer border-0 bg-transparent p-0"
            />
          </>
        ) : (
          APP_NAV_SECTIONS.map((s) => (
            <SidebarSection
              key={s.title}
              section={s}
              defaultOpen={s.defaultOpen ?? false}
              collapsed={collapsed}
              currentPage={currentPage}
              onNavigate={onNavigate}
              openSection={sectionToOpen === s.title}
              onCollapsedIconClick={openSectionFromCollapsedIcon}
            />
          ))
        )}
      </div>

      <div
        className={`shrink-0 border-t border-[var(--color-border-1)] ${collapsed ? 'flex flex-col items-center gap-1 px-1 py-2' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {collapsed ? (
          <SidebarTooltip label="Inbox">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onInboxToggle();
              }}
              className={`relative flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] transition-colors ${
                inboxOpen
                  ? 'bg-[var(--color-neutral-150)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <InboxSidebarIcon className="h-4 w-4" />
              {showInboxBadge && (
                <span
                  className={`absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-0.5 text-[9px] font-bold leading-none text-white ${
                    inboxBadgeCritical ? 'bg-[var(--color-red-500)]' : 'bg-[#D97706]'
                  }`}
                >
                  {badgeLabel}
                </span>
              )}
            </button>
          </SidebarTooltip>
        ) : (
          <div className="px-2 pt-2">
            <button
              type="button"
              onClick={onInboxToggle}
              className={`flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-[var(--font-size-sm)] transition-colors ${
                inboxOpen
                  ? 'bg-[var(--color-neutral-150)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <span className="relative shrink-0">
                <InboxSidebarIcon className="h-3.5 w-3.5" />
                {showInboxBadge && (
                  <span
                    className={`absolute -right-1.5 -top-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-0.5 text-[9px] font-bold leading-none text-white shadow-sm ${
                      inboxBadgeCritical ? 'bg-[var(--color-red-500)]' : 'bg-[#D97706]'
                    }`}
                  >
                    {badgeLabel}
                  </span>
                )}
              </span>
              <span>Inbox</span>
            </button>
          </div>
        )}

        {collapsed ? (
          <SidebarTooltip label="Knowledge Hub">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]"
            >
              <BookMarked className="h-4 w-4" />
            </a>
          </SidebarTooltip>
        ) : (
          <div className="px-2">
            <a
              href="#"
              className="flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-[var(--font-size-sm)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]"
            >
              <BookMarked className="h-3.5 w-3.5 shrink-0" />
              Knowledge Hub
            </a>
          </div>
        )}

        {collapsed ? (
          <SidebarTooltip label="Settings">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings?.();
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] transition-colors ${
                currentPage === 'settings'
                  ? 'bg-[var(--color-neutral-150)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <SettingsIcon className="h-4 w-4" />
            </button>
          </SidebarTooltip>
        ) : (
          <div className="px-2">
            <button
              type="button"
              onClick={() => onOpenSettings?.()}
              className={`flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-[var(--font-size-sm)] transition-colors ${
                currentPage === 'settings'
                  ? 'bg-[var(--color-neutral-150)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <SettingsIcon className="h-3.5 w-3.5 shrink-0" />
              Settings
            </button>
          </div>
        )}

        <button
          ref={profileBtnRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setProfileOpen((o) => !o);
          }}
          className={`mt-1 flex w-full items-center border-t border-[var(--color-border-1)] transition-colors hover:bg-[var(--color-surface-tertiary)] ${
            collapsed ? 'justify-center px-2 py-2.5' : 'gap-2 px-3 py-2.5'
          } ${profileOpen ? 'bg-[var(--color-surface-tertiary)]' : ''}`}
        >
          {collapsed ? (
            <UserAvatar size="sm" />
          ) : (
            <>
              <UserAvatar />
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)]">
                  {SIDEBAR_USER.name} - {SIDEBAR_USER.role}
                </p>
                <p className="truncate text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">
                  {SIDEBAR_USER.email}
                </p>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-tertiary)]" />
            </>
          )}
        </button>

        <AnimatePresence>
          {profileOpen && (
            <UserProfileMenu
              user={SIDEBAR_USER}
              anchorRef={profileBtnRef}
              onClose={() => setProfileOpen(false)}
              onManageNotifications={onManageNotifications}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}

export function getSidebarWidth(collapsed: boolean) {
  return collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
}
