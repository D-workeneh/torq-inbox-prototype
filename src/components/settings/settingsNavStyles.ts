export const settingsNavSectionLabelClass = (isFirst = false) =>
  [
    'px-3 pb-1.5 text-[11px] font-medium leading-tight text-[var(--text-tertiary)]',
    isFirst ? 'pt-0' : 'pt-6',
  ].join(' ');

export function settingsNavItemClass(isActive: boolean, options?: { nested?: boolean }) {
  return [
    'mx-2 mb-0.5 flex w-[calc(100%-16px)] items-center gap-2.5 rounded-[var(--radius-md)] py-1.5 text-[length:var(--font-size-body1)] transition-colors',
    options?.nested ? 'pl-9 pr-3' : 'px-3',
    isActive
      ? 'bg-[var(--bg-active-level-1)] text-[var(--text-primary)] font-medium'
      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover-level-2)] hover:text-[var(--text-primary)]',
  ].join(' ');
}
