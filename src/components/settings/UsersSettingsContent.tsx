'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Info, MoreHorizontal, Search } from 'lucide-react';
import { InviteUserHeadsetIcon } from './icons/InviteUserHeadsetIcon';

type UserRole = 'Operator' | 'Owner' | 'Interact Only' | 'Creator';

type UserRow = {
  id: string;
  name: string;
  email: string;
  lastLogin: string;
  role: UserRole;
  groups: string;
  avatar: { type: 'photo'; url: string } | { type: 'initials'; initials: string; color: string };
};

const MOCK_USERS: UserRow[] = [
  {
    id: '1',
    name: 'David Workeneh',
    email: 'david@torq.io',
    lastLogin: 'Jun 29 2022, 8:46 PM',
    role: 'Operator',
    groups: '',
    avatar: {
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face&auto=format',
    },
  },
  {
    id: '2',
    name: 'Adi Haviv Haviv',
    email: 'adi.haviv@torq.io',
    lastLogin: 'Jun 29 2022, 8:46 PM',
    role: 'Operator',
    groups: '',
    avatar: { type: 'initials', initials: 'AH', color: '#4285F4' },
  },
  {
    id: '3',
    name: 'Adi Haviv Haviv',
    email: 'adi.haviv@torq.io',
    lastLogin: 'Today at 10:56 AM',
    role: 'Owner',
    groups: '',
    avatar: {
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face&auto=format',
    },
  },
  {
    id: '4',
    name: 'David Workeneh',
    email: 'david@torq.io',
    lastLogin: 'Jun 29 2022, 8:46 PM',
    role: 'Owner',
    groups: '',
    avatar: {
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face&auto=format',
    },
  },
  {
    id: '5',
    name: 'Nir Yosha',
    email: 'nir.yosha@torq.io',
    lastLogin: 'Jun 29 2022, 8:46 PM',
    role: 'Interact Only',
    groups: '',
    avatar: { type: 'initials', initials: 'NY', color: '#12B5CB' },
  },
  {
    id: '6',
    name: 'Nir Yosha',
    email: 'nir.yosha@torq.io',
    lastLogin: 'Jun 29 2022, 8:46 PM',
    role: 'Interact Only',
    groups: '',
    avatar: {
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face&auto=format',
    },
  },
  {
    id: '7',
    name: 'Tzofia Bar',
    email: 'tzofia.bar@torq.io',
    lastLogin: 'Jun 29 2022, 8:46 PM',
    role: 'Creator',
    groups: '',
    avatar: { type: 'initials', initials: 'TB', color: '#E8717D' },
  },
  {
    id: '8',
    name: 'Itay Mizrachi',
    email: 'itay.mizrachi@torq.io',
    lastLogin: 'Jun 29 2022, 8:46 PM',
    role: 'Creator',
    groups: '',
    avatar: {
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face&auto=format',
    },
  },
  {
    id: '9',
    name: 'Omer Efrat',
    email: 'omer.efrat@torq.io',
    lastLogin: 'Jun 29 2022, 8:46 PM',
    role: 'Operator',
    groups: '',
    avatar: { type: 'initials', initials: 'OE', color: '#9334E6' },
  },
  {
    id: '10',
    name: 'Omer Efrat',
    email: 'omer.efrat@torq.io',
    lastLogin: 'Jun 29 2022, 8:46 PM',
    role: 'Operator',
    groups: '',
    avatar: {
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face&auto=format',
    },
  },
  {
    id: '11',
    name: 'Nir Yosha',
    email: 'nir.yosha@torq.io',
    lastLogin: 'May 14 2026, 3:58 PM',
    role: 'Owner',
    groups: '',
    avatar: {
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face&auto=format',
    },
  },
  {
    id: '12',
    name: 'David Workeneh',
    email: 'david@torq.io',
    lastLogin: 'Jun 29 2022, 8:46 PM',
    role: 'Owner',
    groups: '',
    avatar: { type: 'initials', initials: 'DW', color: '#9AA0A6' },
  },
  {
    id: '13',
    name: 'Marco Ricci',
    email: 'marco.ricci@torq.io',
    lastLogin: 'Jun 29 2022, 8:46 PM',
    role: 'Creator',
    groups: '',
    avatar: { type: 'initials', initials: 'MR', color: '#A1887F' },
  },
  {
    id: '14',
    name: 'Marco Ricci',
    email: 'marco.ricci@torq.io',
    lastLogin: 'Jun 29 2022, 8:46 PM',
    role: 'Creator',
    groups: '',
    avatar: {
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face&auto=format',
    },
  },
  {
    id: '15',
    name: 'Sarah Chen',
    email: 'sarah.chen@torq.io',
    lastLogin: 'Jun 29 2022, 8:46 PM',
    role: 'Operator',
    groups: '',
    avatar: { type: 'initials', initials: 'SC', color: '#F06292' },
  },
  {
    id: '16',
    name: 'Sarah Chen',
    email: 'sarah.chen@torq.io',
    lastLogin: 'Jun 29 2022, 8:46 PM',
    role: 'Operator',
    groups: '',
    avatar: {
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face&auto=format',
    },
  },
];

function UserTableAvatar({
  name,
  avatar,
}: {
  name: string;
  avatar: UserRow['avatar'];
}) {
  if (avatar.type === 'photo') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar.url}
        alt={name}
        className="h-8 w-8 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-medium text-white"
      style={{ backgroundColor: avatar.color }}
    >
      {avatar.initials}
    </span>
  );
}

function UserRoleSelect({ value }: { value: UserRole }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-[length:var(--font-size-body2)] font-normal text-[var(--text-primary)] transition-colors hover:text-[var(--text-secondary)]"
    >
      <span>{value}</span>
      <ChevronDown className="h-3 w-3 shrink-0 text-[var(--text-tertiary)]" strokeWidth={2} />
    </button>
  );
}

export function UsersSettingsContent() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      MOCK_USERS.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-level-2)] bg-[var(--surface)] py-2 pl-9 pr-3 text-[length:var(--font-size-body1)] outline-none transition-colors focus:border-[var(--neutral-12)]"
          />
        </div>
        <button
          type="button"
          aria-label="Invite user"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-level-2)] bg-[var(--surface)] text-[var(--text-primary)] transition-colors hover:border-[var(--border-level-3)] hover:bg-[var(--bg-hover-level-2)]"
        >
          <InviteUserHeadsetIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="shrink-0 rounded-[var(--radius-md)] bg-[var(--neutral-12)] px-4 py-2 text-[length:var(--font-size-body1)] font-medium text-white transition-opacity hover:opacity-90"
        >
          Invite
        </button>
      </div>

      <div className="overflow-hidden">
        <div className="grid grid-cols-[minmax(180px,1.25fr)_minmax(160px,1fr)_minmax(170px,0.95fr)_minmax(130px,0.75fr)_minmax(72px,0.5fr)_36px] items-center gap-x-4 border-b border-[var(--border-level-1)] px-1 pb-2.5 pt-0.5">
          {['Name', 'Email', 'Last Login'].map((label) => (
            <span
              key={label}
              className="text-[length:var(--font-size-body2)] font-semibold text-[var(--text-primary)]"
            >
              {label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 text-[length:var(--font-size-body2)] font-semibold text-[var(--text-primary)]">
            Role
            <Info className="h-3.5 w-3.5 text-[var(--text-tertiary)]" strokeWidth={2} />
          </span>
          <span className="text-[length:var(--font-size-body2)] font-semibold text-[var(--text-primary)]">
            Groups
          </span>
          <span className="sr-only">Actions</span>
        </div>

        {filtered.map((user) => (
          <div
            key={user.id}
            className="group grid grid-cols-[minmax(180px,1.25fr)_minmax(160px,1fr)_minmax(170px,0.95fr)_minmax(130px,0.75fr)_minmax(72px,0.5fr)_36px] items-center gap-x-4 border-b border-[var(--border-level-1)] px-1 py-3 transition-colors hover:bg-[var(--bg-hover-level-2)]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <UserTableAvatar name={user.name} avatar={user.avatar} />
              <span className="truncate text-[length:var(--font-size-body1)] font-medium text-[var(--text-primary)]">
                {user.name}
              </span>
            </div>
            <span className="truncate text-[length:var(--font-size-body2)] text-[var(--text-secondary)]">
              {user.email}
            </span>
            <span className="truncate text-[length:var(--font-size-body2)] text-[var(--text-secondary)]">
              {user.lastLogin}
            </span>
            <UserRoleSelect value={user.role} />
            <span className="truncate text-[length:var(--font-size-body2)] text-[var(--text-secondary)]">
              {user.groups}
            </span>
            <button
              type="button"
              aria-label={`Actions for ${user.name}`}
              className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[var(--bg-hover-level-2)]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
