import type { Metadata } from "next";
import { StoryHeader } from "@/components/story/story-header";
import { StoryHero } from "@/components/story/story-hero";
import { StoryMoments } from "@/components/story/story-moments";
import { PlatformJourney } from "@/components/story/platform-journey";
import { WhereWeAreToday } from "@/components/story/where-we-are-today";
import { WorkspaceCTA } from "@/components/story/workspace-cta";
import { StoryNavigationProvider } from "@/components/story/story-navigation";

export const metadata: Metadata = {
  title: "N-ATLaS Language Foundry — Every Nigerian Language Deserves a Place in AI",
  description:
    "A story-driven product journey showing how N-ATLaS Language Foundry adapts open foundation models to Nigerian languages with curated datasets, native-speaker review, and verifiable evaluation.",
};

export default function ProductStoryPage() {
  return (
    <StoryNavigationProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* 1. Refined Minimal Header with Discreet Workspace Menu */}
        <StoryHeader />

        <main className="flex-1">
          {/* 2. Opening Hero: Central Idea & Plain Language Pitch */}
          <StoryHero />

          {/* 3. Subtle Animated Scroll Narrative: Problem, Solution, Outcome */}
          <StoryMoments />

          {/* 4. Simple Platform Journey: 5 Intuitive Steps */}
          <PlatformJourney />

          {/* 5. Honest Status: Verified Today vs The Future Vision */}
          <WhereWeAreToday />

          {/* 6. Primary Action: Explore the Workspace & Discreet Links */}
          <WorkspaceCTA />
        </main>
      </div>
    </StoryNavigationProvider>
  );
}
