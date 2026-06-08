import { p1Font } from './phase1Typography';

/** Google Workspace–style avatar palette (white letter on solid fill) */
export const PHASE1_SAAS_AVATAR_COLORS = [
  '#1A73E8',
  '#E37400',
  '#0D652D',
  '#9334E6',
  '#D93025',
  '#12B5CB',
] as const;

export function Phase1UserAvatar({
  name,
  initials,
  avatarColor,
  avatarUrl,
  size = 24,
}: {
  name: string;
  initials: string;
  avatarColor: string;
  avatarUrl?: string;
  size?: number;
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          display: 'block',
        }}
      />
    );
  }

  const letter = initials.trim().charAt(0).toUpperCase() || '?';

  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: avatarColor,
        color: '#FFFFFF',
        fontSize: size <= 24 ? 11 : 13,
        fontWeight: 500,
        fontFamily: p1Font.family,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      {letter}
    </span>
  );
}
