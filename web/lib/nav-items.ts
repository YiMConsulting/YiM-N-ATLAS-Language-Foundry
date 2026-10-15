import type { ComponentType } from "react";
import type { IconProps } from "@/components/icons";
import {
  HomeIcon,
  LanguagesIcon,
  DatasetsIcon,
  ExperimentsIcon,
  ResultsIcon,
  PlaygroundIcon,
  ReviewIcon,
  EvidenceIcon,
  RoadmapIcon,
  SparklesIcon,
} from "@/components/icons";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<IconProps>;
  badge?: string;
};

export const coreNav: NavItem[] = [
  { label: "Product Story", href: "/", icon: SparklesIcon },
  { label: "Workspace", href: "/workspace", icon: HomeIcon },
  { label: "Roadmap", href: "/roadmap", icon: RoadmapIcon },
  { label: "Languages", href: "/languages", icon: LanguagesIcon },
  { label: "Datasets", href: "/datasets", icon: DatasetsIcon },
];

export const mlNav: NavItem[] = [
  { label: "Playground", href: "/playground", icon: PlaygroundIcon },
  { label: "Experiments", href: "/experiments", icon: ExperimentsIcon },
  { label: "Results", href: "/results", icon: ResultsIcon },
];

export const verificationNav: NavItem[] = [
  { label: "Human Review", href: "/review", icon: ReviewIcon },
  { label: "Evidence Dossier", href: "/evidence", icon: EvidenceIcon },
];
