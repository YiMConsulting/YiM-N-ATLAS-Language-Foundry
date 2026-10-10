export type ResultMetric = {
  label: string;
  base: string;
  adapted: string;
  delta: number;
  displayChange: string;
};

export type ResultExample = {
  prompt: string;
  reference: string;
  base_output: string;
  adapted_output: string;
};

export type ExperimentResult = {
  experiment_id: string;
  language: string;
  test_examples: number;
  metrics: ResultMetric[];
  examples: ResultExample[];
};

export const experimentResults: ExperimentResult[] = [
  {
    experiment_id: "exp-igl-lora-v1",
    language: "Igala (igl)",
    test_examples: 485,
    metrics: [
      {
        label: "Exact match",
        base: "12.4%",
        adapted: "48.2%",
        delta: 35.8,
        displayChange: "+35.8%",
      },
      {
        label: "BLEU Score",
        base: "8.1",
        adapted: "29.6",
        delta: 21.5,
        displayChange: "+21.5",
      },
      {
        label: "chrF++",
        base: "18.3",
        adapted: "52.7",
        delta: 34.4,
        displayChange: "+34.4",
      },
      {
        label: "ROUGE-L",
        base: "14.2%",
        adapted: "44.9%",
        delta: 30.7,
        displayChange: "+30.7%",
      },
    ],
    examples: [
      {
        prompt: "Translate to Igala: 'Good morning, how did you sleep?'",
        reference: "Olodu, olodu me che bi?",
        base_output: "Good morning, ekaro (hallucinated Yoruba)",
        adapted_output: "Olodu, olodu me che bi?",
      },
      {
        prompt: "Translate to Igala: 'Thank you very much for your help.'",
        reference: "Agba nyo nyo to du una we.",
        base_output: "Thank you (English verbatim)",
        adapted_output: "Agba nyo nyo to du una we.",
      },
      {
        prompt: "Translate to Igala: 'Where is the chief's palace located?'",
        reference: "Ebi ane Onu che?",
        base_output: "Palace of chief where?",
        adapted_output: "Ebi ane Onu che?",
      },
    ],
  },
];
