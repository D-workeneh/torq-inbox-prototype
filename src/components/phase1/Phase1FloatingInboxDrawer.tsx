'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { getSidebarWidth } from '@/components/shell/AppSidebar';

export const FLOATING_INBOX_W = 400;
/** Gap between main nav right edge and floating inbox */
export const FLOATING_INBOX_GAP_AFTER_NAV = 16;
/** Inset from viewport bottom */
export const FLOATING_INBOX_BOTTOM = 4;
/** Drawer height — remaining ~15% of viewport stays above (minus bottom inset) */
export const FLOATING_INBOX_HEIGHT_VH = 85;
/** Drawer close duration — keep in sync with exit transition below */
export const FLOATING_INBOX_CLOSE_MS = 220;

export function getFloatingInboxLeft(sidebarCollapsed: boolean) {
  return getSidebarWidth(sidebarCollapsed) + FLOATING_INBOX_GAP_AFTER_NAV;
}

export function Phase1FloatingInboxDrawer({
  open,
  sidebarCollapsed,
  children,
}: {
  open: boolean;
  sidebarCollapsed: boolean;
  children: React.ReactNode;
}) {
  const left = getFloatingInboxLeft(sidebarCollapsed);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="floating-inbox"
          initial={{ opacity: 0, x: -16, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.97 }}
          transition={{
            duration: FLOATING_INBOX_CLOSE_MS / 1000,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="fixed z-[45] box-border flex flex-col overflow-hidden border border-[#DDDEE5] bg-white"
          style={{
            left,
            bottom: FLOATING_INBOX_BOTTOM,
            height: `${FLOATING_INBOX_HEIGHT_VH}vh`,
            width: FLOATING_INBOX_W,
            borderRadius: 12,
            boxShadow:
              '0 16px 48px rgba(9, 10, 11, 0.14), 0 4px 16px rgba(9, 10, 11, 0.08)',
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
