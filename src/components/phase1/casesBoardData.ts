import type { Phase1CasePriority } from './types';

export type Phase1CaseBoardAssignee = {
  initials: string;
  color: string;
  avatarUrl?: string;
};

export type Phase1CaseBoardCard = {
  caseKey: string;
  displayId: string;
  title: string;
  priority: Phase1CasePriority;
  slaElapsed: string;
  slaRemaining: string;
  slaOverdue?: boolean;
  restricted?: boolean;
  workspace: string;
  team: string;
  tags?: string[];
  createdAt: string;
  assignees: Phase1CaseBoardAssignee[];
};

export type Phase1CaseBoardColumn = {
  id: string;
  label: string;
  count: number | '999+';
  cards: Phase1CaseBoardCard[];
};

const AV = {
  dw: { initials: 'D', color: '#2864FF' },
  sk: { initials: 'S', color: '#16A86C', avatarUrl: undefined },
  mk: { initials: 'M', color: '#E37400' },
  jl: { initials: 'J', color: '#9334E6' },
  rt: { initials: 'R', color: '#D93025' },
};

export const PHASE1_CASE_BOARD_COLUMNS: Phase1CaseBoardColumn[] = [
  {
    id: 'new',
    label: 'New',
    count: '999+',
    cards: [
      {
        caseKey: '4391',
        displayId: '#4857623',
        title: 'Custom tab tests',
        priority: 'critical',
        slaElapsed: '-18w 21h',
        slaRemaining: '1d',
        slaOverdue: true,
        workspace: 'torq-dev',
        team: 'content-team',
        createdAt: 'Feb 3 2026, 11:40 AM',
        assignees: [AV.dw, AV.sk],
      },
      {
        caseKey: '4380',
        displayId: '#4857601',
        title: 'supply_chain_attack',
        priority: 'high',
        slaElapsed: '-12w 4h',
        slaRemaining: '2d',
        slaOverdue: true,
        restricted: true,
        workspace: 'torq-dev',
        team: 'content-team',
        tags: ['supply_chain_attack', 'AppSec'],
        createdAt: 'Feb 3 2026, 10:22 AM',
        assignees: [AV.mk],
      },
      {
        caseKey: '4382',
        displayId: '#4857588',
        title: 'malware_detection',
        priority: 'low',
        slaElapsed: '-8w 2h',
        slaRemaining: '5d',
        workspace: 'torq-dev',
        team: 'content-team',
        createdAt: 'Feb 2 2026, 4:15 PM',
        assignees: [AV.jl, AV.rt],
      },
      {
        caseKey: '4350',
        displayId: '#4857544',
        title: 'Phishing attempt',
        priority: 'high',
        slaElapsed: '-6w 1d',
        slaRemaining: '20h',
        slaOverdue: true,
        workspace: 'torq-dev',
        team: 'soc-tier1',
        tags: ['Phishing', 'email'],
        createdAt: 'Feb 1 2026, 9:02 AM',
        assignees: [AV.sk],
      },
      {
        caseKey: '4412',
        displayId: '#4857499',
        title: 'Suspicious login from new region',
        priority: 'medium',
        slaElapsed: '-4w 6h',
        slaRemaining: '3d',
        workspace: 'torq-dev',
        team: 'soc-tier1',
        createdAt: 'Jan 28 2026, 2:30 PM',
        assignees: [AV.dw],
      },
      {
        caseKey: '4420',
        displayId: '#4857488',
        title: 'CVE-2026-1842 exploit attempt',
        priority: 'critical',
        slaElapsed: '-3w 2h',
        slaRemaining: '6h',
        slaOverdue: true,
        restricted: true,
        workspace: 'torq-dev',
        team: 'threat-hunt',
        tags: ['CVE'],
        createdAt: 'Jan 27 2026, 8:00 AM',
        assignees: [AV.rt, AV.mk],
      },
    ],
  },
  {
    id: 'substate-1',
    label: 'substate_1 / new_subst…',
    count: 3,
    cards: [
      {
        caseKey: '4350',
        displayId: '#4857201',
        title: 'Email quarantine review',
        priority: 'medium',
        slaElapsed: '2d 4h',
        slaRemaining: '18h',
        workspace: 'torq-dev',
        team: 'soc-tier1',
        createdAt: 'Jan 20 2026, 3:45 PM',
        assignees: [AV.sk],
      },
      {
        caseKey: '4382',
        displayId: '#4857190',
        title: 'Lateral movement',
        priority: 'high',
        slaElapsed: '1d 8h',
        slaRemaining: '1d 16h',
        restricted: true,
        workspace: 'torq-dev',
        team: 'threat-hunt',
        tags: ['Lateral movement', 'C2'],
        createdAt: 'Jan 19 2026, 8:15 AM',
        assignees: [AV.dw],
      },
      {
        caseKey: '4398',
        displayId: '#4857182',
        title: 'DLP policy violation',
        priority: 'low',
        slaElapsed: '5h',
        slaRemaining: '2d 19h',
        workspace: 'torq-dev',
        team: 'content-team',
        createdAt: 'Jan 19 2026, 6:00 AM',
        assignees: [AV.jl],
      },
    ],
  },
  {
    id: 'substate-2',
    label: 'substate_2 / Leen new …',
    count: 0,
    cards: [],
  },
  {
    id: 'substate-3',
    label: 'substate_3 / Capital',
    count: 1,
    cards: [
      {
        caseKey: '4380',
        displayId: '#4380',
        title: 'Ransomware alert',
        priority: 'high',
        slaElapsed: '-76w 1d',
        slaRemaining: '1d',
        slaOverdue: true,
        restricted: true,
        workspace: 'torq-dev',
        team: 'content-team',
        tags: ['Phishing', 'program'],
        createdAt: 'Dec 09 2024, 4:31 PM',
        assignees: [AV.dw],
      },
    ],
  },
  {
    id: 'substate-4',
    label: 'substate_4 / capital',
    count: 5,
    cards: [
      {
        caseKey: '4201',
        displayId: '#4201',
        title: 'Case bundle #4201',
        priority: 'low',
        slaElapsed: '—',
        slaRemaining: '—',
        workspace: 'torq-dev',
        team: 'legal-hold',
        tags: ['Export'],
        createdAt: 'May 12 2026, 2:00 PM',
        assignees: [AV.jl],
      },
      {
        caseKey: '4391',
        displayId: '#4391',
        title: 'Ransomware precursor',
        priority: 'critical',
        slaElapsed: '45m',
        slaRemaining: '3h 15m',
        restricted: true,
        workspace: 'torq-dev',
        team: 'ir-lead',
        tags: ['Ransomware', 'P1'],
        createdAt: 'May 19 2026, 6:30 AM',
        assignees: [AV.dw, AV.rt],
      },
      {
        caseKey: '4375',
        displayId: '#4375',
        title: 'Insider risk — bulk download',
        priority: 'medium',
        slaElapsed: '3d',
        slaRemaining: '4d',
        workspace: 'torq-dev',
        team: 'soc-tier1',
        createdAt: 'May 15 2026, 11:00 AM',
        assignees: [AV.mk],
      },
      {
        caseKey: '4362',
        displayId: '#4362',
        title: 'Firewall rule misconfiguration',
        priority: 'low',
        slaElapsed: '1w',
        slaRemaining: '—',
        workspace: 'torq-dev',
        team: 'content-team',
        createdAt: 'May 10 2026, 9:30 AM',
        assignees: [AV.sk],
      },
      {
        caseKey: '4344',
        displayId: '#4344',
        title: 'OAuth token anomaly',
        priority: 'high',
        slaElapsed: '2d 6h',
        slaRemaining: '12h',
        workspace: 'torq-dev',
        team: 'threat-hunt',
        createdAt: 'May 8 2026, 4:20 PM',
        assignees: [AV.dw, AV.jl],
      },
    ],
  },
];
