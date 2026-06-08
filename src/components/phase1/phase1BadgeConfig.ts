import {
  AtSign,
  Check,
  Download,
  Mail,
  Plug,
  Share2,
  Sparkles,
  UserCog,
  ThumbsUp,
  type LucideIcon,
} from 'lucide-react';
import type { Phase1NotifRow } from './types';

const BADGE_ICON_BLACK = '#090A0B';
const FAIL_BADGE_BG = '#DC2626';

export type Phase1BadgeConfig =
  | {
      variant: 'icon';
      Icon: LucideIcon;
      iconColor: string;
    }
  | {
      variant: 'fail';
    };

function failBadge(row: Phase1NotifRow): Phase1BadgeConfig | null {
  if (row.badgeBg === FAIL_BADGE_BG) {
    return { variant: 'fail' };
  }
  return null;
}

/** Corner badge on avatar — black icons on white; failures use red badge + white X (persists when read) */
export function getPhase1BadgeConfig(row: Phase1NotifRow): Phase1BadgeConfig | null {
  const failure = failBadge(row);
  if (failure) return failure;

  switch (row.avatarIcon) {
    case 'workflow':
      return null;
    case 'ai':
      return { variant: 'icon', Icon: Sparkles, iconColor: BADGE_ICON_BLACK };
    case 'mention':
      return { variant: 'icon', Icon: AtSign, iconColor: BADGE_ICON_BLACK };
    case 'share':
      return { variant: 'icon', Icon: Share2, iconColor: BADGE_ICON_BLACK };
    case 'export':
      return { variant: 'icon', Icon: Download, iconColor: BADGE_ICON_BLACK };
    case 'publish':
      return { variant: 'icon', Icon: ThumbsUp, iconColor: BADGE_ICON_BLACK };
    case 'connector':
      return {
        variant: 'icon',
        Icon: row.badgeBg === '#16A34A' ? Check : Plug,
        iconColor: BADGE_ICON_BLACK,
      };
    case 'invite':
      return { variant: 'icon', Icon: Mail, iconColor: BADGE_ICON_BLACK };
    case 'organization':
      return { variant: 'icon', Icon: UserCog, iconColor: BADGE_ICON_BLACK };
    default:
      return null;
  }
}
