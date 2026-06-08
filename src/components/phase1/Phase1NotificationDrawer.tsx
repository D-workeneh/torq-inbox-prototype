'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Phase1NotificationSourcePreview } from './Phase1NotificationSourcePreview';
import { getPhase1NotificationDrawerContent } from './phase1NotificationDrawerContent';
import type { Phase1NotifRow } from './types';
import { p1Font, p1Text } from './phase1Typography';

export const NOTIF_DRAWER_W = 368;
export const NOTIF_DRAWER_GAP = 8;
export const NOTIF_DRAWER_TOP = 20;
export const NOTIF_DRAWER_MAX_H = 520;

export type Phase1PreviewPlacement =
  | { mode: 'panel'; anchorLeft: number }
  | { mode: 'hover'; top: number; left: number };

export function Phase1NotificationDrawer({
  row,
  placement,
  onClose,
  onPrimaryAction,
  onCardMouseEnter,
  onCardMouseLeave,
  enableEscape = true,
}: {
  row: Phase1NotifRow | null;
  placement: Phase1PreviewPlacement | null;
  onClose: () => void;
  onPrimaryAction: (row: Phase1NotifRow) => void;
  onCardMouseEnter?: () => void;
  onCardMouseLeave?: () => void;
  enableEscape?: boolean;
}) {
  const content = row ? getPhase1NotificationDrawerContent(row) : null;

  const positionStyle =
    placement?.mode === 'hover'
      ? { top: placement.top, left: placement.left }
      : placement?.mode === 'panel'
        ? { top: NOTIF_DRAWER_TOP, left: placement.anchorLeft }
        : null;

  useEffect(() => {
    if (!row || !enableEscape) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [row, onClose, enableEscape]);

  return (
    <AnimatePresence>
      {row && content && positionStyle && (
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="phase1-notif-drawer-title"
            initial={{ opacity: 0, x: -12, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            className="fixed z-[50] flex flex-col overflow-hidden bg-white pointer-events-auto"
            onMouseEnter={onCardMouseEnter}
            onMouseLeave={onCardMouseLeave}
            style={{
              ...positionStyle,
              width: NOTIF_DRAWER_W,
              maxHeight: NOTIF_DRAWER_MAX_H,
              borderRadius: 12,
              border: '1px solid #EBEBEB',
              boxShadow:
                '0 12px 40px rgba(9, 10, 11, 0.14), 0 4px 12px rgba(9, 10, 11, 0.08)',
              fontFamily: p1Font.family,
            }}
          >
            <header
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '12px 14px',
                borderBottom: '1px solid #F0F0F0',
                flexShrink: 0,
              }}
            >
              <h2
                id="phase1-notif-drawer-title"
                style={{
                  margin: 0,
                  fontSize: p1Font.body1,
                  fontWeight: 600,
                  color: p1Text.primary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                }}
              >
                {content.drawerTitle}
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 30,
                  height: 30,
                  border: 'none',
                  borderRadius: 6,
                  background: 'transparent',
                  cursor: 'pointer',
                  color: p1Text.secondary,
                  flexShrink: 0,
                }}
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </header>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                minHeight: 0,
              }}
            >
              <div
                style={{
                  padding: '12px 14px 0',
                  ...(row.avatarIcon === 'ai'
                    ? { cursor: 'pointer' as const }
                    : undefined),
                }}
                role={row.avatarIcon === 'ai' ? 'button' : undefined}
                tabIndex={row.avatarIcon === 'ai' ? 0 : undefined}
                onClick={
                  row.avatarIcon === 'ai' ? () => onPrimaryAction(row) : undefined
                }
                onKeyDown={
                  row.avatarIcon === 'ai'
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onPrimaryAction(row);
                        }
                      }
                    : undefined
                }
              >
                <Phase1NotificationSourcePreview row={row} content={content} />
              </div>

              <div style={{ padding: '12px 14px 14px' }}>
                {content.preview === 'workflow-error' && row.body && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'flex-start',
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ fontSize: 12, lineHeight: 1.4, color: '#991B1B' }}>{row.body}</span>
                  </div>
                )}

                {content.preview === 'comment' && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: '#F97316',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      D
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: p1Font.body2, fontWeight: 600, color: p1Text.primary }}>
                        Dan M.
                        <span
                          style={{
                            fontWeight: 400,
                            color: p1Text.tertiary,
                            marginLeft: 6,
                          }}
                        >
                          {row.timestamp}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: '4px 0 0',
                          fontSize: p1Font.body2,
                          color: p1Text.secondary,
                          lineHeight: 1.4,
                        }}
                      >
                        {row.body}
                      </p>
                    </div>
                  </div>
                )}

                {content.preview !== 'comment' && (
                  <>
                    <p
                      style={{
                        margin: '0 0 6px',
                        fontSize: p1Font.body2,
                        color: p1Text.secondary,
                        lineHeight: 1.45,
                      }}
                    >
                      {content.summary}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: p1Font.body3,
                        color: p1Text.tertiary,
                      }}
                    >
                      {content.meta}
                    </p>
                  </>
                )}
              </div>
            </div>

            <footer
              style={{
                padding: '10px 14px 14px',
                borderTop: '1px solid #F0F0F0',
                flexShrink: 0,
              }}
            >
              <Button
                variant="dark"
                size="medium"
                fullWidth
                onClick={() => onPrimaryAction(row)}
              >
                {content.ctaLabel}
              </Button>
            </footer>
          </motion.aside>
      )}
    </AnimatePresence>
  );
}
