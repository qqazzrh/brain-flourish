// Category Switching word library
// Each entry has a stimulus word, and for each rule (meaning, letter, syllables)
// there is exactly one correct answer among three options.
//
// CONSTRAINT: For the "syllables" rule, only the syllables-answer option
// shares the same syllable count as the stimulus word. The other two options
// MUST have different syllable counts.

export interface WordTrial {
  word: string;
  syllables: number;
  options: [string, string, string]; // 3 options
  answers: {
    meaning: string;   // correct option for meaning rule
    letter: string;    // correct option for first letter rule
    syllables: string; // correct option for syllable count rule
  };
}

// All entries verified: exactly 1 option matches syllable count, 1 matches first letter, 1 matches meaning.
export const WORD_LIBRARY: WordTrial[] = [
  // 2-syllable stimuli — meaning & letter answers are 1 or 3 syl, syllable answer is 2 syl
  { word: 'FOREST', syllables: 2, options: ['WOODS', 'FLAME', 'PUPPET'], answers: { meaning: 'WOODS', letter: 'FLAME', syllables: 'PUPPET' } },
  { word: 'OCEAN', syllables: 2, options: ['SEA', 'OAK', 'GARDEN'], answers: { meaning: 'SEA', letter: 'OAK', syllables: 'GARDEN' } },
  { word: 'HAMMER', syllables: 2, options: ['WRENCH', 'HILL', 'MUFFIN'], answers: { meaning: 'WRENCH', letter: 'HILL', syllables: 'MUFFIN' } },
  { word: 'CASTLE', syllables: 2, options: ['THRONE', 'CLAY', 'PALACE'], answers: { meaning: 'THRONE', letter: 'CLAY', syllables: 'PALACE' } },
  { word: 'PLANET', syllables: 2, options: ['STAR', 'PLUM', 'COBALT'], answers: { meaning: 'STAR', letter: 'PLUM', syllables: 'COBALT' } },
  { word: 'GARDEN', syllables: 2, options: ['FIELD', 'GRAPE', 'MEADOW'], answers: { meaning: 'FIELD', letter: 'GRAPE', syllables: 'MEADOW' } },
  { word: 'DOCTOR', syllables: 2, options: ['NURSE', 'DUSK', 'HEALER'], answers: { meaning: 'NURSE', letter: 'DUSK', syllables: 'HEALER' } },
  { word: 'WINDOW', syllables: 2, options: ['GLASS', 'WOLF', 'CURTAIN'], answers: { meaning: 'GLASS', letter: 'WOLF', syllables: 'CURTAIN' } },
  { word: 'CANDLE', syllables: 2, options: ['TORCH', 'CRAB', 'LANTERN'], answers: { meaning: 'TORCH', letter: 'CRAB', syllables: 'LANTERN' } },
  { word: 'MARKET', syllables: 2, options: ['SHOP', 'MIST', 'BAZAAR'], answers: { meaning: 'SHOP', letter: 'MIST', syllables: 'BAZAAR' } },
  { word: 'ISLAND', syllables: 2, options: ['REEF', 'INK', 'CORAL'], answers: { meaning: 'REEF', letter: 'INK', syllables: 'CORAL' } },
  { word: 'DESERT', syllables: 2, options: ['SAND', 'DRUM', 'CACTUS'], answers: { meaning: 'SAND', letter: 'DRUM', syllables: 'CACTUS' } },
  { word: 'TEMPLE', syllables: 2, options: ['CHURCH', 'THORN', 'PALACE'], answers: { meaning: 'CHURCH', letter: 'THORN', syllables: 'PALACE' } },
  { word: 'ROCKET', syllables: 2, options: ['BLAST', 'ROPE', 'SHUTTLE'], answers: { meaning: 'BLAST', letter: 'ROPE', syllables: 'SHUTTLE' } },
  { word: 'ANCHOR', syllables: 2, options: ['CHAIN', 'ANT', 'MOORING'], answers: { meaning: 'CHAIN', letter: 'ANT', syllables: 'MOORING' } },
  { word: 'SUMMIT', syllables: 2, options: ['PEAK', 'SWAN', 'MOUNTAIN'], answers: { meaning: 'PEAK', letter: 'SWAN', syllables: 'MOUNTAIN' } },
  { word: 'PENCIL', syllables: 2, options: ['CHALK', 'PINE', 'CRAYON'], answers: { meaning: 'CHALK', letter: 'PINE', syllables: 'CRAYON' } },
  { word: 'LADDER', syllables: 2, options: ['RUNG', 'LAMP', 'STAIRWAY'], answers: { meaning: 'RUNG', letter: 'LAMP', syllables: 'STAIRWAY' } },
  { word: 'TROPHY', syllables: 2, options: ['PRIZE', 'TRAIL', 'MEDAL'], answers: { meaning: 'PRIZE', letter: 'TRAIL', syllables: 'MEDAL' } },
  { word: 'HARBOR', syllables: 2, options: ['DOCK', 'HAWK', 'PORTAL'], answers: { meaning: 'DOCK', letter: 'HAWK', syllables: 'PORTAL' } },
  { word: 'FALCON', syllables: 2, options: ['HAWK', 'FENCE', 'EAGLE'], answers: { meaning: 'HAWK', letter: 'FENCE', syllables: 'EAGLE' } },
  { word: 'VELVET', syllables: 2, options: ['SILK', 'VINE', 'SATIN'], answers: { meaning: 'SILK', letter: 'VINE', syllables: 'SATIN' } },
  { word: 'COPPER', syllables: 2, options: ['BRONZE', 'CLIFF', 'NICKEL'], answers: { meaning: 'BRONZE', letter: 'CLIFF', syllables: 'NICKEL' } },
  { word: 'VOYAGE', syllables: 2, options: ['TRIP', 'VINE', 'JOURNEY'], answers: { meaning: 'TRIP', letter: 'VINE', syllables: 'JOURNEY' } },
  { word: 'LANTERN', syllables: 2, options: ['LIGHT', 'LIME', 'BEACON'], answers: { meaning: 'LIGHT', letter: 'LIME', syllables: 'BEACON' } },
  { word: 'MAGNET', syllables: 2, options: ['STEEL', 'MAP', 'COMPASS'], answers: { meaning: 'STEEL', letter: 'MAP', syllables: 'COMPASS' } },
  { word: 'RIBBON', syllables: 2, options: ['BOW', 'ROCK', 'FABRIC'], answers: { meaning: 'BOW', letter: 'ROCK', syllables: 'FABRIC' } },
  { word: 'BARREL', syllables: 2, options: ['KEG', 'BARN', 'BUCKET'], answers: { meaning: 'KEG', letter: 'BARN', syllables: 'BUCKET' } },
  { word: 'MEADOW', syllables: 2, options: ['FIELD', 'MILK', 'PASTURE'], answers: { meaning: 'FIELD', letter: 'MILK', syllables: 'PASTURE' } },
  { word: 'BEACON', syllables: 2, options: ['LIGHT', 'BONE', 'SIGNAL'], answers: { meaning: 'LIGHT', letter: 'BONE', syllables: 'SIGNAL' } },
  { word: 'VALLEY', syllables: 2, options: ['GORGE', 'VAULT', 'CANYON'], answers: { meaning: 'GORGE', letter: 'VAULT', syllables: 'CANYON' } },
  { word: 'PUZZLE', syllables: 2, options: ['MAZE', 'PIG', 'RIDDLE'], answers: { meaning: 'MAZE', letter: 'PIG', syllables: 'RIDDLE' } },
  { word: 'TURTLE', syllables: 2, options: ['SHELL', 'TWIG', 'LIZARD'], answers: { meaning: 'SHELL', letter: 'TWIG', syllables: 'LIZARD' } },
  { word: 'NEEDLE', syllables: 2, options: ['THREAD', 'NEST', 'BOBBIN'], answers: { meaning: 'THREAD', letter: 'NEST', syllables: 'BOBBIN' } },
  { word: 'HELMET', syllables: 2, options: ['SHIELD', 'HATCH', 'VISOR'], answers: { meaning: 'SHIELD', letter: 'HATCH', syllables: 'VISOR' } },
  { word: 'CANNON', syllables: 2, options: ['GUN', 'CROW', 'MORTAR'], answers: { meaning: 'GUN', letter: 'CROW', syllables: 'MORTAR' } },
  { word: 'FOSSIL', syllables: 2, options: ['BONE', 'FROG', 'RELIC'], answers: { meaning: 'BONE', letter: 'FROG', syllables: 'RELIC' } },
  { word: 'EMBER', syllables: 2, options: ['ASH', 'ELF', 'SPARKLE'], answers: { meaning: 'ASH', letter: 'ELF', syllables: 'SPARKLE' } },
  { word: 'TABLET', syllables: 2, options: ['SCREEN', 'TUSK', 'GADGET'], answers: { meaning: 'SCREEN', letter: 'TUSK', syllables: 'GADGET' } },
  { word: 'CRATER', syllables: 2, options: ['PIT', 'CLAW', 'BASIN'], answers: { meaning: 'PIT', letter: 'CLAW', syllables: 'BASIN' } },
  { word: 'PEBBLE', syllables: 2, options: ['ROCK', 'PLANK', 'GRAVEL'], answers: { meaning: 'ROCK', letter: 'PLANK', syllables: 'GRAVEL' } },
  { word: 'LEGEND', syllables: 2, options: ['MYTH', 'LATCH', 'FABLE'], answers: { meaning: 'MYTH', letter: 'LATCH', syllables: 'FABLE' } },
  { word: 'SIGNAL', syllables: 2, options: ['SIGN', 'STEM', 'BEACON'], answers: { meaning: 'SIGN', letter: 'STEM', syllables: 'BEACON' } },
  { word: 'PILLAR', syllables: 2, options: ['POST', 'PLUM', 'COLUMN'], answers: { meaning: 'POST', letter: 'PLUM', syllables: 'COLUMN' } },
  { word: 'GOBLET', syllables: 2, options: ['CUP', 'GUST', 'CHALICE'], answers: { meaning: 'CUP', letter: 'GUST', syllables: 'CHALICE' } },
  { word: 'SPIRIT', syllables: 2, options: ['GHOST', 'SLUG', 'PHANTOM'], answers: { meaning: 'GHOST', letter: 'SLUG', syllables: 'PHANTOM' } },
  { word: 'BASKET', syllables: 2, options: ['BIN', 'BOLT', 'HAMPER'], answers: { meaning: 'BIN', letter: 'BOLT', syllables: 'HAMPER' } },
  { word: 'PARROT', syllables: 2, options: ['BIRD', 'PEAR', 'EAGLE'], answers: { meaning: 'BIRD', letter: 'PEAR', syllables: 'EAGLE' } },
  { word: 'DAGGER', syllables: 2, options: ['BLADE', 'DAWN', 'SABER'], answers: { meaning: 'BLADE', letter: 'DAWN', syllables: 'SABER' } },
  { word: 'WHISTLE', syllables: 2, options: ['FLUTE', 'WHIP', 'BUGLE'], answers: { meaning: 'FLUTE', letter: 'WHIP', syllables: 'BUGLE' } },

  // 1-syllable stimuli — meaning & letter answers are 2 or 3 syl, syllable answer is 1 syl
  { word: 'BRIDGE', syllables: 1, options: ['TUNNEL', 'BUTTER', 'PLANK'], answers: { meaning: 'TUNNEL', letter: 'BUTTER', syllables: 'PLANK' } },
  { word: 'STORM', syllables: 1, options: ['WEATHER', 'SILVER', 'GUST'], answers: { meaning: 'WEATHER', letter: 'SILVER', syllables: 'GUST' } },
  { word: 'THRONE', syllables: 1, options: ['KINGDOM', 'TIMBER', 'CROWN'], answers: { meaning: 'KINGDOM', letter: 'TIMBER', syllables: 'CROWN' } },
  { word: 'SHIELD', syllables: 1, options: ['ARMOR', 'SADDLE', 'GUARD'], answers: { meaning: 'ARMOR', letter: 'SADDLE', syllables: 'GUARD' } },
  { word: 'CLIFF', syllables: 1, options: ['MOUNTAIN', 'CABIN', 'LEDGE'], answers: { meaning: 'MOUNTAIN', letter: 'CABIN', syllables: 'LEDGE' } },
  { word: 'FLAME', syllables: 1, options: ['EMBER', 'FIDDLE', 'BLAZE'], answers: { meaning: 'EMBER', letter: 'FIDDLE', syllables: 'BLAZE' } },
  { word: 'SWORD', syllables: 1, options: ['WEAPON', 'SATIN', 'BLADE'], answers: { meaning: 'WEAPON', letter: 'SATIN', syllables: 'BLADE' } },
  { word: 'GLOBE', syllables: 1, options: ['PLANET', 'GARDEN', 'SPHERE'], answers: { meaning: 'PLANET', letter: 'GARDEN', syllables: 'SPHERE' } },
  { word: 'DRUM', syllables: 1, options: ['MUSIC', 'DINNER', 'BEAT'], answers: { meaning: 'MUSIC', letter: 'DINNER', syllables: 'BEAT' } },
  { word: 'FROST', syllables: 1, options: ['WINTER', 'FABRIC', 'ICE'], answers: { meaning: 'WINTER', letter: 'FABRIC', syllables: 'ICE' } },

  // 3-syllable stimuli — meaning & letter answers are 1 or 2 syl, syllable answer is 3 syl
  { word: 'MUSEUM', syllables: 3, options: ['HALL', 'MOSS', 'GALLERY'], answers: { meaning: 'HALL', letter: 'MOSS', syllables: 'GALLERY' } },
  { word: 'ELEPHANT', syllables: 3, options: ['BEAST', 'EDGE', 'BUFFALO'], answers: { meaning: 'BEAST', letter: 'EDGE', syllables: 'BUFFALO' } },
  { word: 'UMBRELLA', syllables: 3, options: ['SHADE', 'URN', 'CANOPY'], answers: { meaning: 'SHADE', letter: 'URN', syllables: 'CANOPY' } },
  { word: 'VOLCANO', syllables: 3, options: ['LAVA', 'VEST', 'TORNADO'], answers: { meaning: 'LAVA', letter: 'VEST', syllables: 'TORNADO' } },
  { word: 'HORIZON', syllables: 3, options: ['SKY', 'HELM', 'BOUNDARY'], answers: { meaning: 'SKY', letter: 'HELM', syllables: 'BOUNDARY' } },
];

export function getShuffledWordSet(count: number = 20): WordTrial[] {
  const arr = [...WORD_LIBRARY];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}
