import type { Metadata } from "next";
import { RoadmapView } from "@/components/roadmap/roadmap-view";

export const metadata: Metadata = {
  title: "Product Roadmap | N-ATLaS Language Foundry",
  description:
    "Capability inventory, verified implementation scope, manual workflows, and future platform vision.",
};

export default function RoadmapPage() {
  return <RoadmapView />;
}
