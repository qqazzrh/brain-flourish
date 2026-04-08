

# Plan: Generate 200+ Variations for Recall and Sharpness

## Current State

- **Recall Test**: 4 passage forms (A, B, C, D), each with a story, 20 scoreable units, and a distraction task. The `FormId` type is a union of `'A' | 'B' | 'C' | 'D'`.
- **Sharpness (Category Switch)**: 65 word trials in `word-library.ts`, each with a stimulus word, 3 options, and correct answers for meaning/letter/syllables rules.
- **Lock-In Test**: Uses procedurally generated sequences (infinite variations already) — no changes needed.

## Approach

### 1. Expand Recall Passages to 200+

**Problem**: The `FormId` type is hardcoded as `'A' | 'B' | 'C' | 'D'`. Expanding to 200 named forms is impractical with the current type system.

**Solution**: Change the content system to use numeric IDs while keeping the rotation logic. Each passage will have a unique numeric `form_id`, and the rotation function will cycle through them.

- **Generate content**: Use the AI gateway to batch-generate 200 unique recall passages. Each passage must follow the same structure: ~120 words, a vivid narrative, exactly 20 scoreable units across 5 categories (WHO, WHAT, WHERE, WHEN, SPECIFIC), with accepted variants.
- **Generate distraction tasks**: Generate 200 matching distraction tasks (semantic fluency categories with valid option lists).
- **Store as JSON**: Move content from hardcoded TypeScript to a large JSON data file (`src/lib/recall-passages.json` and `src/lib/distraction-data.json`) imported at build time.
- **Update types**: Change `FormId` from a string union to `string` (or keep as branded string). Update all references.
- **Update rotation**: `getNextFormForParticipant` will cycle through all 200+ forms using `sessions.length % totalForms`.

### 2. Expand Word Library to 200+

**Solution**: Use AI to generate 200+ word trials following the existing constraints:
- Each trial has a stimulus word, syllable count, 3 options
- Exactly 1 option matches meaning, 1 matches first letter, 1 matches syllable count
- For syllables rule: only 1 option shares syllable count with stimulus

- **Generate content**: Use AI gateway to batch-generate word trials in structured JSON format.
- **Validate**: Run a validation script to verify all constraints hold for every entry.
- **Replace**: Overwrite `word-library.ts` with the expanded set.

## Steps

1. **Update `FormId` type** — change from `'A' | 'B' | 'C' | 'D'` to `string` across all files that reference it
2. **Generate 200 recall passages** — use AI gateway in batches of ~10, outputting structured JSON with passage text and 20 scoreable units each
3. **Generate 200 distraction tasks** — categories with valid option lists, matched to passages
4. **Generate 200 word trials** — structured JSON with syllable/meaning/letter constraints
5. **Validate all generated content** — run constraint-checking scripts
6. **Replace content files** — update `content-library.ts`, `distraction-options.ts`, `word-library.ts` with the new data
7. **Update rotation logic** — `getNextFormForParticipant` cycles through all available forms dynamically
8. **Test** — verify forms load correctly and rotation works

## Technical Details

- AI generation will use `google/gemini-2.5-pro` for quality (complex structured output)
- Passages generated in batches of 10 to stay within context limits
- Each batch output validated before merging
- Word trials generated in batches of 25
- All content stored as TypeScript arrays/records (no runtime fetch needed)
- Total estimated generation: ~25 AI calls

## Files Changed

| File | Change |
|------|--------|
| `src/lib/types.ts` | `FormId` becomes `string` |
| `src/lib/content-library.ts` | Replace 4 passages with 200+ (array instead of Record) |
| `src/lib/distraction-options.ts` | Replace 4 tasks with 200+ |
| `src/lib/word-library.ts` | Replace 65 entries with 200+ |
| `src/lib/storage.ts` | Update rotation to use dynamic form count |
| `src/contexts/RecallContext.tsx` | Adapt to new form lookup |
| `src/contexts/SessionContext.tsx` | Adapt FormId type change |
| Several components | Minor type adjustments for `FormId` |

