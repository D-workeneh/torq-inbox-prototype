'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { getSidebarWidth } from '@/components/shell/AppSidebar';

export const FLOATING_INBOX_W = 384;
/** Gap between main nav right edge and floating inbox */
export const FLOATING_INBOX_GAP_AFTER_NAV = 16;
/** Inset from viewport bottom */
export const FLOATING_INBOX_BOTTOM = 24;
/** Drawer height — remaining ~25% of viewport stays above (minus bottom inset) */
export const FLOATING_INBOX_HEIGHT_VH = 75;

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
          initial={{ opacity: 0, x: -12, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="fixed z-[45] flex flex-col overflow-hidden bg-white"
          style={{
            left,
            bottom: FLOATING_INBOX_BOTTOM,
            height: `${FLOATING_INBOX_HEIGHT_VH}vh`,
            width: FLOATING_INBOX_W,
            borderRadius: 12,
            border: '1px solid #EBEBEB',
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
