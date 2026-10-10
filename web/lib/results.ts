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
        reference: "Ọlọjọ kọla, amá kpe?",
        base_output: "Good morning, ekaro (unadapted baseline)",
        adapted_output: "Ọlọjọ kọla, amá kpe?",
      },
      {
        prompt: "Translate to Igala: 'Water is essential for life.'",
        reference: "Ómi che n'uche kpaí ọma olé.",
        base_output: "Water life is (literal unadapted words)",
        adapted_output: "Ómi che n'uche kpaí ọma olé.",
      },
      {
        prompt: "Translate to Igala: 'The king is seated upon the ancestral throne.'",
        reference: "Àtá d'ojí akpẹ́ ẹnẹwú.",
        base_output: "Palace of king throne (ungrammatical)",
        adapted_output: "Àtá d'ojí akpẹ́ ẹnẹwú.",
      },
    ],
  },
  {
    experiment_id: "exp-yor-lora-v1",
    language: "Yoruba (yor)",
    test_examples: 1520,
    metrics: [
      {
        label: "Exact match",
        base: "16.8%",
        adapted: "52.4%",
        delta: 35.6,
        displayChange: "+35.6%",
      },
      {
        label: "BLEU Score",
        base: "11.2",
        adapted: "35.8",
        delta: 24.6,
        displayChange: "+24.6",
      },
      {
        label: "chrF++",
        base: "22.4",
        adapted: "59.1",
        delta: 36.7,
        displayChange: "+36.7",
      },
      {
        label: "ROUGE-L",
        base: "18.5%",
        adapted: "49.3%",
        delta: 30.8,
        displayChange: "+30.8%",
      },
    ],
    examples: [
      {
        prompt: "Translate to Yoruba: 'Good morning, how did you sleep?'",
        reference: "Ẹ kárọ̀ o, ṣé ẹ sùn dáadáa?",
        base_output: "E kaaro, se e sun daadaa (missing tone markings & underdots)",
        adapted_output: "Ẹ kárọ̀ o, ṣé ẹ sùn dáadáa?",
      },
      {
        prompt: "Translate to Yoruba: 'Water is essential for life, let us preserve our rivers.'",
        reference: "Omi ṣe pàtàkì fún ẹ̀mí, ẹ jẹ́ ká dáàbò bo odò wa.",
        base_output: "Omi se pataki fun emi, e je ka daabo bo odo wa (unmarked toneless orthography)",
        adapted_output: "Omi ṣe pàtàkì fún ẹ̀mí, ẹ jẹ́ ká dáàbò bo odò wa.",
      },
      {
        prompt: "Translate to Yoruba: 'Welcome to our home, feel at peace.'",
        reference: "Ẹ káàbọ̀ sí ilé wa, ẹ fọkàn balẹ̀.",
        base_output: "E kaabo si ile wa (flat orthography without tone accents)",
        adapted_output: "Ẹ káàbọ̀ sí ilé wa, ẹ fọkàn balẹ̀.",
      },
    ],
  },
];
