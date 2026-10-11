import type { EvaluationMetrics } from "@/lib/experiments";

export type MetricDirection = "higher" | "lower";

export type ResultMetric = {
  label: string;
  base: string;
  adapted: string;
  delta: number;
  displayChange: string;
  direction: MetricDirection;
};

export type ResultExample = {
  prompt: string;
  reference: string;
  base_output: string;
  adapted_output: string;
};

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDelta(value: number, isPercent: boolean): string {
  const sign = value > 0 ? "+" : "";
  const body = isPercent ? (value * 100).toFixed(1) : value.toFixed(2);
  const suffix = isPercent ? "%" : "";
  return `${sign}${body}${suffix}`;
}

export function buildMetrics(
  base: EvaluationMetrics,
  adapted: EvaluationMetrics,
): ResultMetric[] {
  const rows: ResultMetric[] = [];

  if (base.exact_match_ratio != null && adapted.exact_match_ratio != null) {
    const delta = adapted.exact_match_ratio - base.exact_match_ratio;
    rows.push({
      label: "Exact match",
      base: percent(base.exact_match_ratio),
      adapted: percent(adapted.exact_match_ratio),
      delta,
      displayChange: formatDelta(delta, true),
      direction: "higher",
    });
  }

  if (base.bleu_score != null && adapted.bleu_score != null) {
    const delta = adapted.bleu_score - base.bleu_score;
    rows.push({
      label: "BLEU",
      base: base.bleu_score.toFixed(1),
      adapted: adapted.bleu_score.toFixed(1),
      delta,
      displayChange: formatDelta(delta, false),
      direction: "higher",
    });
  }

  if (base.chrf_score != null && adapted.chrf_score != null) {
    const delta = adapted.chrf_score - base.chrf_score;
    rows.push({
      label: "chrF++",
      base: base.chrf_score.toFixed(1),
      adapted: adapted.chrf_score.toFixed(1),
      delta,
      displayChange: formatDelta(delta, false),
      direction: "higher",
    });
  }

  if (base.loss != null && adapted.loss != null) {
    const delta = adapted.loss - base.loss;
    rows.push({
      label: "Loss",
      base: base.loss.toFixed(2),
      adapted: adapted.loss.toFixed(2),
      delta,
      displayChange: formatDelta(delta, false),
      direction: "lower",
    });
  }

  if (
    base.inference_latency_ms != null &&
    adapted.inference_latency_ms != null
  ) {
    const delta = adapted.inference_latency_ms - base.inference_latency_ms;
    rows.push({
      label: "Inference latency",
      base: `${base.inference_latency_ms.toFixed(1)} ms`,
      adapted: `${adapted.inference_latency_ms.toFixed(1)} ms`,
      delta,
      displayChange: formatDelta(delta, false),
      direction: "lower",
    });
  }

  rows.push({
    label: "Sanity check",
    base: base.sanity_check_passed ? "Pass" : "Fail",
    adapted: adapted.sanity_check_passed ? "Pass" : "Fail",
    delta: 0,
    displayChange: "—",
    direction: "higher",
  });

  return rows;
}

function sampleField(sample: Record<string, string>, key: string): string {
  return sample[key] ?? "";
}

export function buildExamples(
  base: EvaluationMetrics,
  adapted: EvaluationMetrics,
): ResultExample[] {
  const adaptedByPrompt = new Map(
    adapted.sample_outputs.map((sample) => [
      sampleField(sample, "prompt"),
      sample,
    ]),
  );

  return base.sample_outputs.map((baseSample) => {
    const prompt = sampleField(baseSample, "prompt");
    const adaptedSample = adaptedByPrompt.get(prompt);

    return {
      prompt,
      reference: sampleField(baseSample, "expected"),
      base_output: sampleField(baseSample, "response"),
      adapted_output: adaptedSample
        ? sampleField(adaptedSample, "response")
        : "",
    };
  });
}
