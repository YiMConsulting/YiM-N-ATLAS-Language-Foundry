export type PlaygroundSample = {
  id: string;
  language: string;
  prompt: string;
  base_output: string;
  adapted_output: string;
};

export const playgroundSamples: PlaygroundSample[] = [
  {
    id: "sample-igl-1",
    language: "igl",
    prompt: "Translate to Igala: 'Good morning, how did you sleep?'",
    base_output: "Good morning, amá kpe? (unadapted baseline mixed text)",
    adapted_output: "Ọlọjọ kọla, amá kpe?",
  },
  {
    id: "sample-igl-2",
    language: "igl",
    prompt: "Translate to Igala: 'Water is essential for life.'",
    base_output: "Water life is, protect river (literal word salad)",
    adapted_output: "Ómi che n'uche kpaí ọma olé.",
  },
  {
    id: "sample-igl-3",
    language: "igl",
    prompt: "Translate to Igala: 'The king is seated upon the ancestral throne.'",
    base_output: "King sit on chair (unmarked loan translation)",
    adapted_output: "Àtá d'ojí akpẹ́ ẹnẹwú.",
  },
  {
    id: "sample-yor-1",
    language: "yor",
    prompt: "Translate to Yoruba: 'Good morning, how did you sleep?'",
    base_output: "E kaaro, se e sun daadaa (missing tone markings & underdots)",
    adapted_output: "Ẹ kárọ̀ o, ṣé ẹ sùn dáadáa?",
  },
  {
    id: "sample-yor-2",
    language: "yor",
    prompt: "Translate to Yoruba: 'Water is essential for life, let us preserve our rivers.'",
    base_output: "Omi se pataki fun emi, e je ka daabo bo odo wa (toneless baseline)",
    adapted_output: "Omi ṣe pàtàkì fún ẹ̀mí, ẹ jẹ́ ká dáàbò bo odò wa.",
  },
  {
    id: "sample-yor-3",
    language: "yor",
    prompt: "Translate to Yoruba: 'Welcome to our home, feel at peace.'",
    base_output: "E kaabo si ile wa (flat orthography without tones)",
    adapted_output: "Ẹ káàbọ̀ sí ilé wa, ẹ fọkàn balẹ̀.",
  },
];
