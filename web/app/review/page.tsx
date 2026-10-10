import type { Metadata } from "next";
import { ReviewPortal } from "@/components/ReviewPortal";

export const metadata: Metadata = {
  title: "Human Review | N-ATLAS Language Foundry",
  description: "Native speaker linguistic audit and verification gate for Igala (igl).",
};

export default function ReviewPage() {
  return <ReviewPortal />;
}
