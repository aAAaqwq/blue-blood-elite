type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section
      className="rounded-[var(--radius-xl)] p-6"
      style={{
        background: "var(--gradient-primary)",
        opacity: 0.95,
      }}
    >
      <p className="text-footnote font-semibold uppercase tracking-[0.24em] text-white/70">{eyebrow}</p>
      <h1 className="mt-3 text-title-2 text-white">{title}</h1>
      <p className="mt-3 text-subheadline text-white/80">{description}</p>
    </section>
  );
}
