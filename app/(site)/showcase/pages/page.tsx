import type { Metadata } from "next";
import { SectionLabel } from "../components";

export const metadata: Metadata = {
  title: "Page Types — Design System — OptiTech",
};

export default function ShowcasePagesPage() {
  return (
    <section className="px-md py-xl lg:px-lg">
      <SectionLabel index="03 · Page Types" title="Coming Soon" />
      <p className="text-body leading-body text-fg-muted max-w-[65ch]">
        Full-page compositions showing how block components combine to create
        coherent layouts. Landing pages, blog listings, feature pages, and
        campaign surfaces are planned.
      </p>
    </section>
  );
}
