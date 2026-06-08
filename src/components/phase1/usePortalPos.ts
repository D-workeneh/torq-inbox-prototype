import { useEffect, useState } from 'react';

type PopoverAlign = 'right' | 'left';

/** Fixed coords from anchor so popovers escape overflow:hidden (Phase 2 pattern) */
export function usePortalPos(
  anchorEl: HTMLElement | null,
  align: PopoverAlign = 'right',
  offsetY = 6,
) {
  const [pos, setPos] = useState<{ top: number; right?: number; left?: number } | null>(null);

  useEffect(() => {
    if (!anchorEl) return;
    const update = () => {
      const r = anchorEl.getBoundingClientRect();
      if (align === 'right') {
        setPos({ top: r.bottom + offsetY, right: window.innerWidth - r.right });
      } else {
        setPos({ top: r.bottom + offsetY, left: r.left });
      }
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [anchorEl, align, offsetY]);

  return pos;
}
