import type { ComponentType } from "react";
import type { IconProps } from "@/components/icons";
import {
  LanguagesIcon,
  DatasetsIcon,
  ExperimentsIcon,
  ResultsIcon,
  PlaygroundIcon,
  ReviewIcon,
  EvidenceIcon,
} from "@/components/icons";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<IconProps>;
};

export const primaryNav: NavItem[] = [
  { label: "Languages", href: "/languages", icon: LanguagesIcon },
  { label: "Datasets", href: "/datasets", icon: DatasetsIcon },
  { label: "Experiments", href: "/experiments", icon: ExperimentsIcon },
  { label: "Results", href: "/results", icon: ResultsIcon },
  { label: "Playground", href: "/playground", icon: PlaygroundIcon },
];

export const reviewNav: NavItem[] = [
  { label: "Human Review", href: "/review", icon: ReviewIcon },
  { label: "Evidence Screen", href: "/evidence", icon: EvidenceIcon },
];
