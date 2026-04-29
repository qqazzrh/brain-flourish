## Add AI voice playback to the Recall passage screen

Add an optional **Play** button on the passage reading screen that uses **ElevenLabs** to read the passage aloud at a natural pace. The facilitator-led "READ ALOUD" instruction stays as a fallback.

### What changes

**1. ElevenLabs connection**
- Prompt to connect the ElevenLabs connector so `ELEVENLABS_API_KEY` is available to backend functions.

**2. New edge function `recall-tts`**
- Accepts `{ text, voiceId? }`, calls ElevenLabs `text-to-speech` (`eleven_turbo_v2_5`, mp3_44100_128) at natural speaking pace (default voice settings, speed 1.0).
- Returns raw MP3 bytes with proper CORS headers.
- Caches nothing server-side (passages are short, ~100 words).

**3. Update `src/components/recall/PassageDisplay.tsx`**
- Add a prominent **Play / Pause / Replay** button above the passage text.
- On click: invoke the edge function, receive MP3 blob, play via `new Audio(blob URL)`.
- Show loading spinner while the audio is being generated (first request takes ~1–2s).
- Button states: idle → "Play passage", loading → spinner + "Generating audio…", playing → "Pause", finished → "Replay".
- Cache the generated blob URL per passage so Replay is instant.
- Update the top banner from "READ ALOUD — ONE WORD PER SECOND" to "READ ALOUD — or tap Play to hear it" so the facilitator knows both options exist.
- Respect existing iOS audio unlock pattern (memory: AudioContext silent buffer unlock).

**4. Voice + pacing**
- Default voice: **Sarah** (`EXAVITQu4vr4xnSDxMaL`) — clear, neutral narration. (Easy to swap later.)
- Settings: `stability: 0.6`, `similarity_boost: 0.75`, `speed: 1.0` — natural conversational pace.

### Technical notes

- Audio is fetched as a Blob (`response.blob()`) — no base64 in JSON, to avoid corruption.
- Edge function uses `output_format=mp3_44100_128` as a **query param** (not body).
- `ELEVENLABS_API_KEY` is a runtime secret read in the function via `Deno.env.get`.
- No DB schema changes.

### Files touched

- `supabase/functions/recall-tts/index.ts` (new)
- `src/components/recall/PassageDisplay.tsx` (edit)

### Out of scope

- TTS for distraction prompts or other modules (can be added later using the same pattern).
- Word-by-word highlighting / karaoke sync.
- Pre-generating and storing audio in Supabase Storage.
