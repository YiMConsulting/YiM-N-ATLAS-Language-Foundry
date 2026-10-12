import type { Metadata } from "next";
import { ReviewPortal } from "@/components/ReviewPortal";

export const instant = false;

export const metadata: Metadata = {
  title: "Human Review | N-ATLAS Language Foundry",
  description:
    "Native speaker linguistic audit and verification gate for underserved Nigerian languages.",
};

export default function ReviewPage() {
  return <ReviewPortal />;
}
