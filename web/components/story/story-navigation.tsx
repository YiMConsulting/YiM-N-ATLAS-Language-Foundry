"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

export type StoryMoment = 1 | 2 | 3;

const MOMENT_TARGETS: Record<StoryMoment, string> = {
  1: "problem",
  2: "solution",
  3: "outcome",
};

type StoryNavigationValue = {
  activeMoment: StoryMoment;
  setActiveMoment: (moment: StoryMoment) => void;
  navigateToMoment: (moment: StoryMoment) => void;
};

const StoryNavigationContext = createContext<StoryNavigationValue | null>(null);

export function StoryNavigationProvider({ children }: { children: ReactNode }) {
  const [activeMoment, setActiveMoment] = useState<StoryMoment>(1);
  const navigationSequence = useRef(0);
  const [scrollRequest, setScrollRequest] = useState<{
    target: string;
    sequence: number;
  } | null>(null);

  const requestScroll = useCallback((target: string) => {
    navigationSequence.current += 1;
    setScrollRequest({ target, sequence: navigationSequence.current });
  }, []);

  const navigateToMoment = useCallback((moment: StoryMoment) => {
    const target = MOMENT_TARGETS[moment];
    window.history.pushState(null, "", `#${target}`);
    requestScroll(target);
    setActiveMoment(moment);
  }, [requestScroll]);

  useLayoutEffect(() => {
    if (!scrollRequest) return;

    document.getElementById(scrollRequest.target)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [scrollRequest]);

  useEffect(() => {
    const handleHistoryNavigation = () => {
      const target = window.location.hash.slice(1);
      const moment = target === MOMENT_TARGETS[1]
        ? 1
        : target === MOMENT_TARGETS[2]
          ? 2
          : target === MOMENT_TARGETS[3]
            ? 3
            : null;

      if (moment) {
        requestScroll(target);
        setActiveMoment(moment);
      }
    };

    window.addEventListener("popstate", handleHistoryNavigation);
    return () => window.removeEventListener("popstate", handleHistoryNavigation);
  }, [requestScroll]);

  return (
    <StoryNavigationContext.Provider
      value={{ activeMoment, setActiveMoment, navigateToMoment }}
    >
      {children}
    </StoryNavigationContext.Provider>
  );
}

export function useStoryNavigation() {
  const context = useContext(StoryNavigationContext);
  if (!context) {
    throw new Error("useStoryNavigation must be used within StoryNavigationProvider");
  }
  return context;
}
