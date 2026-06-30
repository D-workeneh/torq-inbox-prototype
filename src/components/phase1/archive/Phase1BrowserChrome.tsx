/**
 * Archived island browser chrome (tab strip, address bar, bookmarks).
 * Not mounted in Phase1Experience — restore by importing Phase1BrowserChrome
 * from this file and wiring layout constants from phase1LayoutConstants.
 */
'use client';

import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Folder,
  Grid3x3,
  History,
  Minus,
  MoreVertical,
  Plus,
  Puzzle,
  RotateCw,
  Search,
  Star,
  X,
  Zap,
} from 'lucide-react';
import { APP_WORKSPACES } from '@/lib/appNavConfig';
import type { Phase1BrowserTab } from '../types';
import { p1Font } from '../phase1Typography';

export type { Phase1BrowserTab };

/* Island browser chrome palette */
const TAB_ROW_BG = '#D4E3FC';
const ISLAND_SEARCH_BG = '#EDF2FA';
const TAB_BAR_BG = TAB_ROW_BG;
const TAB_ROW_HEIGHT = 40;
const TAB_STRIP_INSET = 8;
const TAB_INACTIVE_HEIGHT = 20;
const TAB_ACTIVE_TOP_INSET = 4;
const TAB_CORNER_RADIUS = 10;
const TAB_INVERSE_RADIUS = 10;
const TAB_ACTIVE_HEIGHT = TAB_ROW_HEIGHT - TAB_ACTIVE_TOP_INSET;
const TOOLBAR_ACTION_SIZE = 24;
const TOOLBAR_ACTION_ICON = 16;
const ISLAND_TAB_TO_SEARCH_GAP = 8;
const ISLAND_SEARCH_TO_CHIPS_GAP = 8;
const ISLAND_SEARCH_TO_ACTIONS_GAP = 16;

const TAB_ROW_GROUPS = [
  { kind: 'square' as const, label: 'D', bg: '#1A73E8' },
  { kind: 'square' as const, label: 'C', bg: '#E91E8C' },
  { kind: 'square' as const, label: 'T', bg: '#7C3AED' },
  { kind: 'square' as const, label: 'G', bg: '#0D9488' },
  { kind: 'square' as const, label: 'N', bg: '#6B7280' },
  { kind: 'square' as const, label: 'M', bg: '#4B5563' },
  { kind: 'square' as const, label: 'Y', bg: '#DC2626' },
  { kind: 'square' as const, label: 'T', bg: '#9CA3AF' },
  { kind: 'pill' as const, label: 'Inspo', bg: '#0891B2' },
  { kind: 'pill' as const, label: 'Apple', bg: '#6B7280' },
  { kind: 'pill' as const, label: 'Material', bg: '#2563EB' },
  { kind: 'pill' as const, label: 'SAAS', bg: '#EA580C' },
] as const;

function MacWindowControls() {
  return (
    <div
      className="group/mac flex shrink-0 items-center gap-[6px] pl-1.5 pr-2"
      style={{ height: TAB_GROUP_CHIP_H }}
      aria-hidden
    >
      <span className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#ED6A5E]">
        <X
          size={7}
          strokeWidth={3}
          className="text-[#660000] opacity-0 transition-opacity duration-150 group-hover/mac:opacity-100"
        />
      </span>
      <span className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#F5BD4F]">
        <Minus
          size={7}
          strokeWidth={3}
          className="text-[#5a4600] opacity-0 transition-opacity duration-150 group-hover/mac:opacity-100"
        />
      </span>
      <span className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#61C554]">
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          fill="none"
          className="opacity-0 transition-opacity duration-150 group-hover/mac:opacity-100"
          aria-hidden
        >
          <path d="M1 3L3 1M5 1L7 3M7 5L5 7M3 7L1 5" stroke="#0d3d12" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M3 1H5M7 3V5M5 7H3M1 5V3" stroke="#0d3d12" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
}

const TAB_GROUP_CHIP_H = 20;
const TAB_GROUP_CHIP_RADIUS = 5;
const TAB_INACTIVE_ICON_RADIUS = 4;
const ADDRESS_BAR_ROW_HEIGHT = ISLAND_TAB_TO_SEARCH_GAP + 30 + ISLAND_SEARCH_TO_CHIPS_GAP;
const BOOKMARKS_ROW_HEIGHT = 8 + TAB_GROUP_CHIP_H + 8;

/** Three chrome rows only (tabs, address bar, bookmarks). */
export const PHASE1_BROWSER_CHROME_HEIGHT =
  TAB_ROW_HEIGHT + ADDRESS_BAR_ROW_HEIGHT + BOOKMARKS_ROW_HEIGHT;
export const PHASE1_CHROME_SEPARATOR_HEIGHT = 1;
export const PHASE1_CHROME_CONTENT_SEPARATOR = '#E1E3E1';
/** Chrome rows + the 1px content separator below them. */
export const PHASE1_LAYOUT_TOP_OFFSET =
  PHASE1_BROWSER_CHROME_HEIGHT + PHASE1_CHROME_SEPARATOR_HEIGHT;

function TabRowGroupChip({ item }: { item: (typeof TAB_ROW_GROUPS)[number] }) {
  const sharedClass =
    'flex shrink-0 items-center justify-center text-[10px] font-semibold leading-none text-white';

  if (item.kind === 'pill') {
    return (
      <span
        aria-hidden
        className={`${sharedClass} px-2`}
        style={{
          background: item.bg,
          height: TAB_GROUP_CHIP_H,
          borderRadius: TAB_GROUP_CHIP_RADIUS,
        }}
      >
        {item.label}
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={sharedClass}
      style={{
        background: item.bg,
        width: TAB_GROUP_CHIP_H,
        height: TAB_GROUP_CHIP_H,
        borderRadius: TAB_GROUP_CHIP_RADIUS,
      }}
    >
      {item.label}
    </span>
  );
}

function TorqTabLogo() {
  return (
    <svg width={14} height={10} viewBox="0 0 20 14" fill="none" aria-hidden className="shrink-0">
      <rect x="0" y="0" width="20" height="3" rx="1.5" fill="#090A0B" />
      <rect x="0" y="5.5" width="13" height="3" rx="1.5" fill="#090A0B" />
      <rect x="0" y="11" width="7" height="3" rx="1.5" fill="#090A0B" />
    </svg>
  );
}

function TabInverseCorners() {
  const r = TAB_INVERSE_RADIUS;
  const shared: CSSProperties = {
    position: 'absolute',
    bottom: 0,
    width: r,
    height: r,
    pointerEvents: 'none',
    zIndex: 0,
  };

  return (
    <>
      <span
        aria-hidden
        style={{
          ...shared,
          left: -r,
          background: `radial-gradient(circle at 0% 0%, transparent ${r}px, #FFFFFF ${r}px)`,
        }}
      />
      <span
        aria-hidden
        style={{
          ...shared,
          right: -r,
          background: `radial-gradient(circle at 100% 0%, transparent ${r}px, #FFFFFF ${r}px)`,
        }}
      />
    </>
  );
}

function pageTabLabel(pageId: string): string {
  if (pageId === 'cases') return 'Cases';
  if (pageId === 'integrations') return 'Integrations';
  if (pageId === 'workflows') return 'Workflows';
  return pageId
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildActiveTabLabel(
  pageId: string,
  workspaceName: string,
  workflowName: string | null,
): string {
  if (workflowName) {
    return `${workflowName} - ${workspaceName}`;
  }
  return `${pageTabLabel(pageId)} - ${workspaceName}`;
}

function Phase1SelectedBrowserTab({
  label,
  onSelect,
}: {
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected
      onClick={onSelect}
      className="relative z-[3] flex w-max max-w-[320px] shrink-0 items-center gap-2 self-end overflow-visible border-0 bg-white px-2 text-[#3C4043]"
      style={{
        height: TAB_ACTIVE_HEIGHT,
        borderTopLeftRadius: TAB_CORNER_RADIUS,
        borderTopRightRadius: TAB_CORNER_RADIUS,
      }}
    >
      <TabInverseCorners />
      <span className="relative z-[1] flex min-w-0 items-center gap-2">
        <TorqTabLogo />
        <span className="truncate text-[12px] font-medium leading-none text-[#3C4043]">{label}</span>
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[#090A0B]" aria-hidden>
          <X size={12} strokeWidth={2} />
        </span>
      </span>
    </button>
  );
}

function workspaceMeta(workspaceId: string) {
  const ws = APP_WORKSPACES.find((w) => w.id === workspaceId) ?? APP_WORKSPACES[0];
  const letter = (ws.avatarLetter ?? ws.name[0]).toUpperCase();
  return { ws, letter };
}

function buildTorqUrl(
  workspaceId: string,
  pageId: string,
  workflowName: string | null,
): string {
  const account = workspaceId;
  if (workflowName) {
    return `app.torq.io/workflow/b35e7864-c28f-4f58-9199-a118c97e5410?account=${account}`;
  }
  const path =
    pageId === 'cases'
      ? 'cases'
      : pageId === 'integrations'
        ? 'integrations'
        : 'workflows';
  return `app.torq.io/${path}?account=${account}`;
}

const BOOKMARK_CHIPS = [
  { kind: 'circle' as const, label: 'C', color: '#E91E8C' },
  { kind: 'pill' as const, label: 'Inspo', color: '#0891B2' },
  { kind: 'pill' as const, label: 'SAAS', color: '#CA8A04' },
  { kind: 'circle' as const, label: 'G', color: '#16A34A' },
  { kind: 'pill' as const, label: 'Apple', color: '#6B7280' },
  { kind: 'circle' as const, label: 'N', color: '#6B7280' },
  { kind: 'pill' as const, label: 'Material', color: '#2563EB' },
  { kind: 'circle' as const, label: 'Y', color: '#DC2626' },
  { kind: 'pill' as const, label: 'Design', color: '#C2410C' },
  { kind: 'circle' as const, label: 'D', color: '#0284C7' },
  { kind: 'circle' as const, label: 'T', color: '#6B7280' },
  { kind: 'circle' as const, label: 'M', color: '#6B7280' },
];

function ChromeIconButton({
  children,
  size = 28,
  className = '',
}: {
  children: ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center text-[#5F6368] ${className}`}
      style={{ width: size, height: size }}
    >
      {children}
    </span>
  );
}

function ChromeToolbarDivider() {
  return <span aria-hidden className="mx-0.5 h-5 w-px shrink-0 bg-[#DADCE0]" />;
}

function ChromeBookmarksDivider() {
  return (
    <span
      aria-hidden
      className="mx-0.5 w-px shrink-0 self-stretch bg-[#DADCE0]"
      style={{ minHeight: 18 }}
    />
  );
}

function GreenCheckBadge() {
  return (
    <span
      aria-hidden
      className="flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full bg-[#34A853]"
    >
      <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
        <path
          d="M1 4.2L3.6 6.8L9 1.4"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function LensCameraIcon() {
  return (
    <ChromeIconButton size={TOOLBAR_ACTION_SIZE}>
      <svg
        width={TOOLBAR_ACTION_ICON}
        height={TOOLBAR_ACTION_ICON}
        viewBox="0 0 18 18"
        fill="none"
      >
        <circle cx="9" cy="9" r="7.25" fill="#1A73E8" />
        <circle cx="9" cy="9" r="3.25" fill="white" />
        <circle cx="9" cy="9" r="1.4" fill="#1A73E8" />
      </svg>
    </ChromeIconButton>
  );
}

function OrangeDocIcon() {
  return (
    <ChromeIconButton size={TOOLBAR_ACTION_SIZE}>
      <svg
        width={TOOLBAR_ACTION_ICON}
        height={TOOLBAR_ACTION_ICON}
        viewBox="0 0 16 18"
        fill="none"
      >
        <rect x="1" y="1" width="14" height="16" rx="2" fill="#F9AB00" />
        <rect x="3.5" y="4.5" width="9" height="1.5" rx="0.75" fill="white" />
        <rect x="3.5" y="8" width="7" height="1.5" rx="0.75" fill="white" opacity="0.85" />
      </svg>
    </ChromeIconButton>
  );
}

function ToolbarUserAvatar() {
  return (
    <ChromeIconButton size={TOOLBAR_ACTION_SIZE}>
      <span
        className="flex items-center justify-center rounded-full bg-[#F9AB00] text-[9px] font-bold leading-none text-white"
        style={{ width: TOOLBAR_ACTION_ICON, height: TOOLBAR_ACTION_ICON }}
      >
        DW
      </span>
    </ChromeIconButton>
  );
}

function islandChipTint(color: string) {
  return `${color}18`;
}

function BookmarkChip({
  chip,
}: {
  chip: (typeof BOOKMARK_CHIPS)[number];
}) {
  const isCircle = chip.kind === 'circle';
  return (
    <span
      aria-hidden
      className={[
        'flex shrink-0 items-center justify-center border text-[10px] font-semibold leading-none',
        isCircle ? 'h-[18px] w-[18px] rounded-[5px]' : 'h-[18px] rounded-[5px] px-1.5',
      ].join(' ')}
      style={{
        borderColor: chip.color,
        background: islandChipTint(chip.color),
        color: chip.color,
      }}
    >
      {chip.label}
    </span>
  );
}

export function Phase1BrowserChrome({
  tabs,
  currentPage,
  activeWorkflowName,
  pendingTabWorkspaceId,
  onSelectTab,
}: {
  tabs: Phase1BrowserTab[];
  currentPage: string;
  activeWorkflowName: string | null;
  pendingTabWorkspaceId: string | null;
  onSelectTab: (workspaceId: string) => void;
}) {
  const activeTab = tabs.find((t) => t.isActive) ?? tabs[0];
  const activeWorkspaceId = activeTab?.workspaceId ?? 'torq-dev';
  const { ws: activeWorkspace } = workspaceMeta(activeWorkspaceId);
  const activeTabLabel = buildActiveTabLabel(
    currentPage,
    activeWorkspace.name,
    activeWorkflowName,
  );
  const url = useMemo(
    () => buildTorqUrl(activeWorkspaceId, currentPage, activeWorkflowName),
    [activeWorkspaceId, currentPage, activeWorkflowName],
  );

  return (
    <header
      className="flex shrink-0 flex-col"
      style={{
        fontFamily: p1Font.family,
        background: '#FFFFFF',
      }}
    >
      {/* Tab strip */}
      <div
        className="relative z-[2] box-border flex items-center gap-2 overflow-visible pl-1 pr-2"
        style={{
          height: TAB_ROW_HEIGHT,
          background: TAB_ROW_BG,
        }}
      >
        <MacWindowControls />

        <div className="flex shrink-0 items-center gap-3" aria-hidden>
          {TAB_ROW_GROUPS.map((item) => (
            <TabRowGroupChip key={`${item.kind}-${item.label}`} item={item} />
          ))}
        </div>

        <Phase1SelectedBrowserTab
          label={activeTabLabel}
          onSelect={() => onSelectTab(activeWorkspaceId)}
        />

        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-visible">
          <div
            className="flex min-w-0 items-center gap-[2px] overflow-x-auto overflow-y-visible"
          >
            <AnimatePresence initial={false}>
              {tabs.map((tab) => {
                if (tab.isActive) return null;

                const { ws, letter } = workspaceMeta(tab.workspaceId);
                const isAnimatingIn =
                  tab.isPending || pendingTabWorkspaceId === tab.workspaceId;

                return (
                  <motion.button
                    key={tab.id}
                    type="button"
                    layout
                    initial={isAnimatingIn ? { opacity: 0, y: 10, scale: 0.94 } : false}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => onSelectTab(tab.workspaceId)}
                    className="group relative flex max-w-[200px] min-w-[120px] shrink-0 items-center gap-2 border-0 bg-transparent px-2.5 text-left text-[#3C4043] hover:bg-[#ffffff55]"
                    style={{ height: TAB_INACTIVE_HEIGHT }}
                    aria-selected={false}
                    role="tab"
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center text-[10px] font-bold text-white"
                      style={{
                        backgroundColor: ws.color,
                        borderRadius: TAB_INACTIVE_ICON_RADIUS,
                      }}
                    >
                      {letter}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12px] font-medium leading-none text-[#3C4043]">
                      {ws.name}
                    </span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#5F6368]"
          >
            <Plus size={15} strokeWidth={2} />
          </button>
        </div>

        <div
          aria-hidden
          className="flex shrink-0 items-center gap-2 pl-1"
        >
          <span
            className="flex h-[22px] items-center bg-white px-2 text-[11px] font-bold leading-none text-[#090A0B]"
            style={{ borderRadius: TAB_INACTIVE_ICON_RADIUS }}
          >
            torq
          </span>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] bg-[#ECF3FE] text-[#5F6368]"
          >
            <ChevronDown size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Island address bar row — below tab strip */}
      <div
        className="relative z-[1] flex items-center bg-white px-3"
        style={{
          gap: ISLAND_SEARCH_TO_ACTIONS_GAP,
          paddingTop: ISLAND_TAB_TO_SEARCH_GAP,
          paddingBottom: ISLAND_SEARCH_TO_CHIPS_GAP,
        }}
      >
        <div className="flex shrink-0 items-center gap-1 text-[#3C4043]">
          <ChromeIconButton className="opacity-50">
            <ChevronLeft size={16} strokeWidth={2} />
          </ChromeIconButton>
          <ChromeIconButton className="opacity-50">
            <ChevronRight size={16} strokeWidth={2} />
          </ChromeIconButton>
          <ChromeIconButton>
            <RotateCw size={14} strokeWidth={2} />
          </ChromeIconButton>
          <ChromeIconButton>
            <Zap size={14} strokeWidth={2} className="text-[#34A853]" fill="#34A853" />
          </ChromeIconButton>
        </div>

        <div
          className="flex h-[30px] min-w-0 flex-1 items-center gap-2 rounded-full px-2.5"
          style={{ background: ISLAND_SEARCH_BG }}
        >
          <span
            aria-hidden
            className="flex shrink-0 items-center gap-1 rounded-full border border-[#B7DFC4] bg-[#E8F6EC] px-2 py-0.5 text-[10px] font-medium text-[#137333]"
          >
            <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
              <path
                d="M5 1L1 3.2V5.8C1 8.4 2.8 10.8 5 11.5C7.2 10.8 9 8.4 9 5.8V3.2L5 1Z"
                stroke="#137333"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
            Secured
          </span>
          <ChromeIconButton size={20} className="text-[#5F6368]">
            <ArrowLeftRight size={12} strokeWidth={2} />
          </ChromeIconButton>
          <span className="min-w-0 flex-1 truncate text-[12px] text-[#202124]">{url}</span>
          <div className="flex shrink-0 items-center gap-0.5 pr-0.5 text-[#5F6368]">
            <ChromeIconButton size={24}>
              <Star size={14} strokeWidth={2} />
            </ChromeIconButton>
            <ChromeIconButton size={24}>
              <Search size={13} strokeWidth={2} />
            </ChromeIconButton>
            <ChromeIconButton size={24}>
              <History size={14} strokeWidth={2} />
            </ChromeIconButton>
            <ChromeIconButton size={24}>
              <GreenCheckBadge />
            </ChromeIconButton>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 text-[#5F6368]">
          <ChromeIconButton size={TOOLBAR_ACTION_SIZE}>
            <Puzzle size={TOOLBAR_ACTION_ICON} strokeWidth={2} />
          </ChromeIconButton>
          <ChromeToolbarDivider />
          <LensCameraIcon />
          <OrangeDocIcon />
          <ChromeIconButton size={TOOLBAR_ACTION_SIZE}>
            <Grid3x3 size={TOOLBAR_ACTION_ICON} strokeWidth={2} />
          </ChromeIconButton>
          <ChromeIconButton size={TOOLBAR_ACTION_SIZE}>
            <Bell size={TOOLBAR_ACTION_ICON} strokeWidth={2} />
          </ChromeIconButton>
          <ToolbarUserAvatar />
          <ChromeIconButton size={TOOLBAR_ACTION_SIZE}>
            <MoreVertical size={TOOLBAR_ACTION_ICON} strokeWidth={2} />
          </ChromeIconButton>
        </div>
      </div>

      {/* Bookmark / tab-group chips row */}
      <div className="relative z-[1] flex items-center gap-1.5 bg-white px-3 py-[8px]">
        <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto">
          {BOOKMARK_CHIPS.map((chip) => (
            <BookmarkChip key={`${chip.kind}-${chip.label}`} chip={chip} />
          ))}
        </div>
        <ChromeIconButton size={20} className="shrink-0 opacity-70">
          <Grid3x3 size={12} strokeWidth={2} />
        </ChromeIconButton>
        <ChromeBookmarksDivider />
        <span
          aria-hidden
          className="flex shrink-0 items-center gap-1.5 text-[11px] text-[#5F6368]"
        >
          <Folder size={14} strokeWidth={2} />
          <span>Other Bookmarks</span>
        </span>
      </div>
    </header>
  );
}
