import ShowcaseNav from "./nav";

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">

      <section className="bg-brand px-md pt-xl pb-lg lg:px-lg">
        <p className="text-label tracking-label uppercase text-fg-on-brand/60 mb-sm font-semibold">
          Internal · Design System
        </p>
        <h1 className="text-display font-extrabold leading-display tracking-display text-fg-on-brand">
          Showcase
        </h1>
        <p className="text-body leading-body text-fg-on-brand/80 mt-md max-w-[60ch]">
          A living reference for design tokens, block components, and page compositions.
          Toggle dark / light mode in the header to compare both themes.
        </p>
      </section>

      <div className="flex">
        <aside className="hidden lg:block w-52 shrink-0 border-r border-fg/10">
          <ShowcaseNav />
        </aside>
        <div className="flex-1 min-w-0 divide-y divide-fg/10">
          {children}
        </div>
      </div>

    </div>
  );
}
