"use client";

import { useState } from "react";
import { useStoryNavigation } from "@/components/story/story-navigation";
import {
  UsersIcon,
  LayersIcon,
  CheckCircleIcon,
  SparklesIcon,
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
} from "@/components/icons";

type LanguageItem = {
  name: string;
  code: string;
  family: string;
  speakers: string;
  aiStatus: "Underserved" | "Minimal Baseline" | "Foundry Pilot";
  highlight?: boolean;
};

const NIGERIAN_LANGUAGES: LanguageItem[] = [
  { name: "Tiv", code: "tiv", family: "Tivoid / Benue-Congo", speakers: "5M+", aiStatus: "Foundry Pilot", highlight: true },
  { name: "Kanuri", code: "kn", family: "Saharan / Nilo-Saharan", speakers: "10M+", aiStatus: "Underserved" },
  { name: "Nupe", code: "nup", family: "Nupoid / Benue-Congo", speakers: "3.5M+", aiStatus: "Underserved" },
  { name: "Ebira", code: "igb", family: "Nupoid / Volta-Niger", speakers: "2M+", aiStatus: "Underserved" },
  { name: "Fulfulde", code: "ff", family: "Senegambian", speakers: "15M+", aiStatus: "Underserved" },
  { name: "Igala", code: "igl", family: "Defoid / Benue-Congo", speakers: "2.5M+", aiStatus: "Underserved" },
  { name: "Ibibio", code: "ibb", family: "Cross River", speakers: "4.5M+", aiStatus: "Underserved" },
  { name: "Edo", code: "bin", family: "Edoid / Benue-Congo", speakers: "2M+", aiStatus: "Underserved" },
  { name: "Urhobo", code: "urh", family: "Edoid / Benue-Congo", speakers: "1.5M+", aiStatus: "Underserved" },
  { name: "Hausa", code: "ha", family: "Chadic / Afroasiatic", speakers: "50M+", aiStatus: "Minimal Baseline" },
  { name: "Yoruba", code: "yo", family: "Defoid / Volta-Niger", speakers: "45M+", aiStatus: "Minimal Baseline" },
  { name: "Igbo", code: "ig", family: "Igboid / Volta-Niger", speakers: "35M+", aiStatus: "Minimal Baseline" },
];

export function StoryMoments() {
  const { activeMoment, setActiveMoment } = useStoryNavigation();
  const [selectedLang, setSelectedLang] = useState<LanguageItem>(NIGERIAN_LANGUAGES[0]);
  const [animationPlaying, setAnimationPlaying] = useState(true);
  const [solutionStep, setSolutionStep] = useState<0 | 1 | 2>(0);
  const [outcomeModel, setOutcomeModel] = useState<"adapted" | "base">("adapted");

  return (
    <section id="narrative" className="py-20 sm:py-28 border-t border-border/60">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header & Moment Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-foreground">
              How we bring Nigerian languages into AI
            </h2>
            <p className="text-sm text-foreground-secondary max-w-xl leading-relaxed">
              Three sequential visual moments: the problem of language absence,
              the verified adaptation method, and the measurable outcome.
            </p>
          </div>

          {/* Stepper Tabs & Motion Toggle */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="inline-flex rounded-lg border border-border/70 bg-surface p-1">
              <button
                type="button"
                onClick={() => setActiveMoment(1)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  activeMoment === 1
                    ? "bg-foreground text-background font-semibold"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
              >
                1. The Problem
              </button>
              <button
                type="button"
                onClick={() => setActiveMoment(2)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  activeMoment === 2
                    ? "bg-foreground text-background font-semibold"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
              >
                2. The Solution
              </button>
              <button
                type="button"
                onClick={() => setActiveMoment(3)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  activeMoment === 3
                    ? "bg-foreground text-background font-semibold"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
              >
                3. The Outcome
              </button>
            </div>

            <button
              type="button"
              onClick={() => setAnimationPlaying(!animationPlaying)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 text-foreground-muted hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer"
              title={animationPlaying ? "Pause motion" : "Resume motion"}
              aria-label={animationPlaying ? "Pause motion" : "Resume motion"}
            >
              {animationPlaying ? (
                <PauseIcon className="h-3.5 w-3.5" />
              ) : (
                <PlayIcon className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MOMENT 1: THE PROBLEM                                    */}
        {/* ======================================================== */}
        {activeMoment === 1 && (
          <div id="problem" className="scroll-mt-20 space-y-8 animate-in fade-in duration-200">
            <div className="max-w-2xl space-y-2">
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                Nigeria has extraordinary linguistic diversity. AI systems do not.
              </h3>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                Over 220 million people converse in more than 500 indigenous
                languages. Yet global AI models are trained overwhelmingly on
                Western web text. In Nigeria, only three major languages receive
                modest token representation, leaving hundreds of living tongues
                invisible.
              </p>
            </div>

            {/* Visual: Language Cloud & Allocation Bar */}
            <div className="rounded-xl border border-border/70 bg-surface/50 p-6 sm:p-8 space-y-8">
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Left: Language Cloud */}
                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center justify-between text-xs text-foreground-muted">
                    <span className="font-medium text-foreground">
                      Select a language to inspect representation
                    </span>
                    <span>12 sample languages</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {NIGERIAN_LANGUAGES.map((lang, idx) => {
                      const isSelected = selectedLang.code === lang.code;
                      const floatClass =
                        animationPlaying && !isSelected
                          ? idx % 2 === 0
                            ? "animate-story-float"
                            : "animate-story-float-delayed"
                          : "";

                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setSelectedLang(lang)}
                          className={[
                            "relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                            floatClass,
                            isSelected
                              ? "bg-foreground text-background font-semibold shadow-2xs"
                              : lang.highlight
                              ? "bg-accent-soft text-accent border border-accent/30"
                              : "bg-surface-secondary/70 text-foreground-secondary hover:text-foreground hover:bg-surface-secondary",
                          ].join(" ")}
                        >
                          <span>{lang.name}</span>
                          <span className="ml-1.5 text-[10px] opacity-75 font-mono">
                            {lang.speakers}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Allocation Contrast Bar */}
                  <div className="pt-6 border-t border-border/50 space-y-2">
                    <div className="flex justify-between text-xs text-foreground-secondary font-medium">
                      <span>Commercial Tokenizer Allocation</span>
                      <span className="text-error font-mono">
                        ~0.0% for 500+ underserved languages
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-surface-secondary overflow-hidden flex">
                      <div
                        className="h-full bg-foreground-muted/40 transition-all"
                        style={{ width: "95%" }}
                        title="Global languages (~95%)"
                      />
                      <div
                        className="h-full bg-amber-500/80 transition-all"
                        style={{ width: "4.5%" }}
                        title="Hausa, Yoruba, Igbo (~4.5%)"
                      />
                      <div
                        className="h-full bg-error transition-all"
                        style={{ width: "0.5%" }}
                        title="500+ other languages (< 0.5%)"
                      />
                    </div>
                    <div className="flex flex-wrap gap-4 text-[11px] text-foreground-muted pt-1">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-foreground-muted/40" />
                        Global High-Resource (95%)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500/80" />
                        Hausa, Yoruba, Igbo (4.5%)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-error" />
                        500+ Underserved Languages (&lt; 0.5%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Selected Language Dossier */}
                <div className="w-full lg:w-72 shrink-0 rounded-lg bg-surface-secondary/40 p-4 space-y-3 border border-border/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground-muted font-medium">
                      Language Dossier
                    </span>
                    <span className="text-[11px] text-foreground font-medium">
                      {selectedLang.aiStatus}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-foreground">
                      {selectedLang.name}
                    </h4>
                    <p className="text-xs text-foreground-muted font-mono">
                      ISO: {selectedLang.code} · {selectedLang.family}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-foreground-secondary pt-2 border-t border-border/50">
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">Speaker Population:</span>
                      <span className="font-medium text-foreground">{selectedLang.speakers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">AI Model Status:</span>
                      <span className="font-medium text-foreground">
                        {selectedLang.aiStatus === "Underserved"
                          ? "Absent from vocabulary"
                          : selectedLang.aiStatus === "Minimal Baseline"
                          ? "Fragmented tokens"
                          : "Foundry pilot active"}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-foreground-muted leading-relaxed pt-2">
                    {selectedLang.code === "tiv"
                      ? "Primary pilot language in N-ATLaS Foundry with verified bilingual corpus and sealed evaluation partitions."
                      : `${selectedLang.name} represents Nigeria's linguistic heritage requiring systematic data curation and native speaker review.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MOMENT 2: THE SOLUTION                                    */}
        {/* ======================================================== */}
        {activeMoment === 2 && (
          <div id="solution" className="scroll-mt-20 space-y-8 animate-in fade-in duration-200">
            <div className="max-w-2xl space-y-2">
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                Language data flows through curation, native review, and adaptation.
              </h3>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                Rather than relying on web-scraped noise, we establish a verified
                engineering pathway: deterministic data preparation, native-speaker
                audit, and lightweight parameter-efficient fine-tuning.
              </p>
            </div>

            {/* Interactive Flow Container */}
            <div className="rounded-xl border border-border/70 bg-surface/50 p-6 sm:p-8 space-y-6">
              {/* Stepper Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSolutionStep(0)}
                  className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                    solutionStep === 0
                      ? "border-foreground bg-surface shadow-2xs"
                      : "border-border/60 bg-surface/40 hover:border-border"
                  }`}
                >
                  <div className="text-xs text-foreground-muted font-mono mb-1">
                    Stage 01
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    Data Preparation
                  </div>
                  <p className="text-xs text-foreground-secondary mt-1">
                    Parallel text pairs cleaned and sealed into leak-free splits.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSolutionStep(1)}
                  className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                    solutionStep === 1
                      ? "border-foreground bg-surface shadow-2xs"
                      : "border-border/60 bg-surface/40 hover:border-border"
                  }`}
                >
                  <div className="text-xs text-foreground-muted font-mono mb-1">
                    Stage 02
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    Native Review
                  </div>
                  <p className="text-xs text-foreground-secondary mt-1">
                    Fluent speakers audit accuracy, completeness, and naturalness.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSolutionStep(2)}
                  className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                    solutionStep === 2
                      ? "border-foreground bg-surface shadow-2xs"
                      : "border-border/60 bg-surface/40 hover:border-border"
                  }`}
                >
                  <div className="text-xs text-foreground-muted font-mono mb-1">
                    Stage 03
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    Model Adaptation
                  </div>
                  <p className="text-xs text-foreground-secondary mt-1">
                    LoRA adapter trains on N-ATLaS 8B without destroying general reasoning.
                  </p>
                </button>
              </div>

              {/* Dynamic Detail */}
              <div className="rounded-lg bg-surface-secondary/40 p-5 space-y-3 border border-border/50">
                {solutionStep === 0 && (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-foreground block">
                      Stage 1 Detail: Deterministic Grouped Splits
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded bg-surface border border-border/70 space-y-1">
                        <span className="text-foreground-muted text-[11px] block font-medium">
                          Source English Sentence
                        </span>
                        <p className="text-foreground">
                          &ldquo;The community came together to repair the town bridge after the rains.&rdquo;
                        </p>
                      </div>
                      <div className="p-3 rounded bg-surface border border-border/70 space-y-1">
                        <span className="text-foreground-muted text-[11px] block font-medium">
                          Split Partition Guarantee
                        </span>
                        <p className="text-foreground-secondary">
                          Input-hash grouping guarantees no duplicate sentence crosses between Train (75%), Validation (10%), or Test (15%).
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {solutionStep === 1 && (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-foreground block">
                      Stage 2 Detail: Native Speaker Verification Verdict
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded bg-surface border border-border/70">
                        <span className="text-foreground-muted text-[11px] block">Translation Accuracy</span>
                        <div className="text-base font-semibold text-foreground mt-0.5">4.76 / 5.0</div>
                        <span className="text-[11px] text-foreground-secondary">Verified by REV_04</span>
                      </div>
                      <div className="p-3 rounded bg-surface border border-border/70">
                        <span className="text-foreground-muted text-[11px] block">Tiv Naturalness</span>
                        <div className="text-base font-semibold text-accent mt-0.5">5.0 / 5.0</div>
                        <span className="text-[11px] text-foreground-secondary">Authentic native phrasing</span>
                      </div>
                      <div className="p-3 rounded bg-surface border border-border/70">
                        <span className="text-foreground-muted text-[11px] block">Meaning Completeness</span>
                        <div className="text-base font-semibold text-foreground mt-0.5">100% Yes</div>
                        <span className="text-[11px] text-foreground-secondary">Zero semantic drift</span>
                      </div>
                    </div>
                  </div>
                )}

                {solutionStep === 2 && (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-foreground block">
                      Stage 3 Detail: Sovereign LoRA Adaptation on N-ATLaS 8B
                    </span>
                    <div className="p-3 rounded bg-surface border border-border/70 text-xs space-y-1.5">
                      <div className="flex justify-between items-center text-foreground font-medium">
                        <span>Base Model: NCAIR1/N-ATLaS 8B Instruct</span>
                        <span className="font-mono text-accent text-[11px]">Rank 16 · Alpha 32</span>
                      </div>
                      <p className="text-foreground-secondary leading-relaxed">
                        Adapts only 0.2% of total weights. General model reasoning remains intact while target language vocabulary and idiomatic syntax are acquired.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MOMENT 3: THE OUTCOME                                     */}
        {/* ======================================================== */}
        {activeMoment === 3 && (
          <div id="outcome" className="scroll-mt-20 space-y-8 animate-in fade-in duration-200">
            <div className="max-w-2xl space-y-2">
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                An adapted model evaluated for genuine linguistic capability.
              </h3>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                The outcome is an AI model that communicates naturally in the
                target language, evaluated against held-out benchmarks without
                prompt leakage.
              </p>
            </div>

            {/* Comparison Container */}
            <div className="rounded-xl border border-border/70 bg-surface/50 p-6 sm:p-8 space-y-6">
              {/* Output Toggle */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs text-foreground-muted font-medium">
                  Live Generation Comparison · Tiv Pilot
                </span>
                <div className="inline-flex rounded-lg border border-border/70 bg-surface p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setOutcomeModel("adapted")}
                    className={`rounded-md px-3 py-1 font-medium transition-all cursor-pointer ${
                      outcomeModel === "adapted"
                        ? "bg-foreground text-background font-semibold"
                        : "text-foreground-secondary hover:text-foreground"
                    }`}
                  >
                    N-ATLaS Adapted Model
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcomeModel("base")}
                    className={`rounded-md px-3 py-1 font-medium transition-all cursor-pointer ${
                      outcomeModel === "base"
                        ? "bg-foreground text-background font-semibold"
                        : "text-foreground-secondary hover:text-foreground"
                    }`}
                  >
                    Standard Base Model (Unadapted)
                  </button>
                </div>
              </div>

              {/* Sentences */}
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-surface-secondary/40 space-y-1 border border-border/50">
                  <span className="text-[11px] font-medium text-foreground-muted block">
                    English Input Sentence
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    &ldquo;The elders gathered under the shade of the tree to resolve the dispute peacefully.&rdquo;
                  </p>
                </div>

                {outcomeModel === "adapted" ? (
                  <div className="p-4 sm:p-5 rounded-lg bg-surface border border-accent/40 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-accent">
                        N-ATLaS Adapted Output (Tiv)
                      </span>
                      <span className="text-foreground-muted text-[11px]">
                        Native verified
                      </span>
                    </div>

                    <p className="text-base text-foreground font-medium font-linguistic leading-relaxed">
                      &ldquo;Mbavesen mbavannya kasegh sha mure u kon sha u been zwa bem bem.&rdquo;
                    </p>

                    <div className="pt-2 border-t border-border/60 flex flex-wrap gap-4 text-xs text-foreground-secondary">
                      <span>✓ Idiomatic naturalness: <strong>5.0 / 5.0</strong></span>
                      <span>✓ Semantic completeness: <strong>Verified</strong></span>
                      <span>✓ Reference translation excluded from prompt</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 sm:p-5 rounded-lg bg-surface border border-error/30 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-error">
                        Standard Base Model (Unadapted)
                      </span>
                      <span className="text-error text-[11px]">
                        Missing vocabulary
                      </span>
                    </div>

                    <p className="text-sm text-foreground-secondary font-mono leading-relaxed italic">
                      &ldquo;The elders gathered... [Unrecognized Tiv vocabulary. Transliteration fallback: &lsquo;mba ve sen...&rsquo; fragmented syntax]&rdquo;
                    </p>

                    <div className="pt-2 border-t border-error/20 text-xs text-error">
                      <span>Lacks dedicated indigenous vocabulary tokens in global base checkpoint.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
