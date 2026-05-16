// Shared UI primitives for all showcase sub-pages.

export function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-lg pb-md border-b border-fg/10">
      <p className="text-label tracking-label uppercase text-fg-muted mb-xs font-semibold">
        {index}
      </p>
      <h2 className="text-headline font-bold leading-headline tracking-headline text-fg">
        {title}
      </h2>
    </div>
  );
}

export function Token({ name }: { name: string }) {
  return (
    <code className="inline-block font-mono text-label text-fg-muted bg-surface px-sm py-xs">
      {name}
    </code>
  );
}

export function Ground({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-label tracking-label uppercase text-fg-muted mb-md font-semibold">
        {label}
      </p>
      <div className={`p-lg flex flex-wrap gap-md items-center ${className}`}>
        {children}
      </div>
    </div>
  );
}
