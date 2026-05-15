import HeroBlock from "@/components/blocks/HeroBlock";

export default function Home() {
  return (
    <HeroBlock
      eyebrow="A new standard"
      headline="Momentum, by design."
      body="OptiTech gives teams the tools to ship with confidence, iterate without friction, and grow without compromise."
      primaryCta={{ label: "Get started", href: "https://optimizely.com" }}
      secondaryCta={{ label: "See how it works", href: "https://optimizely.com" }}
      visualSrc="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
      visualAlt="Earth's city lights viewed from orbit — a connected world moving at the speed of information"
    />
  );
}
