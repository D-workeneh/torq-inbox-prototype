'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  Briefcase,
  Bell,
  CircleCheck,
  ChevronDown,
  Cpu,
  Download,
  Key,
  Plus,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Upload,
  UserCog,
  Users,
  X as XIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { AiCreditUsageContent } from './AiCreditUsageContent';
import { BrandingLogoUploadSection } from './BrandingLogoUpload';
import { NotificationSettingsContent } from './NotificationSettingsContent';
import { ThemePreferencePicker, type ThemeMode } from './ThemePreferencePicker';
import { UsageSettingsContent } from './UsageSettingsContent';
import { UsersSettingsContent } from './UsersSettingsContent';
import {
  SettingsBlockTitle,
  SettingsCard,
  SettingsCardBody,
  SettingsCardRow,
} from './SettingsPrimitives';
import { settingsNavItemClass, settingsNavSectionLabelClass } from './settingsNavStyles';

export type TorqSettingsSection =
  | 'profile'
  | 'preferences'
  | 'notifications'
  | 'ai-credits'
  | 'users'
  | 'groups'
  | 'usage'
  | 'security-sso'
  | 'security-roles'
  | 'security-advanced'
  | 'security-ip'
  | 'log-export'
  | 'cases'
  | 'socrates-tools'
  | 'api-keys';

/** @deprecated Use preferences */
export type LegacyTorqSettingsSection = TorqSettingsSection | 'general' | 'theme';

export function normalizeTorqSettingsSection(
  section: LegacyTorqSettingsSection,
): TorqSettingsSection {
  if (section === 'general' || section === 'theme') return 'preferences';
  return section;
}

export type TorqSettingsOpenDetail =
  | LegacyTorqSettingsSection
  | { section: LegacyTorqSettingsSection; workspaceName?: string };

const CURRENT_USER = {
  name: 'David Workeneh',
  email: 'david@torq.io',
  role: 'Owner',
  photo:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=face&auto=format',
};

const ACCOUNT_NAV: {
  id: 'profile' | 'preferences' | 'notifications';
  label: string;
  showAvatar?: boolean;
  icon?: React.ElementType;
}[] = [
  { id: 'profile', label: CURRENT_USER.name, showAvatar: true },
  { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const SETTINGS_NAV: {
  id: TorqSettingsSection;
  label: string;
  icon: React.ElementType;
  sub?: { id: TorqSettingsSection; label: string }[];
}[] = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'groups', label: 'Groups', icon: UserCog },
  { id: 'usage', label: 'Usage', icon: BarChart3 },
  {
    id: 'security-sso',
    label: 'Security',
    icon: ShieldCheck,
    sub: [
      { id: 'security-sso', label: 'SSO' },
      { id: 'security-roles', label: 'Roles' },
      { id: 'security-advanced', label: 'Advanced' },
      { id: 'security-ip', label: 'Workspace IP access' },
    ],
  },
  { id: 'log-export', label: 'Log export', icon: Download },
  { id: 'cases', label: 'Cases', icon: Briefcase },
  { id: 'socrates-tools', label: 'Socrates tools', icon: Cpu },
  { id: 'api-keys', label: 'API Keys', icon: Key },
];

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 w-full">
      <div className="max-w-3xl">
        <h3 className="text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        {description && (
          <p className="text-[length:var(--font-size-body1)] text-[var(--text-secondary)] mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="w-full">{children}</div>
    </section>
  );
}

function SettingsDivider() {
  return <div className="border-t border-[var(--border-level-1)] my-7" />;
}

function SettingsInput({
  label,
  value,
  hint,
  type = 'text',
}: {
  label: string;
  value: string;
  hint?: string;
  type?: string;
}) {
  const [val, setVal] = useState(value);
  return (
    <div className="space-y-1">
      <label className="block text-[length:var(--font-size-body1)] font-medium text-[var(--text-primary)]">
        {label}
      </label>
      <input
        type={type}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-full h-9 rounded-[var(--radius-md)] border border-[var(--border-level-3)] bg-[var(--surface)] px-3 text-[length:var(--font-size-body1)] text-[var(--text-primary)] outline-none focus:border-[var(--neutral-12)] transition-[border-color] duration-[120ms]"
      />
      {hint && (
        <p className="text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">{hint}</p>
      )}
    </div>
  );
}

function SettingsSelect({
  label,
  value,
  options,
  hint,
}: {
  label: string;
  value: string;
  options: string[];
  hint?: string;
}) {
  const [val, setVal] = useState(value);
  return (
    <div className="space-y-1">
      <label className="block text-[length:var(--font-size-body1)] font-medium text-[var(--text-primary)]">
        {label}
      </label>
      <Select value={val} onChange={(e) => setVal(e.target.value)} className="w-full">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </Select>
      {hint && (
        <p className="text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">{hint}</p>
      )}
    </div>
  );
}

function SaveRow() {
  return (
    <div className="flex justify-end pt-4 pb-8">
      <Button theme="primary" size="medium">
        Save changes
      </Button>
    </div>
  );
}

function ProfileSettingsContent() {
  const [name, setName] = useState(CURRENT_USER.name);
  const [email, setEmail] = useState(CURRENT_USER.email);
  const [timezone, setTimezone] = useState('Asia/Jerusalem');
  const [language, setLanguage] = useState('English (US)');

  return (
    <div className="space-y-6 w-full max-w-xl">
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CURRENT_USER.photo}
          alt={CURRENT_USER.name}
          className="h-16 w-16 rounded-full object-cover border border-[var(--border-level-1)]"
        />
        <div>
          <p className="text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)]">
            {CURRENT_USER.name}
          </p>
          <p className="text-[length:var(--font-size-body1)] text-[var(--text-secondary)]">{CURRENT_USER.email}</p>
          <span
            className={`mt-2 inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-[length:var(--font-size-body2)] font-medium ${ROLE_BADGE[CURRENT_USER.role]}`}
          >
            {CURRENT_USER.role}
          </span>
        </div>
      </div>

      <SettingsCard>
        <SettingsCardBody divided={false}>
          <div className="divide-y divide-[var(--border-level-1)]">
            <div className="px-4 py-4 space-y-1">
              <label className="block text-[length:var(--font-size-body1)] font-medium text-[var(--text-primary)]">
                Full name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-9 rounded-[var(--radius-md)] border border-[var(--border-level-3)] bg-[var(--surface)] px-3 text-[length:var(--font-size-body1)] text-[var(--text-primary)] outline-none focus:border-[var(--neutral-12)]"
              />
            </div>
            <div className="px-4 py-4 space-y-1">
              <label className="block text-[length:var(--font-size-body1)] font-medium text-[var(--text-primary)]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 rounded-[var(--radius-md)] border border-[var(--border-level-3)] bg-[var(--surface)] px-3 text-[length:var(--font-size-body1)] text-[var(--text-primary)] outline-none focus:border-[var(--neutral-12)]"
              />
            </div>
            <SettingsCardRow
              title="Timezone"
              description="Used for quiet hours, schedules, and timestamps."
              control={
                <Select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="min-w-[160px]">
                  {['UTC', 'Asia/Jerusalem', 'Europe/London', 'America/New_York'].map((tz) => (
                    <option key={tz}>{tz}</option>
                  ))}
                </Select>
              }
            />
            <SettingsCardRow
              title="Language"
              description="Language for the Torq interface."
              control={
                <Select value={language} onChange={(e) => setLanguage(e.target.value)} className="min-w-[160px]">
                  {['English (US)', 'English (UK)', 'Hebrew'].map((lang) => (
                    <option key={lang}>{lang}</option>
                  ))}
                </Select>
              }
            />
          </div>
        </SettingsCardBody>
      </SettingsCard>

      <div className="flex items-center gap-3">
        <Button theme="secondary" size="small" leftIcon={<Upload className="h-3.5 w-3.5" />}>
          Change photo
        </Button>
      </div>

      <SaveRow />
    </div>
  );
}

function PreferencesSettingsContent() {
  const [theme, setTheme] = useState<ThemeMode>('system');

  return (
    <div className="space-y-8 w-full">
      <div>
        <SettingsBlockTitle
          title="Branding & appearance"
          description="Customize logos and how your workspace looks across Torq and Interact."
        />
        <SettingsCard>
          <SettingsCardBody>
            <BrandingLogoUploadSection />
            <SettingsCardRow
              title="Interface theme"
              description="Select or customize your interface color scheme."
              control={<ThemePreferencePicker value={theme} onChange={setTheme} />}
            />
          </SettingsCardBody>
        </SettingsCard>
      </div>

      <SaveRow />
    </div>
  );
}

const ROLE_BADGE: Record<string, string> = {
  Owner: 'bg-[var(--neutral-12)] text-white',
  Admin: 'bg-[var(--royal)]/10 text-[var(--royal)]',
  Member: 'bg-[var(--bg-static-3)] text-[var(--text-secondary)]',
  Viewer: 'bg-[var(--bg-static-3)] text-[var(--text-tertiary)]',
};

const MOCK_GROUPS = [
  { name: 'SOC Team', members: 12, desc: 'Tier-1 and Tier-2 analysts with case access.', color: '#2864FF' },
  { name: 'IR Response', members: 5, desc: 'Incident responders with full workflow rights.', color: '#EA231A' },
  { name: 'Threat Intel', members: 8, desc: 'Read-only access to cases and Socrates outputs.', color: '#9275FF' },
  { name: 'DevOps', members: 3, desc: 'Manages runners, integrations and API keys.', color: '#29CA88' },
];

function GroupsSettingsContent() {
  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <p className="text-[length:var(--font-size-body1)] text-[var(--text-secondary)]">
          {MOCK_GROUPS.length} groups
        </p>
        <Button theme="primary" size="small" leftIcon={<Plus className="h-3.5 w-3.5" />}>
          New group
        </Button>
      </div>
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-level-1)] divide-y divide-[var(--border-level-1)] overflow-hidden">
        {MOCK_GROUPS.map((g) => (
          <div
            key={g.name}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--bg-hover-level-2)] transition-colors"
          >
            <div
              className="h-8 w-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${g.color}22` }}
            >
              <Users className="h-4 w-4" style={{ color: g.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[length:var(--font-size-body1)] font-medium text-[var(--text-primary)]">
                {g.name}
              </p>
              <p className="text-[length:var(--font-size-body2)] text-[var(--text-secondary)] truncate">
                {g.desc}
              </p>
            </div>
            <span className="text-[length:var(--font-size-body2)] text-[var(--text-tertiary)] shrink-0">
              {g.members} members
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecuritySSOContent() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="space-y-0">
      <SettingsSection
        title="Single Sign-On (SSO)"
        description="Let members log in with your company's identity provider via SAML 2.0 or OIDC."
      >
        <SettingsCard>
          <SettingsCardBody>
            <SettingsCardRow
              title="Enable SSO"
              description="Members will be redirected to your IdP on login."
              control={<Toggle on={enabled} onChange={setEnabled} />}
            />
          </SettingsCardBody>
        </SettingsCard>
        <div className={`mt-4 space-y-4 ${!enabled ? 'opacity-40 pointer-events-none' : ''}`}>
          <SettingsSelect label="Protocol" value="SAML 2.0" options={['SAML 2.0', 'OIDC']} />
          <SettingsInput label="IdP Entity ID / Issuer" value="" hint="Provided by your identity provider." />
          <SettingsInput label="IdP SSO URL" value="" hint="Endpoint that receives auth requests." />
        </div>
      </SettingsSection>
      <SaveRow />
    </div>
  );
}

function SecurityRolesContent() {
  const roles = [
    { name: 'Owner', desc: 'Full access. Can delete workspace and manage billing.', count: 2 },
    { name: 'Admin', desc: 'Manage members, roles, integrations and all workspace data.', count: 2 },
    { name: 'Member', desc: 'Create and run workflows, view and edit cases.', count: 4 },
    { name: 'Viewer', desc: 'Read-only access to cases, workflows and dashboards.', count: 2 },
  ];
  return (
    <div className="space-y-4 w-full">
      <p className="text-[length:var(--font-size-body1)] text-[var(--text-secondary)]">
        Roles control what members can see and do across the workspace.
      </p>
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-level-1)] divide-y divide-[var(--border-level-1)] overflow-hidden">
        {roles.map((r) => (
          <div
            key={r.name}
            className="flex items-start gap-3 px-4 py-4 hover:bg-[var(--bg-hover-level-2)] transition-colors"
          >
            <span
              className={`mt-0.5 inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-[length:var(--font-size-body2)] font-medium shrink-0 ${ROLE_BADGE[r.name]}`}
            >
              {r.name}
            </span>
            <p className="flex-1 text-[length:var(--font-size-body1)] text-[var(--text-secondary)]">
              {r.desc}
            </p>
            <span className="text-[length:var(--font-size-body2)] text-[var(--text-tertiary)] shrink-0">
              {r.count} members
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityAdvancedContent() {
  const [inactivityTimeout, setInactivityTimeout] = useState('30 minutes');
  const [sessionExpiration, setSessionExpiration] = useState('8 hours');
  return (
    <div className="space-y-0">
      <SettingsSection
        title="Session controls"
        description="Define how long members stay signed in and when inactive sessions end."
      >
        <SettingsCard>
          <SettingsCardBody divided={false}>
            <div className="divide-y divide-[var(--border-level-1)]">
              <SettingsCardRow
                title="Inactivity timeout"
                description="Sign out members after a period without activity."
                control={
                  <Select
                    value={inactivityTimeout}
                    onChange={(e) => setInactivityTimeout(e.target.value)}
                    className="min-w-[140px]"
                  >
                    {['15 minutes', '30 minutes', '1 hour', '4 hours'].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </Select>
                }
              />
              <SettingsCardRow
                title="Session expiration"
                description="Maximum session length regardless of activity."
                control={
                  <Select
                    value={sessionExpiration}
                    onChange={(e) => setSessionExpiration(e.target.value)}
                    className="min-w-[140px]"
                  >
                    {['4 hours', '8 hours', '24 hours', '7 days'].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </Select>
                }
              />
            </div>
          </SettingsCardBody>
        </SettingsCard>
      </SettingsSection>
      <SaveRow />
    </div>
  );
}

function SecurityIPContent() {
  const [entries, setEntries] = useState(['10.100.0.0/16', '195.88.2.0/24']);
  const [input, setInput] = useState('');
  return (
    <div className="space-y-0">
      <SettingsSection
        title="Workspace IP access"
        description="Restrict workspace access to specific IP ranges. Connections from unlisted IPs are blocked."
      >
        <div className="space-y-2">
          {entries.map((e) => (
            <div
              key={e}
              className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border-level-1)] bg-[var(--bg-static-2)]"
            >
              <code className="text-[length:var(--font-size-body1)] text-[var(--text-primary)] font-mono">
                {e}
              </code>
              <button
                onClick={() => setEntries((prev) => prev.filter((x) => x !== e))}
                className="text-[var(--text-tertiary)] hover:text-[var(--red)] transition-colors"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 203.0.113.0/24"
              className="flex-1 rounded-[var(--radius-md)] border border-[var(--border-level-2)] px-3 py-2 text-[length:var(--font-size-body1)] bg-[var(--surface)] outline-none focus:border-[var(--neutral-12)]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && input.trim()) {
                  setEntries((p) => [...p, input.trim()]);
                  setInput('');
                }
              }}
            />
            <Button
              theme="secondary"
              size="small"
              onClick={() => {
                if (input.trim()) {
                  setEntries((p) => [...p, input.trim()]);
                  setInput('');
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </SettingsSection>
      <SaveRow />
    </div>
  );
}

function LogExportContent() {
  const [dest, setDest] = useState('S3');
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="space-y-0">
      <SettingsSection
        title="Log export"
        description="Stream audit logs and workflow execution logs to your SIEM or storage."
      >
        <SettingsCard>
          <SettingsCardBody>
            <SettingsCardRow
              title="Enable log export"
              description="Forward logs automatically to the configured destination."
              control={<Toggle on={enabled} onChange={setEnabled} />}
            />
          </SettingsCardBody>
        </SettingsCard>
        <div className={`mt-4 space-y-4 ${!enabled ? 'opacity-40 pointer-events-none' : ''}`}>
          <SettingsSelect
            label="Destination"
            value={dest}
            options={['S3', 'Google Cloud Storage', 'Azure Blob Storage', 'Splunk HEC', 'Elastic', 'Datadog']}
          />
          {dest === 'S3' && (
            <>
              <SettingsInput label="S3 bucket name" value="torq-logs-prod" />
              <SettingsInput label="AWS region" value="us-east-1" />
            </>
          )}
        </div>
      </SettingsSection>
      <SaveRow />
    </div>
  );
}

function CasesSettingsContent() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [publicNotes, setPublicNotes] = useState(true);
  const [caseReview, setCaseReview] = useState(true);
  const [reviewerAssignment, setReviewerAssignment] = useState(true);
  const [conclusionsWithNotes, setConclusionsWithNotes] = useState(true);
  const [approvedEnabled, setApprovedEnabled] = useState(true);
  const [rejectedEnabled, setRejectedEnabled] = useState(true);

  const listSections = [
    { title: 'Categories', desc: 'Organize cases by incident type and team ownership.', count: 8 },
    { title: 'Resolution reasons', desc: 'Standardize how cases are closed.', count: 12 },
    { title: 'Custom tabs', desc: 'Add workspace-specific fields to the case view.', count: 3 },
    { title: 'States', desc: 'Define the lifecycle stages cases move through.', count: 6 },
  ];

  return (
    <div className="space-y-8 w-full">
      <SettingsSection title="Case operations" description="Defaults and refresh behavior for SOC case management.">
        <SettingsCard>
          <SettingsCardBody>
            <SettingsCardRow
              title="Auto refresh"
              description="Keep the case board updated with new activity without manual reload."
              control={<Toggle on={autoRefresh} onChange={setAutoRefresh} />}
            />
            <SettingsCardRow
              title="Public notes / comments"
              description="Allow external collaborators to view selected case notes."
              control={<Toggle on={publicNotes} onChange={setPublicNotes} />}
            />
          </SettingsCardBody>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Case configuration" description="Manage structured metadata used across investigations.">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-level-1)] divide-y divide-[var(--border-level-1)] overflow-hidden">
          {listSections.map((s) => (
            <div
              key={s.title}
              className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-[var(--bg-hover-level-2)] transition-colors"
            >
              <div>
                <p className="text-[length:var(--font-size-body1)] font-medium text-[var(--text-primary)]">
                  {s.title}
                </p>
                <p className="text-[length:var(--font-size-body2)] text-[var(--text-secondary)]">{s.desc}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">
                  {s.count} items
                </span>
                <Button theme="third" size="small">
                  Manage
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Case review"
        description="Enable reviewer assignment and conclusions with supporting notes for quality assurance."
      >
        <SettingsCard>
          <SettingsCardBody>
            <SettingsCardRow
              title="Case review"
              description="Enable or disable the Case review feature for this workspace."
              control={<Toggle on={caseReview} onChange={setCaseReview} />}
            />
            <SettingsCardRow
              title="Reviewer"
              description="Allow assigning a dedicated reviewer before a case is closed."
              control={<Toggle on={reviewerAssignment} onChange={setReviewerAssignment} disabled={!caseReview} />}
            />
            <SettingsCardRow
              title="Review conclusions with supporting notes"
              description="Require notes when submitting a review conclusion."
              control={<Toggle on={conclusionsWithNotes} onChange={setConclusionsWithNotes} disabled={!caseReview} />}
            />
          </SettingsCardBody>
        </SettingsCard>

        <div className={`mt-4 ${!caseReview ? 'opacity-40 pointer-events-none' : ''}`}>
          <SettingsBlockTitle title="Review conclusions" description="Available outcomes reviewers can select." />
          <SettingsCard className="mt-2">
            <SettingsCardBody>
              <SettingsCardRow
                title="Approved"
                description="Case handling and documentation meet workspace standards."
                control={<Toggle on={approvedEnabled} onChange={setApprovedEnabled} />}
              />
              <SettingsCardRow
                title="Rejected"
                description="Case requires additional work before it can be closed."
                control={<Toggle on={rejectedEnabled} onChange={setRejectedEnabled} />}
              />
            </SettingsCardBody>
          </SettingsCard>
        </div>
      </SettingsSection>

      <SaveRow />
    </div>
  );
}

function SocratesToolsContent() {
  type ToolType = 'Step' | 'Action' | 'Trigger';
  type ToolStatus = 'Valid' | 'Draft';
  type ToolVendor = 'Torq' | 'Notion' | 'Slack';
  type ToolRow = {
    id: string;
    name: string;
    desc: string;
    type: ToolType;
    vendor: ToolVendor;
    status: ToolStatus;
    createdAt: string;
  };

  const [searchValue, setSearchValue] = useState('');
  const [sortBy, setSortBy] = useState('created-desc');
  const [toolType, setToolType] = useState<'All' | ToolType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ToolStatus>('All');
  const [vendorFilter, setVendorFilter] = useState<'All' | ToolVendor>('All');

  const tools: ToolRow[] = [
    { id: 'bughunt-deep-v3', name: 'BugHunt-Deep-V3', desc: 'Sends an email using Toro.', type: 'Step', vendor: 'Torq', status: 'Valid', createdAt: 'Apr 16 2026, 2:16 PM' },
    { id: 'notion-get-db', name: 'Get Database', desc: 'Returns information about the database with the given ID.', type: 'Step', vendor: 'Notion', status: 'Valid', createdAt: 'Apr 16 2026, 12:39 PM' },
    { id: 'slack-send-soc', name: 'Send Message to a SOC analyst', desc: 'Send a message to a Slack channel or user.', type: 'Step', vendor: 'Slack', status: 'Valid', createdAt: 'Apr 16 2026, 11:44 AM' },
    { id: 'list-installations', name: 'List Installations, max 60', desc: 'Returns a list of installations for the authenticated user.', type: 'Step', vendor: 'Torq', status: 'Valid', createdAt: 'Apr 16 2026, 11:43 AM' },
    { id: 'search-by-title', name: 'Search by Title', desc: 'Searches by title name all parent or child pages and databases.', type: 'Step', vendor: 'Notion', status: 'Valid', createdAt: 'Apr 16 2026, 11:42 AM' },
    { id: 'security-config', name: 'oleg Get Security Config', desc: 'Retrieve current security configuration settings for a workspace.', type: 'Step', vendor: 'Torq', status: 'Valid', createdAt: 'Apr 16 2026, 11:42 AM' },
    { id: 'case-context', name: 'Get case context', desc: 'Get case context.', type: 'Step', vendor: 'Torq', status: 'Valid', createdAt: 'Apr 16 2026, 11:40 AM' },
    { id: 'ask-question', name: 'Oleg Ask a Question', desc: "Send an interactive prompt and continue after the user's response.", type: 'Step', vendor: 'Slack', status: 'Draft', createdAt: 'Apr 16 2026, 11:34 AM' },
    { id: 'add-note', name: 'Adds a new note to a case', desc: 'Creates a note in a case.', type: 'Action', vendor: 'Torq', status: 'Valid', createdAt: 'Apr 16 2026, 11:32 AM' },
    { id: 'test-bugs', name: 'Test for bugs', desc: 'This tool tests for bugs during the Torqing session.', type: 'Step', vendor: 'Torq', status: 'Draft', createdAt: 'Apr 16 2026, 11:30 AM' },
    { id: 'list-workflows', name: 'List Workflows', desc: 'Returns a list of all workflows in the workspace.', type: 'Step', vendor: 'Torq', status: 'Valid', createdAt: 'Apr 16 2026, 11:29 AM' },
    { id: 'send-snippet', name: 'Send Snippet yulia', desc: 'Send a snippet, a file, to a Slack channel or user.', type: 'Step', vendor: 'Slack', status: 'Valid', createdAt: 'Apr 16 2026, 11:28 AM' },
  ];

  const filtered = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    return tools
      .filter((t) => (toolType === 'All' ? true : t.type === toolType))
      .filter((t) => (statusFilter === 'All' ? true : t.status === statusFilter))
      .filter((t) => (vendorFilter === 'All' ? true : t.vendor === vendorFilter))
      .filter((t) => (q ? t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) : true))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return a.createdAt < b.createdAt ? 1 : -1;
      });
  }, [searchValue, sortBy, statusFilter, toolType, vendorFilter]);

  const VENDOR_BADGE: Record<ToolVendor, string> = {
    Torq: 'bg-[var(--royal)]/10 text-[var(--royal)]',
    Notion: 'bg-[var(--bg-static-3)] text-[var(--text-secondary)]',
    Slack: 'bg-[#EAE6FF] text-[#6A44FF]',
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search"
            className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--border-level-2)] bg-[var(--surface)] pl-9 pr-3 text-[length:var(--font-size-body1)] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--neutral-12)]"
          />
        </div>

        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} size="small" className="min-w-[148px]">
          <option value="created-desc">Sort by: Created at</option>
          <option value="name">Sort by: Name</option>
        </Select>
        <Select value={toolType} onChange={(e) => setToolType(e.target.value as 'All' | ToolType)} size="small" className="min-w-[108px]">
          <option value="All">Tool type: All</option>
          <option value="Step">Tool type: Step</option>
          <option value="Action">Tool type: Action</option>
          <option value="Trigger">Tool type: Trigger</option>
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'All' | ToolStatus)} size="small" className="min-w-[100px]">
          <option value="All">Status: All</option>
          <option value="Valid">Status: Valid</option>
          <option value="Draft">Status: Draft</option>
        </Select>
        <Select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value as 'All' | ToolVendor)} size="small" className="min-w-[96px]">
          <option value="All">Vendor</option>
          <option value="Torq">Torq</option>
          <option value="Notion">Notion</option>
          <option value="Slack">Slack</option>
        </Select>

        <Button theme="primary" size="small" leftIcon={<Plus className="h-3.5 w-3.5" />}>
          Create Tool
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((tool) => (
          <article
            key={tool.id}
            className="rounded-[var(--radius-lg)] border border-[var(--border-level-1)] bg-[var(--surface)] p-4 transition-colors hover:bg-[var(--bg-hover-level-2)]"
          >
            <div className="flex items-start gap-3">
              <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-[var(--radius-sm)] px-1.5 text-[10px] font-semibold ${VENDOR_BADGE[tool.vendor]}`}>
                {tool.vendor[0]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate text-[length:var(--font-size-body1)] font-semibold text-[var(--text-primary)]">
                    {tool.name}
                  </h3>
                  <CircleCheck className="h-4 w-4 shrink-0 text-[#29CA88]" strokeWidth={2} />
                </div>
                <p className="mt-1 line-clamp-2 text-[length:var(--font-size-body2)] text-[var(--text-secondary)]">
                  {tool.desc}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border-level-1)] pt-3">
              <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--bg-static-3)] px-2 py-0.5 text-[length:var(--font-size-body2)] text-[var(--text-secondary)]">
                {tool.type}
              </span>
              <span className="text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">
                Created: {tool.createdAt}
              </span>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-level-1)] bg-[var(--surface)] px-4 py-8 text-center text-[length:var(--font-size-body1)] text-[var(--text-tertiary)]">
          No tools match your filters.
        </div>
      )}
    </div>
  );
}

const MOCK_API_KEYS = [
  { name: 'SIEM integration', prefix: 'trq_live_••••8f2a', created: 'Mar 12, 2026', lastUsed: '2 hours ago' },
  { name: 'Terraform automation', prefix: 'trq_live_••••91bc', created: 'Feb 3, 2026', lastUsed: 'Yesterday' },
];

function ApiKeysSettingsContent() {
  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[length:var(--font-size-body1)] text-[var(--text-secondary)]">
          Manage programmatic access for integrations and automation.
        </p>
        <Button theme="primary" size="small" leftIcon={<Plus className="h-3.5 w-3.5" />}>
          Create API key
        </Button>
      </div>
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-level-1)] overflow-hidden">
        <div className="grid grid-cols-[1fr_160px_120px_80px] bg-[var(--bg-static-2)] px-4 py-2.5 border-b border-[var(--border-level-1)]">
          {['Name', 'Key', 'Last used', ''].map((h) => (
            <span
              key={h}
              className="text-[length:var(--font-size-body2)] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide"
            >
              {h}
            </span>
          ))}
        </div>
        {MOCK_API_KEYS.map((k, i) => (
          <div
            key={k.name}
            className={`grid grid-cols-[1fr_160px_120px_80px] px-4 py-3 items-center hover:bg-[var(--bg-hover-level-2)] ${
              i < MOCK_API_KEYS.length - 1 ? 'border-b border-[var(--border-level-1)]' : ''
            }`}
          >
            <div>
              <p className="text-[length:var(--font-size-body1)] font-medium text-[var(--text-primary)]">{k.name}</p>
              <p className="text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">Created {k.created}</p>
            </div>
            <code className="text-[length:var(--font-size-body2)] text-[var(--text-secondary)] font-mono">{k.prefix}</code>
            <span className="text-[length:var(--font-size-body2)] text-[var(--text-tertiary)]">{k.lastUsed}</span>
            <Button theme="third" size="small">
              Revoke
            </Button>
          </div>
        ))}
      </div>
      <SaveRow />
    </div>
  );
}

export interface TorqSettingsPageProps {
  initialSection?: LegacyTorqSettingsSection;
  initialAiCreditsWorkspace?: string;
  currentWorkspaceId?: string;
  onSectionChange?: (s: TorqSettingsSection) => void;
}

export function TorqSettingsPage({
  initialSection = 'preferences',
  initialAiCreditsWorkspace,
  currentWorkspaceId = 'torq-dev',
  onSectionChange,
}: TorqSettingsPageProps) {
  const [active, setActive] = useState<TorqSettingsSection>(() =>
    normalizeTorqSettingsSection(initialSection),
  );
  const [secOpen, setSecOpen] = useState(active.startsWith('security'));
  const [aiCreditsWorkspace, setAiCreditsWorkspace] = useState(
    initialAiCreditsWorkspace ?? 'torq-dev',
  );
  const [aiCreditsReturnTo, setAiCreditsReturnTo] = useState<TorqSettingsSection>('usage');
  const contentScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const normalized = normalizeTorqSettingsSection(initialSection);
    setActive(normalized);
    if (normalized === 'ai-credits') setAiCreditsReturnTo('usage');
  }, [initialSection]);

  useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0, left: 0 });
  }, [active, initialSection]);

  useEffect(() => {
    if (initialAiCreditsWorkspace) setAiCreditsWorkspace(initialAiCreditsWorkspace);
  }, [initialAiCreditsWorkspace]);

  function goTo(s: TorqSettingsSection) {
    setActive(s);
    onSectionChange?.(s);
  }

  function openAiCredits(workspaceName: string) {
    setAiCreditsReturnTo(active === 'preferences' ? 'preferences' : 'usage');
    setAiCreditsWorkspace(workspaceName);
    goTo('ai-credits');
  }

  function renderContent() {
    switch (active) {
      case 'profile':
        return <ProfileSettingsContent />;
      case 'preferences':
        return <PreferencesSettingsContent />;
      case 'notifications':
        return <NotificationSettingsContent />;
      case 'ai-credits':
        return (
          <AiCreditUsageContent
            workspaceName={aiCreditsWorkspace}
            workspaceId={aiCreditsWorkspace}
            onBack={() => goTo(aiCreditsReturnTo)}
          />
        );
      case 'users':
        return <UsersSettingsContent />;
      case 'groups':
        return <GroupsSettingsContent />;
      case 'usage':
        return (
          <UsageSettingsContent
            workspaceId={currentWorkspaceId}
            onOpenAiCredits={openAiCredits}
          />
        );
      case 'security-sso':
        return <SecuritySSOContent />;
      case 'security-roles':
        return <SecurityRolesContent />;
      case 'security-advanced':
        return <SecurityAdvancedContent />;
      case 'security-ip':
        return <SecurityIPContent />;
      case 'log-export':
        return <LogExportContent />;
      case 'cases':
        return <CasesSettingsContent />;
      case 'socrates-tools':
        return <SocratesToolsContent />;
      case 'api-keys':
        return <ApiKeysSettingsContent />;
      default:
        return null;
    }
  }

  const sectionTitle = useMemo(() => {
    if (active === 'ai-credits') return aiCreditsReturnTo === 'usage' ? 'Usage' : 'Preferences';
    if (active === 'profile') return 'Profile';
    if (active.startsWith('security')) return 'Security';
    if (active === 'preferences') return 'Preferences';
    if (active === 'notifications') return 'Notifications';
    return SETTINGS_NAV.find((n) => n.id === active)?.label ?? '';
  }, [active]);

  const sectionDescription = useMemo(() => {
    switch (active) {
      case 'profile':
        return 'Your personal account details and regional preferences.';
      case 'preferences':
        return 'Workspace branding, theme, and logos across Torq and Interact.';
      case 'notifications':
        return 'Decide when and how you want to be notified.';
      case 'usage':
        return 'Resource usage and ownership for the workspace you are working in right now.';
      case 'users':
        return 'Invite analysts and managers, assign roles, and audit access.';
      case 'groups':
        return 'Organize teams for case routing, workflows, and permissions.';
      case 'socrates-tools':
        return 'Configure capabilities available to Socrates during investigations.';
      case 'cases':
        return 'Tune case lifecycle, review workflows, and structured metadata for SOC operations.';
      case 'api-keys':
        return 'Create and rotate keys used by integrations and automation.';
      default:
        return undefined;
    }
  }, [active]);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 bg-[var(--surface)] font-[family-name:var(--font-family)]">
      <nav className="flex w-56 shrink-0 flex-col overflow-y-auto border-r border-[var(--border-level-1)] bg-[var(--bg-static-2)] py-4">
        <p className={settingsNavSectionLabelClass(true)}>Account</p>
        {ACCOUNT_NAV.map((item) => {
          const isActive =
            active === item.id ||
            (item.id === 'preferences' && active === 'ai-credits' && aiCreditsReturnTo === 'preferences');
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(item.id)}
              className={settingsNavItemClass(isActive)}
            >
              {item.showAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={CURRENT_USER.photo}
                  alt=""
                  className="h-5 w-5 rounded-full object-cover shrink-0 border border-[var(--border-level-1)]"
                />
              ) : item.icon ? (
                <item.icon className="h-4 w-4 shrink-0" />
              ) : (
                <SettingsIcon className="h-4 w-4 shrink-0" />
              )}
              <span className="flex-1 truncate text-left">{item.label}</span>
            </button>
          );
        })}

        <p className={settingsNavSectionLabelClass()}>Workspace settings</p>
        {SETTINGS_NAV.map((nav) => {
          const Icon = nav.icon;
          const isSecGrp = nav.id === 'security-sso';
          const isActive = nav.sub
            ? nav.sub.some((s) => s.id === active)
            : active === nav.id || (nav.id === 'usage' && active === 'ai-credits');

          return (
            <div key={nav.id}>
              <button
                type="button"
                onClick={() => {
                  if (isSecGrp) {
                    setSecOpen((o) => !o);
                    if (!secOpen) goTo('security-sso');
                  } else {
                    goTo(nav.id);
                  }
                }}
                className={settingsNavItemClass(Boolean(isActive && !isSecGrp))}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{nav.label}</span>
                {isSecGrp && (
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 transition-transform ${secOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </button>
              {isSecGrp && secOpen && nav.sub && (
                <div className="pb-0.5">
                  {nav.sub.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => goTo(sub.id)}
                      className={settingsNavItemClass(active === sub.id, { nested: true })}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 px-10 pt-8 pb-0 w-full max-w-[920px]">
          <h2 className="text-[length:var(--font-size-h2)] font-semibold text-[var(--text-primary)] mb-1">
            {sectionTitle}
          </h2>
          {sectionDescription && (
            <p className="text-[length:var(--font-size-body1)] text-[var(--text-secondary)] mb-6 max-w-2xl">
              {sectionDescription}
            </p>
          )}
          <div className={`border-b border-[var(--border-level-1)] ${sectionDescription ? 'mb-0' : 'mt-2'}`} />
        </div>
        <div
          ref={contentScrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <div className="px-10 pt-8 pb-12 w-full max-w-[920px] [&>*]:w-full">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TorqSettingsModal({
  open,
  onClose,
  initialSection = 'preferences',
  initialAiCreditsWorkspace,
  currentWorkspaceId,
}: {
  open: boolean;
  onClose: () => void;
  initialSection?: LegacyTorqSettingsSection;
  initialAiCreditsWorkspace?: string;
  currentWorkspaceId?: string;
}) {
  const [section, setSection] = useState<TorqSettingsSection>(() =>
    normalizeTorqSettingsSection(initialSection),
  );

  useEffect(() => {
    if (open) setSection(normalizeTorqSettingsSection(initialSection));
  }, [open, initialSection]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex min-h-0 w-full overflow-hidden rounded-[var(--radius-xl)] bg-[var(--surface)] shadow-2xl"
        style={{ width: '92vw', maxWidth: 1320, height: '88vh' }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close settings"
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--text-tertiary)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-primary)] transition-colors"
        >
          <XIcon className="h-4 w-4" />
        </button>
        <TorqSettingsPage
          initialSection={section}
          initialAiCreditsWorkspace={initialAiCreditsWorkspace}
          currentWorkspaceId={currentWorkspaceId}
          onSectionChange={setSection}
        />
      </div>
    </div>
  );
}
