import HeroBlock from "@/components/blocks/HeroBlock";
import PrimaryTextBlock from "@/components/blocks/PrimaryTextBlock";

export default function Home() {
  return (
    <>
      <HeroBlock
        eyebrow="A new standard"
        headline="Momentum, by design."
        body="OptiTech gives teams the tools to ship with confidence, iterate without friction, and grow without compromise."
        primaryCta={{ label: "Get started", href: "https://optimizely.com" }}
        secondaryCta={{ label: "See how it works", href: "https://optimizely.com" }}
        visualSrc="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
        visualAlt="Earth's city lights viewed from orbit — a connected world moving at the speed of information"
        styleOptions={{ layout: "imageRight", color: "brand", animation: "none" }}
      />

      {/* Left-aligned display — no gradient */}
      <PrimaryTextBlock
        eyebrow="The platform"
        headline="Speed that compounds."
        styleOptions={{ size: "display", color: "canvas", alignment: "left" }}
      />

      {/* Centered display — brand gradient */}
      <PrimaryTextBlock
        eyebrow="Why teams choose OptiTech"
        headline="Built for the rate of change."
        styleOptions={{ size: "display", color: "surface", alignment: "center", gradient: "brand" }}
      />

      {/* Headline scale — teal background */}
      <PrimaryTextBlock
        eyebrow="Integrations"
        headline="Connect everything you already use."
        styleOptions={{ size: "headline", color: "brand", alignment: "left" }}
      />

      {/* Headline scale — centered, no eyebrow */}
      <PrimaryTextBlock
        headline="Decisions should move at the speed of data."
        styleOptions={{ size: "headline", color: "canvas", alignment: "center" }}
      />
    </>
  );
}
