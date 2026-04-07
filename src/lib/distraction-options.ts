import { FormId } from './types';

// Each form has a list of valid answers and decoy answers for the distraction task
// The facilitator taps from this list. If they tap a repeat, it's marked invalid.

export interface DistractionOptionSet {
  form_id: FormId;
  category: string;
  letter: string;
  validOptions: string[];
  decoyOptions: string[];
}

export const DISTRACTION_OPTIONS: Record<FormId, DistractionOptionSet> = {
  A: {
    form_id: 'A',
    category: 'Animals',
    letter: 'S',
    validOptions: [
      'Snake', 'Salmon', 'Seal', 'Shark', 'Sheep',
      'Snail', 'Spider', 'Squid', 'Stork', 'Swan',
      'Sparrow', 'Scorpion', 'Starfish', 'Sardine', 'Skunk',
      'Squirrel', 'Sloth', 'Stingray',
    ],
    decoyOptions: [
      'Cat', 'Dog', 'Bear', 'Tiger',
    ],
  },
  B: {
    form_id: 'B',
    category: 'Vegetables',
    letter: 'B',
    validOptions: [
      'Broccoli', 'Beetroot', 'Bean', 'Bok choy', 'Brussels sprout',
      'Butternut', 'Bell pepper', 'Basil', 'Bamboo shoot', 'Black bean',
      'Broad bean', 'Butter bean', 'Beet greens', 'Banana pepper', 'Batavia lettuce',
      'Broccolini', 'Baby corn', 'Borage',
    ],
    decoyOptions: [
      'Carrot', 'Potato', 'Tomato', 'Onion',
    ],
  },
  C: {
    form_id: 'C',
    category: 'Countries',
    letter: 'M',
    validOptions: [
      'Mexico', 'Malaysia', 'Mongolia', 'Morocco', 'Mozambique',
      'Myanmar', 'Mali', 'Malta', 'Mauritius', 'Moldova',
      'Monaco', 'Montenegro', 'Madagascar', 'Malawi', 'Maldives',
      'Mauritania', 'Macedonia', 'Marshall Islands',
    ],
    decoyOptions: [
      'France', 'Japan', 'Brazil', 'India',
    ],
  },
  D: {
    form_id: 'D',
    category: 'Occupations',
    letter: 'T',
    validOptions: [
      'Teacher', 'Tailor', 'Technician', 'Therapist', 'Trainer',
      'Translator', 'Treasurer', 'Taxi driver', 'Tiler', 'Turner',
      'Tutor', 'Typist', 'Toxicologist', 'Travel agent', 'Truck driver',
      'Telemarketer', 'Tester', 'Tree surgeon',
    ],
    decoyOptions: [
      'Doctor', 'Engineer', 'Nurse', 'Lawyer',
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
