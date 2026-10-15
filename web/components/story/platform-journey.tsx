import {
  DatasetsIcon,
  UsersIcon,
  LayersIcon,
  ResultsIcon,
  SparklesIcon,
} from "@/components/icons";

const JOURNEY_STEPS = [
  {
    step: "01",
    title: "Prepare language data",
    description:
      "Assemble clean, authentic bilingual sentence pairs from communities and literature. Establish provenance and split data so test sentences never leak into training.",
    icon: DatasetsIcon,
  },
  {
    step: "02",
    title: "Check quality & involve native speakers",
    description:
      "Engage fluent native speakers to review real sample sentences for idiomatic naturalness, cultural nuance, and orthographic accuracy before any training begins.",
    icon: UsersIcon,
  },
  {
    step: "03",
    title: "Adapt the foundation model",
    description:
      "Train lightweight, parameter-efficient adapters on top of sovereign foundation models like N-ATLaS 8B, teaching the model the new language without degrading general intelligence.",
    icon: LayersIcon,
  },
  {
    step: "04",
    title: "Evaluate the results",
    description:
      "Test model outputs against held-out benchmark translations using standardized evaluation harnesses that strictly isolate prompt instructions from target answers.",
    icon: ResultsIcon,
  },
  {
    step: "05",
    title: "Improve, reuse, or publish",
    description:
      "Iterate on native speaker feedback and share verified adapters for community applications, local services, and developers as publishing capabilities roll out.",
    icon: SparklesIcon,
  },
];

export function PlatformJourney() {
  return (
    <section id="journey" className="py-20 sm:py-28 border-t border-border/60">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl space-y-2 mb-14">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-foreground">
            From community words to working AI
          </h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            The intended 5-step pathway from raw parallel sentences to verified
            language intelligence.
          </p>
        </div>

        {/* 5-Step Intuitive Sequence (Unboxed, natural cards) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {JOURNEY_STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="flex flex-col justify-between rounded-xl bg-surface/50 p-4 sm:p-5 border border-border/70 transition-colors hover:bg-surface hover:border-border"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-foreground-muted font-medium">
                      {item.step}
                    </span>
                    <Icon className="h-4 w-4 text-foreground-muted" />
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-foreground-secondary leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/40 text-[11px] text-foreground-muted">
                  Stage {idx + 1} of 5
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
