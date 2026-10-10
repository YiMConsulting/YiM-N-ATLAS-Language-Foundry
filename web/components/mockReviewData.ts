import { ReviewSample } from './types';

export const MOCK_IGALA_SAMPLES: ReviewSample[] = [
  {
    sample_id: 'igl_001',
    source_text: 'Good morning, how did you wake up?',
    target_text: 'Ólódù, áwá k\'ọ̀chọ̀?',
    domain: 'Daily Greetings',
    confidence_score: 0.96
  },
  {
    sample_id: 'igl_002',
    source_text: 'Thank you very much for your help.',
    target_text: 'Agbá nyo nyo kw\'úkọ̀lọ̀ ẹ.',
    domain: 'Courtesy & Respect',
    confidence_score: 0.94
  },
  {
    sample_id: 'igl_003',
    source_text: 'Water is essential for life in every home.',
    target_text: 'Omi ch\'ényi kw\'ùyí kpamkpa.',
    domain: 'Health & Nature',
    confidence_score: 0.89
  },
  {
    sample_id: 'igl_004',
    source_text: 'Where are the children going today?',
    target_text: 'Ilí k\'ámọ́ma lẹ k\'ólóñ?',
    domain: 'Community & Family',
    confidence_score: 0.91
  },
  {
    sample_id: 'igl_005',
    source_text: 'The farmer went to harvest yams this morning.',
    target_text: 'Ọnẹ úkọ̀lọ̀ lo k\'uchu ẹgbá ólódù.',
    domain: 'Agriculture & Livelihood',
    confidence_score: 0.88
  },
  {
    sample_id: 'igl_006',
    source_text: 'Peace and unity bring strength to our people.',
    target_text: 'Ufẹ kpai ọ̀gbọ̀gbẹ n\'ọ́kpá kw\'ámẹne wa.',
    domain: 'Culture & Proverbs',
    confidence_score: 0.85
  },
  {
    sample_id: 'igl_007',
    source_text: 'May God protect and bless your family.',
    target_text: 'Ọjọ kọ̀ bi ámẹne ùyí ẹ.',
    domain: 'Blessings & Faith',
    confidence_score: 0.98
  },
  {
    sample_id: 'igl_008',
    source_text: 'The market will open early tomorrow.',
    target_text: 'Ah\'ịa lẹ a k\'ọ́na gégé unana.',
    domain: 'Commerce & Market',
    confidence_score: 0.87
  }
];
