import { NOTIF_DRAWER_MAX_H, NOTIF_DRAWER_W } from './Phase1NotificationDrawer';

const PREVIEW_GAP = 6;
const VIEWPORT_PAD = 12;

export function computePreviewCardPosition(rect: DOMRect): { top: number; left: number } {
  const cardH = NOTIF_DRAWER_MAX_H;
  let top = rect.top + rect.height / 2 - cardH / 2;
  top = Math.max(VIEWPORT_PAD, Math.min(top, window.innerHeight - cardH - VIEWPORT_PAD));

  let left = rect.right + PREVIEW_GAP;
  const maxLeft = window.innerWidth - NOTIF_DRAWER_W - VIEWPORT_PAD;
  if (left > maxLeft) {
    left = Math.max(VIEWPORT_PAD, rect.left - NOTIF_DRAWER_W - PREVIEW_GAP);
  }

  return { top, left };
}
