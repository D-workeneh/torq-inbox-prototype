'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  ChevronRight,
  GraduationCap,
  Key,
  Library,
  LifeBuoy,
  LogOut,
  Moon,
  Pencil,
  Users,
} from 'lucide-react';
import { Switch } from '@/components/ui/Toggle';

export type ProfileMenuUser = {
  name: string;
  role: string;
  email: string;
  initials: string;
  avatarColor?: string;
};

function ProfileMenuAvatar({
  user,
  size = 'md',
}: {
  user: ProfileMenuUser;
  size?: 'sm' | 'md';
}) {
  const sz = size === 'sm' ? 'h-8 w-8 text-sm' : 'h-10 w-10 text-base';

  return (
    <div
      className={`${sz} flex shrink-0 items-center justify-center rounded-full font-bold text-white`}
      style={{ backgroundColor: user.avatarColor ?? '#2864FF' }}
    >
      {user.initials}
    </div>
  );
}

export function UserProfileMenu({
  user,
  onClose,
  anchorRef,
  onManageNotifications,
}: {
  user: ProfileMenuUser;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  onManageNotifications?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ bottom: number; left: number } | null>(null);
  const [knowledgeHubOn, setKnowledgeHubOn] = useState(true);

  useLayoutEffect(() => {
    if (anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setPos({ bottom: window.innerHeight - r.top + 8, left: 16 });
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

  if (!pos) return null;

  const menuItemClass =
    'flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-[var(--font-size-sm)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]';

  return createPortal(
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.14 }}
      style={{
        position: 'fixed',
        bottom: pos.bottom,
        left: pos.left,
        zIndex: 9999,
        width: 280,
      }}
      className="rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-primary)] py-1 shadow-xl"
    >
      <div className="flex items-start gap-3 px-3 py-2.5">
        <ProfileMenuAvatar user={user} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)]">
            {user.name} - {user.role}
          </p>
          <p className="truncate text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">
            {user.email}
          </p>
        </div>
        <button
          type="button"
          aria-label="Edit profile"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]"
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>

      <div className="mx-3 my-1 h-px bg-[var(--color-border-2)]" role="separator" />

      <div className="px-1.5 py-0.5">
        <button type="button" className={menuItemClass}>
          <Key className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span className="flex-1 text-left">API Keys</span>
        </button>

        <button
          type="button"
          className={menuItemClass}
          onClick={() => {
            onManageNotifications?.();
            onClose();
          }}
        >
          <Bell className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span className="flex-1 text-left">Manage notifications</span>
        </button>

        <div className={`${menuItemClass} justify-between`}>
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <Library className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span className="truncate text-left">Knowledge Hub Widget</span>
          </div>
          <Switch
            size="small"
            on={knowledgeHubOn}
            onChange={setKnowledgeHubOn}
            aria-label="Knowledge Hub Widget"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <button type="button" className={menuItemClass}>
          <LifeBuoy className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span className="flex-1 text-left">Support</span>
        </button>

        <button type="button" className={menuItemClass}>
          <GraduationCap className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span className="flex-1 text-left">Academy</span>
        </button>

        <button type="button" className={menuItemClass}>
          <Users className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span className="flex-1 text-left">Community</span>
        </button>

        <button type="button" className={`${menuItemClass} justify-between`}>
          <span className="flex items-center gap-2.5">
            <Moon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            Change theme
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-text-tertiary)]" />
        </button>
      </div>

      <div className="mx-3 my-1 h-px bg-[var(--color-border-2)]" role="separator" />

      <div className="px-1.5 pb-1 pt-0.5">
        <button type="button" className={menuItemClass}>
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span className="flex-1 text-left">Sign Out</span>
        </button>
      </div>
    </motion.div>,
    document.body,
  );
}
