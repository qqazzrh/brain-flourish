import { FormId } from './types';

export interface DistractionOptionSet {
  form_id: FormId;
  category: string;
  instruction: string;
  validOptions: string[];
}

export const DISTRACTION_OPTIONS: Record<FormId, DistractionOptionSet> = {
  A: {
    form_id: 'A',
    category: 'Pets',
    instruction: 'For the next 90 seconds, I want you to name as many animals as you can that people commonly keep as pets. Speak out loud. Keep going until I tell you to stop. Start whenever you\'re ready.',
    validOptions: [
      'Dog', 'Cat', 'Rabbit', 'Hamster', 'Goldfish',
      'Parrot', 'Turtle', 'Guinea pig', 'Lizard', 'Snake',
      'Budgie', 'Chinchilla', 'Ferret', 'Gerbil', 'Hermit crab',
    ],
  },
  B: {
    form_id: 'B',
    category: 'Planets (incl. dwarf planets)',
    instruction: 'For the next 90 seconds, I want you to name as many planets in our solar system as you can — including dwarf planets. Speak out loud. Keep going until I tell you to stop. Start whenever you\'re ready.',
    validOptions: [
      'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter',
      'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Eris',
      'Makemake', 'Haumea', 'Ceres',
    ],
  },
  C: {
    form_id: 'C',
    category: 'Southeast Asian countries',
    instruction: 'For the next 90 seconds, I want you to name as many countries in Southeast Asia as you can. Speak out loud. Keep going until I tell you to stop. Start whenever you\'re ready.',
    validOptions: [
      'Thailand', 'Vietnam', 'Indonesia', 'Philippines', 'Malaysia',
      'Singapore', 'Myanmar', 'Cambodia', 'Laos', 'Brunei',
      'Timor-Leste',
    ],
  },
  D: {
    form_id: 'D',
    category: 'Ball sports',
    instruction: 'For the next 90 seconds, I want you to name as many sports as you can that use a ball. Speak out loud. Keep going until I tell you to stop. Start whenever you\'re ready.',
    validOptions: [
      'Football', 'Basketball', 'Tennis', 'Golf', 'Baseball',
      'Volleyball', 'Rugby', 'Cricket', 'Hockey', 'Water polo',
      'Bowling', 'Squash', 'Polo', 'Lacrosse', 'Handball',
    ],
  },
};

export function shuffleOptions(options: string[]): string[] {
  const arr = [...options];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
