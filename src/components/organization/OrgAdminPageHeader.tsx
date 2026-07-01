export function OrgAdminPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="shrink-0 bg-[var(--color-surface-primary)] px-8 py-6">
      <h1 className="text-[length:var(--font-size-xl)] font-semibold tracking-tight text-[var(--color-text-primary)]">
        {title}
      </h1>
      <p className="mt-2 max-w-3xl text-[length:var(--font-size-body1)] leading-relaxed text-[var(--color-text-secondary)]">
        {description}
      </p>
    </div>
  );
}
