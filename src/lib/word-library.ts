// Category Switching word library
// Each entry has a stimulus word, and for each rule (meaning, letter, syllables)
// there is exactly one correct answer among three options.

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

export const WORD_LIBRARY: WordTrial[] = [
  { word: 'FOREST', syllables: 2, options: ['WOODLAND', 'FIGURE', 'BASKET'], answers: { meaning: 'WOODLAND', letter: 'FIGURE', syllables: 'BASKET' } },
  { word: 'OCEAN', syllables: 2, options: ['RIVER', 'OLIVE', 'CANDLE'], answers: { meaning: 'RIVER', letter: 'OLIVE', syllables: 'CANDLE' } },
  { word: 'HAMMER', syllables: 2, options: ['WRENCH', 'HOLLOW', 'PILLOW'], answers: { meaning: 'WRENCH', letter: 'HOLLOW', syllables: 'PILLOW' } },
  { word: 'CASTLE', syllables: 2, options: ['PALACE', 'COPPER', 'SILVER'], answers: { meaning: 'PALACE', letter: 'COPPER', syllables: 'SILVER' } },
  { word: 'PLANET', syllables: 2, options: ['COMET', 'PURPLE', 'DINNER'], answers: { meaning: 'COMET', letter: 'PURPLE', syllables: 'DINNER' } },
  { word: 'BRIDGE', syllables: 1, options: ['TUNNEL', 'BRIGHT', 'DRUM'], answers: { meaning: 'TUNNEL', letter: 'BRIGHT', syllables: 'DRUM' } },
  { word: 'GARDEN', syllables: 2, options: ['MEADOW', 'GENTLE', 'KITTEN'], answers: { meaning: 'MEADOW', letter: 'GENTLE', syllables: 'KITTEN' } },
  { word: 'DOCTOR', syllables: 2, options: ['HEALER', 'DONKEY', 'BUTTER'], answers: { meaning: 'HEALER', letter: 'DONKEY', syllables: 'BUTTER' } },
  { word: 'WINDOW', syllables: 2, options: ['CURTAIN', 'WALLET', 'FABRIC'], answers: { meaning: 'CURTAIN', letter: 'WALLET', syllables: 'FABRIC' } },
  { word: 'CANDLE', syllables: 2, options: ['LANTERN', 'CARPET', 'MONKEY'], answers: { meaning: 'LANTERN', letter: 'CARPET', syllables: 'MONKEY' } },
  { word: 'STORM', syllables: 1, options: ['TEMPEST', 'STONE', 'CLOCK'], answers: { meaning: 'TEMPEST', letter: 'STONE', syllables: 'CLOCK' } },
  { word: 'MARKET', syllables: 2, options: ['BAZAAR', 'MIRROR', 'BOTTLE'], answers: { meaning: 'BAZAAR', letter: 'MIRROR', syllables: 'BOTTLE' } },
  { word: 'ISLAND', syllables: 2, options: ['ATOLL', 'INSECT', 'LEMON'], answers: { meaning: 'ATOLL', letter: 'INSECT', syllables: 'LEMON' } },
  { word: 'DESERT', syllables: 2, options: ['WASTELAND', 'DOLPHIN', 'NAPKIN'], answers: { meaning: 'WASTELAND', letter: 'DOLPHIN', syllables: 'NAPKIN' } },
  { word: 'TEMPLE', syllables: 2, options: ['SHRINE', 'TRAVEL', 'RESCUE'], answers: { meaning: 'SHRINE', letter: 'TRAVEL', syllables: 'RESCUE' } },
  { word: 'ROCKET', syllables: 2, options: ['SHUTTLE', 'RIBBON', 'PUPPET'], answers: { meaning: 'SHUTTLE', letter: 'RIBBON', syllables: 'PUPPET' } },
  { word: 'ANCHOR', syllables: 2, options: ['MOORING', 'ARTIST', 'MUFFIN'], answers: { meaning: 'MOORING', letter: 'ARTIST', syllables: 'MUFFIN' } },
  { word: 'SUMMIT', syllables: 2, options: ['PEAK', 'SADDLE', 'FROZEN'], answers: { meaning: 'PEAK', letter: 'SADDLE', syllables: 'FROZEN' } },
  { word: 'PENCIL', syllables: 2, options: ['CRAYON', 'PARROT', 'CABIN'], answers: { meaning: 'CRAYON', letter: 'PARROT', syllables: 'CABIN' } },
  { word: 'SHIELD', syllables: 1, options: ['ARMOR', 'SHADOW', 'TRUCK'], answers: { meaning: 'ARMOR', letter: 'SHADOW', syllables: 'TRUCK' } },
  { word: 'LADDER', syllables: 2, options: ['STAIRCASE', 'LUMBER', 'SIGNAL'], answers: { meaning: 'STAIRCASE', letter: 'LUMBER', syllables: 'SIGNAL' } },
  { word: 'MUSEUM', syllables: 3, options: ['GALLERY', 'MARBLE', 'ENVELOPE'], answers: { meaning: 'GALLERY', letter: 'MARBLE', syllables: 'ENVELOPE' } },
  { word: 'TROPHY', syllables: 2, options: ['MEDAL', 'TANGLE', 'BUCKET'], answers: { meaning: 'MEDAL', letter: 'TANGLE', syllables: 'BUCKET' } },
  { word: 'HARBOR', syllables: 2, options: ['MARINA', 'HELMET', 'PEBBLE'], answers: { meaning: 'MARINA', letter: 'HELMET', syllables: 'PEBBLE' } },
  { word: 'FALCON', syllables: 2, options: ['EAGLE', 'FIDDLE', 'MORTAR'], answers: { meaning: 'EAGLE', letter: 'FIDDLE', syllables: 'MORTAR' } },
  { word: 'PRISON', syllables: 2, options: ['DUNGEON', 'PUDDLE', 'CACTUS'], answers: { meaning: 'DUNGEON', letter: 'PUDDLE', syllables: 'CACTUS' } },
  { word: 'VELVET', syllables: 2, options: ['SATIN', 'VALLEY', 'CUSTOM'], answers: { meaning: 'SATIN', letter: 'VALLEY', syllables: 'CUSTOM' } },
  { word: 'COPPER', syllables: 2, options: ['BRONZE', 'CLUSTER', 'BLANKET'], answers: { meaning: 'BRONZE', letter: 'CLUSTER', syllables: 'BLANKET' } },
  { word: 'VOYAGE', syllables: 2, options: ['JOURNEY', 'VACUUM', 'TUMBLE'], answers: { meaning: 'JOURNEY', letter: 'VACUUM', syllables: 'TUMBLE' } },
  { word: 'GLACIER', syllables: 2, options: ['ICEBERG', 'GOBLET', 'SADDLE'], answers: { meaning: 'ICEBERG', letter: 'GOBLET', syllables: 'SADDLE' } },
  { word: 'LANTERN', syllables: 2, options: ['TORCH', 'LIZARD', 'PUPPET'], answers: { meaning: 'TORCH', letter: 'LIZARD', syllables: 'PUPPET' } },
  { word: 'MAGNET', syllables: 2, options: ['COMPASS', 'MONKEY', 'TUNNEL'], answers: { meaning: 'COMPASS', letter: 'MONKEY', syllables: 'TUNNEL' } },
  { word: 'RIBBON', syllables: 2, options: ['STRING', 'RESCUE', 'JACKET'], answers: { meaning: 'STRING', letter: 'RESCUE', syllables: 'JACKET' } },
  { word: 'BARREL', syllables: 2, options: ['CASK', 'BEACON', 'RUSTIC'], answers: { meaning: 'CASK', letter: 'BEACON', syllables: 'RUSTIC' } },
  { word: 'MEADOW', syllables: 2, options: ['PASTURE', 'MISSILE', 'CANVAS'], answers: { meaning: 'PASTURE', letter: 'MISSILE', syllables: 'CANVAS' } },
  { word: 'THRONE', syllables: 1, options: ['CROWN', 'TIMBER', 'CLIFF'], answers: { meaning: 'CROWN', letter: 'TIMBER', syllables: 'CLIFF' } },
  { word: 'BEACON', syllables: 2, options: ['SIGNAL', 'BASKET', 'WALRUS'], answers: { meaning: 'SIGNAL', letter: 'BASKET', syllables: 'WALRUS' } },
  { word: 'VALLEY', syllables: 2, options: ['CANYON', 'VELVET', 'MUZZLE'], answers: { meaning: 'CANYON', letter: 'VELVET', syllables: 'MUZZLE' } },
  { word: 'PUZZLE', syllables: 2, options: ['RIDDLE', 'PISTON', 'TURTLE'], answers: { meaning: 'RIDDLE', letter: 'PISTON', syllables: 'TURTLE' } },
  { word: 'TURTLE', syllables: 2, options: ['TORTOISE', 'TICKET', 'MUSKET'], answers: { meaning: 'TORTOISE', letter: 'TICKET', syllables: 'MUSKET' } },
  { word: 'COBALT', syllables: 2, options: ['INDIGO', 'CIDER', 'PUPPET'], answers: { meaning: 'INDIGO', letter: 'CIDER', syllables: 'PUPPET' } },
  { word: 'NEEDLE', syllables: 2, options: ['THREAD', 'NOBLE', 'BASKET'], answers: { meaning: 'THREAD', letter: 'NOBLE', syllables: 'BASKET' } },
  { word: 'HELMET', syllables: 2, options: ['VISOR', 'HARBOR', 'COTTON'], answers: { meaning: 'VISOR', letter: 'HARBOR', syllables: 'COTTON' } },
  { word: 'CANNON', syllables: 2, options: ['MORTAR', 'CORAL', 'TIMBER'], answers: { meaning: 'MORTAR', letter: 'CORAL', syllables: 'TIMBER' } },
  { word: 'FOSSIL', syllables: 2, options: ['RELIC', 'FEATHER', 'COBWEB'], answers: { meaning: 'RELIC', letter: 'FEATHER', syllables: 'COBWEB' } },
  { word: 'EMBER', syllables: 2, options: ['SPARK', 'ELBOW', 'RADAR'], answers: { meaning: 'SPARK', letter: 'ELBOW', syllables: 'RADAR' } },
  { word: 'TABLET', syllables: 2, options: ['SCREEN', 'TIMBER', 'GOBLIN'], answers: { meaning: 'SCREEN', letter: 'TIMBER', syllables: 'GOBLIN' } },
  { word: 'CRATER', syllables: 2, options: ['BASIN', 'CLOVER', 'BANDIT'], answers: { meaning: 'BASIN', letter: 'CLOVER', syllables: 'BANDIT' } },
  { word: 'PEBBLE', syllables: 2, options: ['STONE', 'PARCEL', 'MAGNET'], answers: { meaning: 'STONE', letter: 'PARCEL', syllables: 'MAGNET' } },
  { word: 'LEGEND', syllables: 2, options: ['FABLE', 'LOCKET', 'DONKEY'], answers: { meaning: 'FABLE', letter: 'LOCKET', syllables: 'DONKEY' } },
  { word: 'QUIVER', syllables: 2, options: ['SHIVER', 'QUARRY', 'BONNET'], answers: { meaning: 'SHIVER', letter: 'QUARRY', syllables: 'BONNET' } },
  { word: 'SIGNAL', syllables: 2, options: ['BEACON', 'SADDLE', 'MUFFIN'], answers: { meaning: 'BEACON', letter: 'SADDLE', syllables: 'MUFFIN' } },
  { word: 'PILLAR', syllables: 2, options: ['COLUMN', 'POCKET', 'BUTLER'], answers: { meaning: 'COLUMN', letter: 'POCKET', syllables: 'BUTLER' } },
  { word: 'GOBLET', syllables: 2, options: ['CHALICE', 'GRAVEL', 'MUFFIN'], answers: { meaning: 'CHALICE', letter: 'GRAVEL', syllables: 'MUFFIN' } },
  { word: 'SPIRIT', syllables: 2, options: ['PHANTOM', 'SOCKET', 'WANDER'], answers: { meaning: 'PHANTOM', letter: 'SOCKET', syllables: 'WANDER' } },
  { word: 'BASKET', syllables: 2, options: ['HAMPER', 'BONFIRE', 'VELVET'], answers: { meaning: 'HAMPER', letter: 'BONFIRE', syllables: 'VELVET' } },
  { word: 'PARROT', syllables: 2, options: ['MACAW', 'PISTON', 'CASTLE'], answers: { meaning: 'MACAW', letter: 'PISTON', syllables: 'CASTLE' } },
  { word: 'DAGGER', syllables: 2, options: ['BLADE', 'DONKEY', 'RUSTLE'], answers: { meaning: 'BLADE', letter: 'DONKEY', syllables: 'RUSTLE' } },
  { word: 'RAPTOR', syllables: 2, options: ['PREDATOR', 'RIDDLE', 'MUSTARD'], answers: { meaning: 'PREDATOR', letter: 'RIDDLE', syllables: 'MUSTARD' } },
  { word: 'WHISTLE', syllables: 2, options: ['FLUTE', 'WALNUT', 'BARREL'], answers: { meaning: 'FLUTE', letter: 'WALNUT', syllables: 'BARREL' } },
];

export function getShuffledWordSet(count: number = 20): WordTrial[] {
  const arr = [...WORD_LIBRARY];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}
