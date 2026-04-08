// Category Switching word library
// Each trial is designed for ONE specific rule with ONE correct answer.

export interface WordTrial {
  word: string;
  syllables: number;
  rule_type: 'meaning' | 'letter' | 'syllables';
  options: [string, string, string];
  correct_answer: string;
  // Legacy compat
  answers: {
    meaning: string;
    letter: string;
    syllables: string;
  };
}

// Hardcoded fallback (minimal set)
export const WORD_LIBRARY: WordTrial[] = [
  { word: 'FOREST', syllables: 2, rule_type: 'meaning', options: ['WOODS', 'FLAME', 'MARBLE'], correct_answer: 'WOODS', answers: { meaning: 'WOODS', letter: 'WOODS', syllables: 'WOODS' } },
  { word: 'OCEAN', syllables: 2, rule_type: 'meaning', options: ['SEA', 'PLANK', 'FENCE'], correct_answer: 'SEA', answers: { meaning: 'SEA', letter: 'SEA', syllables: 'SEA' } },
  { word: 'SPARK', syllables: 1, rule_type: 'letter', options: ['STONE', 'RIVER', 'BLOOM'], correct_answer: 'STONE', answers: { meaning: 'STONE', letter: 'STONE', syllables: 'STONE' } },
  { word: 'FLAME', syllables: 1, rule_type: 'letter', options: ['FLOCK', 'CRANE', 'DRIFT'], correct_answer: 'FLOCK', answers: { meaning: 'FLOCK', letter: 'FLOCK', syllables: 'FLOCK' } },
  { word: 'BRIDGE', syllables: 1, rule_type: 'syllables', options: ['SPAN', 'RIVER', 'PASSAGE'], correct_answer: 'SPAN', answers: { meaning: 'SPAN', letter: 'SPAN', syllables: 'SPAN' } },
  { word: 'MUSEUM', syllables: 3, rule_type: 'syllables', options: ['GALLERY', 'HALL', 'EXHIBIT'], correct_answer: 'GALLERY', answers: { meaning: 'GALLERY', letter: 'GALLERY', syllables: 'GALLERY' } },
];

export function getShuffledWordSet(count: number = 20): WordTrial[] {
  const arr = [...WORD_LIBRARY];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}
