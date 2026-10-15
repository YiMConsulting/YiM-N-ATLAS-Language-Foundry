import Link from "next/link";
import {
  DatasetsIcon,
  EvidenceIcon,
  ReviewIcon,
  PlaygroundIcon,
  ArrowRightIcon,
} from "@/components/icons";

type ContextualActionsProps = {
  inferenceOnline: boolean;
};

const WORKFLOW_ACTIONS = [
  {
    title: "Datasets & Splits",
    description:
      "Inspect the sealed Tiv corpus (184,099 pairs) and verify deterministic input-grouped partitions with zero cross-split leakage.",
    href: "/datasets",
    icon: DatasetsIcon,
  },
  {
    title: "Evidence Dossier",
    description:
      "Examine empirical native-speaker audit records (51 test pairs, 4.76/5.0 accuracy, 5.0 naturalness) and evaluation manifests.",
    href: "/evidence",
    icon: EvidenceIcon,
  },
  {
    title: "Interactive Playground",
    description:
      "Test generation prompts and observe translation outputs against the N-ATLaS base and adapted pilot configurations.",
    href: "/playground",
    icon: PlaygroundIcon,
  },
  {
    title: "Human Review",
    description:
      "Explore the native-speaker annotation interface, review sampled sentence pairs, and inspect linguistic judgments.",
    href: "/review",
    icon: ReviewIcon,
  },
];

export function ContextualActions({ inferenceOnline }: ContextualActionsProps) {
  return (
    <section className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            Primary Workflows
          </h2>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Active workspaces and tools ready to execute.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {WORKFLOW_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col justify-between rounded-xl border border-border/70 bg-surface/40 p-4 transition-all duration-150 hover:bg-surface hover:border-border hover:shadow-subtle"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-semibold text-sm text-foreground group-hover:text-accent transition-colors">
                    <Icon className="h-4 w-4 text-foreground-muted group-hover:text-accent transition-colors shrink-0" />
                    <span>{action.title}</span>
                  </div>
                  <ArrowRightIcon className="h-3.5 w-3.5 text-foreground-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-foreground-secondary leading-relaxed">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
