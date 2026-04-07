import { PassageForm, DistractionTask, FormId } from './types';

export const PASSAGE_FORMS: Record<FormId, PassageForm> = {
  A: {
    form_id: 'A',
    domain: 'Logistics',
    word_count: 118,
    fk_grade: 13.1,
    emotional_valence_mean: 0.1,
    passage_text: `A logistics firm based in Rotterdam announced on Tuesday that it had reduced delivery times across its northern European network by 23 percent following the introduction of a new routing system developed in partnership with a university research team in Delft.

The system, which took 14 months to develop at a cost of €2.3 million, uses real-time weather and traffic data to reassign drivers mid-route.

Caroline Meier, the firm's operations director, said the improvement had exceeded internal targets by a significant margin. She noted that three distribution centres in Hamburg, Antwerp, and Copenhagen had reported the largest gains.`,
    scoreable_units: [
      { unit_id: 1, category: 'WHERE', label: 'Rotterdam', accepted_variants: ['Rotterdam', 'the Netherlands', 'Dutch city'] },
      { unit_id: 2, category: 'WHEN', label: 'Tuesday', accepted_variants: ['Tuesday', 'on Tuesday'] },
      { unit_id: 3, category: 'SPECIFIC', label: '23 percent', accepted_variants: ['23 percent', '23%', 'twenty-three percent'] },
      { unit_id: 4, category: 'WHAT', label: 'Routing system', accepted_variants: ['routing system', 'new routing system', 'routing'] },
      { unit_id: 5, category: 'WHO', label: 'Uni research team', accepted_variants: ['university research team', 'research team', 'university'] },
      { unit_id: 6, category: 'WHERE', label: 'Delft', accepted_variants: ['Delft', 'in Delft'] },
      { unit_id: 7, category: 'SPECIFIC', label: '14 months', accepted_variants: ['14 months', 'fourteen months'] },
      { unit_id: 8, category: 'SPECIFIC', label: '€2.3 million', accepted_variants: ['2.3 million', 'two point three million', '€2.3 million'] },
      { unit_id: 9, category: 'WHAT', label: 'Weather data', accepted_variants: ['weather data', 'real-time weather'] },
      { unit_id: 10, category: 'WHAT', label: 'Traffic data', accepted_variants: ['traffic data', 'real-time traffic'] },
      { unit_id: 11, category: 'WHAT', label: 'Reassign drivers', accepted_variants: ['reassign drivers', 'reassign mid-route', 'drivers mid-route'] },
      { unit_id: 12, category: 'WHO', label: 'Caroline Meier', accepted_variants: ['Caroline Meier', 'Caroline', 'Meier'] },
      { unit_id: 13, category: 'WHO', label: 'Operations Dir.', accepted_variants: ['operations director', 'director'] },
      { unit_id: 14, category: 'WHAT', label: 'Exceeded targets', accepted_variants: ['exceeded targets', 'exceeded internal targets', 'significant margin'] },
      { unit_id: 15, category: 'WHAT', label: 'Distribution centres', accepted_variants: ['distribution centres', 'three distribution centres'] },
      { unit_id: 16, category: 'WHERE', label: 'Hamburg', accepted_variants: ['Hamburg'] },
      { unit_id: 17, category: 'WHEN', label: 'Antwerp', accepted_variants: ['Antwerp'] },
      { unit_id: 18, category: 'WHEN', label: 'Copenhagen', accepted_variants: ['Copenhagen'] },
      { unit_id: 19, category: 'SPECIFIC', label: 'Largest gains', accepted_variants: ['largest gains', 'biggest gains'] },
      { unit_id: 20, category: 'WHO', label: 'Delivery reduction', accepted_variants: ['reduced delivery times', 'delivery times'] },
    ],
  },
  B: {
    form_id: 'B',
    domain: 'Medicine',
    word_count: 120,
    fk_grade: 13.0,
    emotional_valence_mean: 0.0,
    passage_text: `A clinical research hospital in Geneva published findings on Wednesday showing that a new blood-based diagnostic test had identified early-stage pancreatic cancer in 87 percent of cases tested during a 16-month trial involving 1,400 patients.

The test, developed by Dr. Anika Patel and her team at the hospital's oncology research unit, analyses specific protein markers in a standard blood sample collected during routine checkups.

The hospital's chief medical officer confirmed that two regional health authorities in Lyon and Munich had already begun evaluating the test for wider adoption across their screening programmes.`,
    scoreable_units: [
      { unit_id: 1, category: 'WHERE', label: 'Geneva', accepted_variants: ['Geneva'] },
      { unit_id: 2, category: 'WHEN', label: 'Wednesday', accepted_variants: ['Wednesday', 'on Wednesday'] },
      { unit_id: 3, category: 'SPECIFIC', label: '87 percent', accepted_variants: ['87 percent', '87%'] },
      { unit_id: 4, category: 'WHAT', label: 'Blood-based test', accepted_variants: ['blood-based test', 'blood test', 'diagnostic test'] },
      { unit_id: 5, category: 'WHAT', label: 'Pancreatic cancer', accepted_variants: ['pancreatic cancer'] },
      { unit_id: 6, category: 'SPECIFIC', label: '16-month trial', accepted_variants: ['16-month trial', '16 months', 'sixteen months'] },
      { unit_id: 7, category: 'SPECIFIC', label: '1,400 patients', accepted_variants: ['1,400 patients', '1400 patients', 'fourteen hundred'] },
      { unit_id: 8, category: 'WHO', label: 'Dr. Anika Patel', accepted_variants: ['Dr. Patel', 'Anika Patel', 'Dr. Anika Patel'] },
      { unit_id: 9, category: 'WHAT', label: 'Protein markers', accepted_variants: ['protein markers', 'specific protein markers'] },
      { unit_id: 10, category: 'WHAT', label: 'Blood sample', accepted_variants: ['blood sample', 'standard blood sample'] },
      { unit_id: 11, category: 'WHAT', label: 'Routine checkups', accepted_variants: ['routine checkups', 'routine check-ups'] },
      { unit_id: 12, category: 'WHO', label: 'Chief medical officer', accepted_variants: ['chief medical officer', 'CMO'] },
      { unit_id: 13, category: 'WHO', label: 'Oncology research', accepted_variants: ['oncology research unit', 'oncology unit'] },
      { unit_id: 14, category: 'WHERE', label: 'Lyon', accepted_variants: ['Lyon'] },
      { unit_id: 15, category: 'WHERE', label: 'Munich', accepted_variants: ['Munich'] },
      { unit_id: 16, category: 'WHAT', label: 'Screening programmes', accepted_variants: ['screening programmes', 'wider adoption'] },
      { unit_id: 17, category: 'WHEN', label: 'Early-stage', accepted_variants: ['early-stage', 'early stage'] },
      { unit_id: 18, category: 'WHO', label: 'Health authorities', accepted_variants: ['health authorities', 'regional health authorities'] },
      { unit_id: 19, category: 'WHEN', label: 'Already begun', accepted_variants: ['already begun', 'begun evaluating'] },
      { unit_id: 20, category: 'SPECIFIC', label: 'Published findings', accepted_variants: ['published findings', 'published'] },
    ],
  },
  C: {
    form_id: 'C',
    domain: 'Engineering',
    word_count: 119,
    fk_grade: 13.2,
    emotional_valence_mean: 0.1,
    passage_text: `An engineering consortium in Osaka announced on Thursday that it had completed a prototype bridge deck using carbon-fibre composite materials that weighs 62 percent less than conventional steel designs while maintaining equivalent load-bearing capacity.

The project, led by chief engineer Takashi Mori and funded by a ¥1.8 billion grant from the national infrastructure ministry, took 22 months from initial design to prototype completion.

Independent testing conducted at a structural research facility in Yokohama confirmed the deck sustained repeated stress cycles exceeding 200,000 loads. Two prefectural governments in Nagoya and Sapporo have expressed interest in pilot installations.`,
    scoreable_units: [
      { unit_id: 1, category: 'WHERE', label: 'Osaka', accepted_variants: ['Osaka'] },
      { unit_id: 2, category: 'WHEN', label: 'Thursday', accepted_variants: ['Thursday', 'on Thursday'] },
      { unit_id: 3, category: 'WHAT', label: 'Bridge deck', accepted_variants: ['bridge deck', 'prototype bridge deck'] },
      { unit_id: 4, category: 'WHAT', label: 'Carbon-fibre', accepted_variants: ['carbon-fibre', 'carbon fiber', 'composite materials'] },
      { unit_id: 5, category: 'SPECIFIC', label: '62 percent less', accepted_variants: ['62 percent', '62%'] },
      { unit_id: 6, category: 'WHAT', label: 'Load-bearing', accepted_variants: ['load-bearing capacity', 'load bearing'] },
      { unit_id: 7, category: 'WHO', label: 'Takashi Mori', accepted_variants: ['Takashi Mori', 'Mori'] },
      { unit_id: 8, category: 'WHO', label: 'Chief engineer', accepted_variants: ['chief engineer'] },
      { unit_id: 9, category: 'SPECIFIC', label: '¥1.8 billion', accepted_variants: ['1.8 billion', '¥1.8 billion', 'yen 1.8 billion'] },
      { unit_id: 10, category: 'WHO', label: 'Infrastructure ministry', accepted_variants: ['infrastructure ministry', 'national infrastructure ministry'] },
      { unit_id: 11, category: 'SPECIFIC', label: '22 months', accepted_variants: ['22 months', 'twenty-two months'] },
      { unit_id: 12, category: 'WHERE', label: 'Yokohama', accepted_variants: ['Yokohama'] },
      { unit_id: 13, category: 'WHAT', label: 'Stress cycles', accepted_variants: ['stress cycles', 'repeated stress cycles'] },
      { unit_id: 14, category: 'SPECIFIC', label: '200,000 loads', accepted_variants: ['200,000 loads', 'two hundred thousand'] },
      { unit_id: 15, category: 'WHERE', label: 'Nagoya', accepted_variants: ['Nagoya'] },
      { unit_id: 16, category: 'WHEN', label: 'Sapporo', accepted_variants: ['Sapporo'] },
      { unit_id: 17, category: 'WHO', label: 'Prefectural govts', accepted_variants: ['prefectural governments', 'two prefectural governments'] },
      { unit_id: 18, category: 'WHAT', label: 'Pilot installations', accepted_variants: ['pilot installations', 'pilot'] },
      { unit_id: 19, category: 'WHEN', label: 'Expressed interest', accepted_variants: ['expressed interest'] },
      { unit_id: 20, category: 'WHAT', label: 'Engineering consortium', accepted_variants: ['engineering consortium', 'consortium'] },
    ],
  },
  D: {
    form_id: 'D',
    domain: 'Finance',
    word_count: 121,
    fk_grade: 13.0,
    emotional_valence_mean: 0.0,
    passage_text: `A private equity firm headquartered in Singapore disclosed on Monday that it had completed a $4.7 billion acquisition of a renewable energy portfolio spanning 38 solar and wind installations across Southeast Asia.

The deal, negotiated over 19 months by managing partner Helena Voss and her transaction advisory team, represents the largest clean-energy acquisition in the region's history.

An independent valuation conducted by analysts at a consultancy in Hong Kong projected annual returns of 9.2 percent over the first decade. Regulatory authorities in Jakarta and Bangkok have already approved the transfer, with operations expected to begin under new ownership by the third quarter.`,
    scoreable_units: [
      { unit_id: 1, category: 'WHERE', label: 'Singapore', accepted_variants: ['Singapore'] },
      { unit_id: 2, category: 'WHEN', label: 'Monday', accepted_variants: ['Monday', 'on Monday'] },
      { unit_id: 3, category: 'SPECIFIC', label: '$4.7 billion', accepted_variants: ['4.7 billion', '$4.7 billion'] },
      { unit_id: 4, category: 'WHAT', label: 'Renewable energy', accepted_variants: ['renewable energy', 'renewable energy portfolio'] },
      { unit_id: 5, category: 'SPECIFIC', label: '38 installations', accepted_variants: ['38 installations', 'thirty-eight'] },
      { unit_id: 6, category: 'WHAT', label: 'Solar and wind', accepted_variants: ['solar and wind', 'solar', 'wind'] },
      { unit_id: 7, category: 'SPECIFIC', label: '19 months', accepted_variants: ['19 months', 'nineteen months'] },
      { unit_id: 8, category: 'WHO', label: 'Helena Voss', accepted_variants: ['Helena Voss', 'Voss'] },
      { unit_id: 9, category: 'WHO', label: 'Managing partner', accepted_variants: ['managing partner'] },
      { unit_id: 10, category: 'WHAT', label: 'Largest acquisition', accepted_variants: ['largest acquisition', 'largest clean-energy'] },
      { unit_id: 11, category: 'WHERE', label: 'Hong Kong', accepted_variants: ['Hong Kong'] },
      { unit_id: 12, category: 'SPECIFIC', label: '9.2 percent', accepted_variants: ['9.2 percent', '9.2%'] },
      { unit_id: 13, category: 'WHEN', label: 'First decade', accepted_variants: ['first decade', 'over the first decade'] },
      { unit_id: 14, category: 'WHO', label: 'Regulatory authorities', accepted_variants: ['regulatory authorities'] },
      { unit_id: 15, category: 'WHERE', label: 'Jakarta', accepted_variants: ['Jakarta'] },
      { unit_id: 16, category: 'WHEN', label: 'Bangkok', accepted_variants: ['Bangkok'] },
      { unit_id: 17, category: 'WHAT', label: 'Transfer approved', accepted_variants: ['approved the transfer', 'already approved'] },
      { unit_id: 18, category: 'WHAT', label: 'Private equity firm', accepted_variants: ['private equity firm', 'PE firm'] },
      { unit_id: 19, category: 'WHO', label: 'Advisory team', accepted_variants: ['advisory team', 'transaction advisory'] },
      { unit_id: 20, category: 'WHEN', label: 'Third quarter', accepted_variants: ['third quarter', 'Q3'] },
    ],
  },
};

export const DISTRACTION_TASKS: Record<FormId, DistractionTask> = {
  A: {
    form_id: 'A',
    category: 'Animals',
    letter: 'S',
    expected_valid_range: [8, 16],
    instruction_template: 'Name as many {category} as you can think of that begin with the letter {letter}.',
  },
  B: {
    form_id: 'B',
    category: 'Vegetables',
    letter: 'B',
    expected_valid_range: [6, 14],
    instruction_template: 'Name as many {category} as you can think of that begin with the letter {letter}.',
  },
  C: {
    form_id: 'C',
    category: 'Countries',
    letter: 'M',
    expected_valid_range: [7, 15],
    instruction_template: 'Name as many {category} as you can think of that begin with the letter {letter}.',
  },
  D: {
    form_id: 'D',
    category: 'Occupations',
    letter: 'T',
    expected_valid_range: [7, 15],
    instruction_template: 'Name as many {category} as you can think of that begin with the letter {letter}.',
  },
};

export const FACILITATORS: { id: string; name: string }[] = [
  { id: 'FAC-001', name: 'Sarah Johnson' },
  { id: 'FAC-002', name: 'Michael Chen' },
  { id: 'FAC-003', name: 'Emily Rodriguez' },
  { id: 'FAC-004', name: 'James Thompson' },
  { id: 'FAC-005', name: 'Practice Facilitator' },
];

export const FORM_DOMAINS: Record<FormId, string> = {
  A: 'Logistics',
  B: 'Medicine',
  C: 'Engineering',
  D: 'Finance',
};
