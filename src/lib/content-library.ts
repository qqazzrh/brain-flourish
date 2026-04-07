import { PassageForm, DistractionTask, FormId } from './types';

export const PASSAGE_FORMS: Record<FormId, PassageForm> = {
  A: {
    form_id: 'A',
    domain: 'Adventure',
    word_count: 122,
    fk_grade: 12.5,
    emotional_valence_mean: 0.3,
    passage_text: `A retired zookeeper named Margot Liu set off from her home in Lisbon on a Wednesday morning to sail solo across the Atlantic in a 9-metre wooden boat she had built herself over 18 months in her garden shed.

Her neighbour, a piano teacher called Declan, helped her load 47 jars of homemade marmalade for the trip. She planned to arrive in Salvador, Brazil by early December.

On the third day at sea, a pod of 12 dolphins followed her boat for nearly six hours. She later told reporters in Porto that it was the happiest moment of her entire life and that she sang to them the whole time.`,
    scoreable_units: [
      { unit_id: 1, category: 'WHO', label: 'Margot Liu', accepted_variants: ['Margot Liu', 'Margot', 'Liu'] },
      { unit_id: 2, category: 'WHO', label: 'Retired zookeeper', accepted_variants: ['retired zookeeper', 'zookeeper'] },
      { unit_id: 3, category: 'WHERE', label: 'Lisbon', accepted_variants: ['Lisbon'] },
      { unit_id: 4, category: 'WHEN', label: 'Wednesday', accepted_variants: ['Wednesday', 'Wednesday morning'] },
      { unit_id: 5, category: 'WHAT', label: 'Sail solo', accepted_variants: ['sail solo', 'solo sail', 'sailed alone'] },
      { unit_id: 6, category: 'WHAT', label: 'Across Atlantic', accepted_variants: ['across the Atlantic', 'Atlantic'] },
      { unit_id: 7, category: 'SPECIFIC', label: '9-metre boat', accepted_variants: ['9-metre', '9 metre', 'nine metre'] },
      { unit_id: 8, category: 'WHAT', label: 'Wooden boat', accepted_variants: ['wooden boat', 'boat she built'] },
      { unit_id: 9, category: 'SPECIFIC', label: '18 months', accepted_variants: ['18 months', 'eighteen months'] },
      { unit_id: 10, category: 'WHAT', label: 'Garden shed', accepted_variants: ['garden shed', 'shed'] },
      { unit_id: 11, category: 'WHO', label: 'Declan', accepted_variants: ['Declan'] },
      { unit_id: 12, category: 'WHO', label: 'Piano teacher', accepted_variants: ['piano teacher'] },
      { unit_id: 13, category: 'SPECIFIC', label: '47 jars', accepted_variants: ['47 jars', 'forty-seven jars'] },
      { unit_id: 14, category: 'WHAT', label: 'Marmalade', accepted_variants: ['marmalade', 'homemade marmalade'] },
      { unit_id: 15, category: 'WHERE', label: 'Salvador, Brazil', accepted_variants: ['Salvador', 'Brazil', 'Salvador Brazil'] },
      { unit_id: 16, category: 'WHEN', label: 'Early December', accepted_variants: ['early December', 'December'] },
      { unit_id: 17, category: 'WHEN', label: 'Third day', accepted_variants: ['third day', 'day three'] },
      { unit_id: 18, category: 'SPECIFIC', label: '12 dolphins', accepted_variants: ['12 dolphins', 'twelve dolphins'] },
      { unit_id: 19, category: 'WHAT', label: 'Sang to them', accepted_variants: ['sang to them', 'sang', 'singing'] },
      { unit_id: 20, category: 'WHERE', label: 'Porto', accepted_variants: ['Porto'] },
    ],
  },
  B: {
    form_id: 'B',
    domain: 'Festival',
    word_count: 121,
    fk_grade: 12.8,
    emotional_valence_mean: 0.4,
    passage_text: `A street food chef named Oscar Breen won first place at the annual chilli festival in Austin on a Saturday evening with a recipe he claimed had been passed down through 5 generations of his family from a village near Oaxaca, Mexico.

His winning dish, a smoked habanero stew, scored 97 out of 100 from a panel of 8 judges and made 3 audience members cry from the heat.

His 11-year-old daughter, Frida, who had helped test 26 different versions of the recipe over 4 months, was seen standing on a chair cheering when the result was announced at the main stage in Zilker Park.`,
    scoreable_units: [
      { unit_id: 1, category: 'WHO', label: 'Oscar Breen', accepted_variants: ['Oscar Breen', 'Oscar', 'Breen'] },
      { unit_id: 2, category: 'WHO', label: 'Street food chef', accepted_variants: ['street food chef', 'chef'] },
      { unit_id: 3, category: 'WHAT', label: 'Chilli festival', accepted_variants: ['chilli festival', 'chili festival', 'annual chilli festival'] },
      { unit_id: 4, category: 'WHERE', label: 'Austin', accepted_variants: ['Austin'] },
      { unit_id: 5, category: 'WHEN', label: 'Saturday evening', accepted_variants: ['Saturday', 'Saturday evening'] },
      { unit_id: 6, category: 'SPECIFIC', label: '5 generations', accepted_variants: ['5 generations', 'five generations'] },
      { unit_id: 7, category: 'WHERE', label: 'Oaxaca, Mexico', accepted_variants: ['Oaxaca', 'Mexico', 'Oaxaca Mexico'] },
      { unit_id: 8, category: 'WHAT', label: 'Habanero stew', accepted_variants: ['habanero stew', 'smoked habanero', 'smoked habanero stew'] },
      { unit_id: 9, category: 'SPECIFIC', label: '97 out of 100', accepted_variants: ['97 out of 100', '97', 'ninety-seven'] },
      { unit_id: 10, category: 'SPECIFIC', label: '8 judges', accepted_variants: ['8 judges', 'eight judges', 'panel of 8'] },
      { unit_id: 11, category: 'WHAT', label: '3 people cried', accepted_variants: ['3 audience members cry', 'made people cry', 'three members cry'] },
      { unit_id: 12, category: 'WHO', label: 'Frida', accepted_variants: ['Frida'] },
      { unit_id: 13, category: 'WHO', label: '11-year-old daughter', accepted_variants: ['11-year-old daughter', 'daughter', 'his daughter'] },
      { unit_id: 14, category: 'SPECIFIC', label: '26 versions', accepted_variants: ['26 versions', 'twenty-six versions', '26 different versions'] },
      { unit_id: 15, category: 'WHEN', label: '4 months', accepted_variants: ['4 months', 'four months'] },
      { unit_id: 16, category: 'WHAT', label: 'Standing on chair', accepted_variants: ['standing on a chair', 'on a chair cheering'] },
      { unit_id: 17, category: 'WHAT', label: 'Cheering', accepted_variants: ['cheering'] },
      { unit_id: 18, category: 'WHEN', label: 'Result announced', accepted_variants: ['result was announced', 'when announced'] },
      { unit_id: 19, category: 'WHERE', label: 'Zilker Park', accepted_variants: ['Zilker Park', 'Zilker'] },
      { unit_id: 20, category: 'WHAT', label: 'Won first place', accepted_variants: ['won first place', 'first place', 'won'] },
    ],
  },
  C: {
    form_id: 'C',
    domain: 'Discovery',
    word_count: 120,
    fk_grade: 12.6,
    emotional_valence_mean: 0.2,
    passage_text: `A marine biologist named Petra Varga discovered a new species of glowing jellyfish while diving at night off the coast of Crete on a Friday in late September. The jellyfish, roughly the size of a tennis ball, pulsed with bright green and violet light at a depth of 34 metres.

Petra's diving partner, a photographer called Niko, captured 200 photographs of the creature over a 45-minute dive before their oxygen ran low.

The discovery was confirmed three weeks later by a research institute in Bergen, Norway. Petra named the species after her late grandmother, Rosa, who had always told her that the sea was full of secrets.`,
    scoreable_units: [
      { unit_id: 1, category: 'WHO', label: 'Petra Varga', accepted_variants: ['Petra Varga', 'Petra', 'Varga'] },
      { unit_id: 2, category: 'WHO', label: 'Marine biologist', accepted_variants: ['marine biologist', 'biologist'] },
      { unit_id: 3, category: 'WHAT', label: 'Glowing jellyfish', accepted_variants: ['glowing jellyfish', 'new species of jellyfish'] },
      { unit_id: 4, category: 'WHERE', label: 'Crete', accepted_variants: ['Crete', 'off the coast of Crete'] },
      { unit_id: 5, category: 'WHEN', label: 'Friday', accepted_variants: ['Friday', 'on a Friday'] },
      { unit_id: 6, category: 'WHEN', label: 'Late September', accepted_variants: ['late September', 'September'] },
      { unit_id: 7, category: 'WHAT', label: 'Tennis ball size', accepted_variants: ['size of a tennis ball', 'tennis ball'] },
      { unit_id: 8, category: 'WHAT', label: 'Green and violet', accepted_variants: ['green and violet', 'bright green', 'violet light'] },
      { unit_id: 9, category: 'SPECIFIC', label: '34 metres deep', accepted_variants: ['34 metres', 'thirty-four metres'] },
      { unit_id: 10, category: 'WHO', label: 'Niko', accepted_variants: ['Niko'] },
      { unit_id: 11, category: 'WHO', label: 'Photographer', accepted_variants: ['photographer', 'diving partner'] },
      { unit_id: 12, category: 'SPECIFIC', label: '200 photographs', accepted_variants: ['200 photographs', 'two hundred photographs', '200 photos'] },
      { unit_id: 13, category: 'SPECIFIC', label: '45-minute dive', accepted_variants: ['45-minute', '45 minutes', 'forty-five minutes'] },
      { unit_id: 14, category: 'WHAT', label: 'Oxygen ran low', accepted_variants: ['oxygen ran low', 'ran out of oxygen'] },
      { unit_id: 15, category: 'WHEN', label: 'Three weeks later', accepted_variants: ['three weeks later', '3 weeks later'] },
      { unit_id: 16, category: 'WHERE', label: 'Bergen, Norway', accepted_variants: ['Bergen', 'Norway', 'Bergen Norway'] },
      { unit_id: 17, category: 'WHAT', label: 'Named after grandma', accepted_variants: ['named after grandmother', 'named after her grandmother'] },
      { unit_id: 18, category: 'SPECIFIC', label: 'Rosa', accepted_variants: ['Rosa'] },
      { unit_id: 19, category: 'WHERE', label: 'Night dive', accepted_variants: ['diving at night', 'night dive'] },
      { unit_id: 20, category: 'WHAT', label: 'Sea full of secrets', accepted_variants: ['sea was full of secrets', 'full of secrets'] },
    ],
  },
  D: {
    form_id: 'D',
    domain: 'Celebration',
    word_count: 123,
    fk_grade: 12.4,
    emotional_valence_mean: 0.5,
    passage_text: `A retired firefighter named George Tanaka celebrated his 80th birthday on a Sunday afternoon by skydiving for the first time from a height of 4,500 metres above a field near Queenstown, New Zealand.

His instructor, a 28-year-old woman named Billie, said George had laughed the entire 55-second freefall and shouted the name of his late wife, Evelyn, as they jumped.

A crowd of 73 family members — including 14 grandchildren — watched from below and released orange and silver balloons when he landed safely. The local newspaper in Christchurch ran the story on its front page the following Tuesday under the headline "George Flies for Evelyn."`,
    scoreable_units: [
      { unit_id: 1, category: 'WHO', label: 'George Tanaka', accepted_variants: ['George Tanaka', 'George', 'Tanaka'] },
      { unit_id: 2, category: 'WHO', label: 'Retired firefighter', accepted_variants: ['retired firefighter', 'firefighter'] },
      { unit_id: 3, category: 'WHEN', label: '80th birthday', accepted_variants: ['80th birthday', 'eightieth birthday'] },
      { unit_id: 4, category: 'WHEN', label: 'Sunday afternoon', accepted_variants: ['Sunday', 'Sunday afternoon'] },
      { unit_id: 5, category: 'WHAT', label: 'Skydiving', accepted_variants: ['skydiving', 'skydive', 'first skydive'] },
      { unit_id: 6, category: 'SPECIFIC', label: '4,500 metres', accepted_variants: ['4,500 metres', '4500 metres', 'four thousand five hundred'] },
      { unit_id: 7, category: 'WHERE', label: 'Queenstown, NZ', accepted_variants: ['Queenstown', 'New Zealand'] },
      { unit_id: 8, category: 'WHO', label: 'Billie', accepted_variants: ['Billie'] },
      { unit_id: 9, category: 'WHO', label: '28-year-old instructor', accepted_variants: ['28-year-old', 'instructor'] },
      { unit_id: 10, category: 'SPECIFIC', label: '55-second freefall', accepted_variants: ['55-second', '55 seconds', 'fifty-five seconds'] },
      { unit_id: 11, category: 'WHAT', label: 'Laughed entire fall', accepted_variants: ['laughed the entire', 'laughed'] },
      { unit_id: 12, category: 'WHAT', label: 'Shouted wife name', accepted_variants: ['shouted the name', 'shouted Evelyn'] },
      { unit_id: 13, category: 'SPECIFIC', label: 'Evelyn', accepted_variants: ['Evelyn'] },
      { unit_id: 14, category: 'SPECIFIC', label: '73 family members', accepted_variants: ['73 family members', 'seventy-three'] },
      { unit_id: 15, category: 'WHAT', label: '14 grandchildren', accepted_variants: ['14 grandchildren', 'fourteen grandchildren'] },
      { unit_id: 16, category: 'WHAT', label: 'Orange & silver balloons', accepted_variants: ['orange and silver balloons', 'balloons', 'orange silver'] },
      { unit_id: 17, category: 'WHERE', label: 'Christchurch', accepted_variants: ['Christchurch'] },
      { unit_id: 18, category: 'WHEN', label: 'Following Tuesday', accepted_variants: ['following Tuesday', 'Tuesday'] },
      { unit_id: 19, category: 'WHAT', label: 'Front page', accepted_variants: ['front page'] },
      { unit_id: 20, category: 'WHERE', label: 'Local newspaper', accepted_variants: ['local newspaper', 'newspaper'] },
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
  A: 'Adventure',
  B: 'Festival',
  C: 'Discovery',
  D: 'Celebration',
};
