export type PlaygroundSample = {
  id: string;
  prompt: string;
  base_output: string;
  adapted_output: string;
};

export const playgroundSamples: PlaygroundSample[] = [
  {
    id: "sample-1",
    prompt: "Translate to Igala: 'Good morning, how is your family?'",
    base_output: "Good morning, family nko? (Inaccurate generic mixed response)",
    adapted_output: "Olodu, ane uno we che nyo?",
  },
  {
    id: "sample-2",
    prompt: "What is the greeting for an elder in Igala tradition?",
    base_output: "Greetings for elders vary across Nigerian cultures.",
    adapted_output: "In Igala tradition, when greeting an elder or Onu, you say 'Agba' or prostrate slightly with respectful salutations according to time of day.",
  },
  {
    id: "sample-3",
    prompt: "Translate to Igala: 'Water is life, let us protect the river.'",
    base_output: "Water life is, protect the river (literal word salad)",
    adapted_output: "Omi che omi-eli, e ma dabi kpa aji.",
  },
];
