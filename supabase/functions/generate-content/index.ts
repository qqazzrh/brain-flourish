import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callAI(system: string, prompt: string, apiKey: string): Promise<string> {
  const resp = await fetch(AI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`AI error ${resp.status}: ${t}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "";
}

function extractJSON(text: string): any {
  // Try to extract JSON from markdown code blocks or raw text
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
  return JSON.parse(jsonStr);
}

const DOMAINS = [
  "Adventure", "Festival", "Discovery", "Celebration", "Mystery", "Rescue",
  "Competition", "Reunion", "Invention", "Migration", "Performance", "Expedition",
  "Transformation", "Charity", "Heritage", "Survival", "Romance", "Pilgrimage",
  "Science", "Sports", "Art", "Music", "Nature", "Travel", "Food", "History",
  "Technology", "Community", "Wildlife", "Architecture", "Ocean", "Space",
  "Garden", "Market", "School", "Hospital", "Farm", "Theater", "Library", "Workshop"
];

const DISTRACTION_CATS = [
  { category: "Animals", letter: "S" }, { category: "Vegetables", letter: "B" },
  { category: "Countries", letter: "M" }, { category: "Occupations", letter: "T" },
  { category: "Fruits", letter: "P" }, { category: "Cities", letter: "L" },
  { category: "Sports", letter: "C" }, { category: "Musical Instruments", letter: "D" },
  { category: "Kitchen Items", letter: "F" }, { category: "Clothing Items", letter: "S" },
  { category: "Trees", letter: "O" }, { category: "Birds", letter: "R" },
  { category: "Flowers", letter: "L" }, { category: "Tools", letter: "W" },
  { category: "Drinks", letter: "C" }, { category: "Desserts", letter: "M" },
  { category: "Furniture", letter: "B" }, { category: "Vehicles", letter: "C" },
  { category: "Spices", letter: "C" }, { category: "Insects", letter: "B" },
  { category: "Reptiles", letter: "C" }, { category: "Metals", letter: "S" },
  { category: "Fabrics", letter: "S" }, { category: "Dog Breeds", letter: "G" },
  { category: "Rivers", letter: "N" }, { category: "Fish", letter: "T" },
  { category: "Dances", letter: "T" }, { category: "Cheeses", letter: "P" },
  { category: "Grains", letter: "R" }, { category: "Board Games", letter: "C" },
];

async function generatePassageBatch(
  startIdx: number,
  count: number,
  apiKey: string
): Promise<Array<{ passage: any; distraction: any; distractionOptions: any }>> {
  const results: Array<{ passage: any; distraction: any; distractionOptions: any }> = [];

  for (let i = 0; i < count; i++) {
    const idx = startIdx + i;
    const domain = DOMAINS[idx % DOMAINS.length];
    const formId = String(idx + 1);
    const distCat = DISTRACTION_CATS[idx % DISTRACTION_CATS.length];

    const passagePrompt = `Generate a single recall test passage for a cognitive assessment.

Requirements:
- Domain/theme: ${domain}
- A vivid, engaging short story of approximately 120 words
- Must contain EXACTLY 20 scoreable memory units across these categories:
  * WHO (3-4 units): character names, occupations, relationships
  * WHAT (5-6 units): key actions, objects, events
  * WHERE (3-4 units): specific locations, places
  * WHEN (2-3 units): times, dates, days of week
  * SPECIFIC (3-4 units): exact numbers, measurements, precise details
- Use diverse cultures, settings, character backgrounds
- Include specific numbers, proper nouns, and vivid details

Return ONLY valid JSON (no markdown):
{
  "passage_text": "...",
  "word_count": 120,
  "scoreable_units": [
    {"unit_id": 1, "category": "WHO", "label": "Character Name", "accepted_variants": ["variant1", "variant2"]},
    ...exactly 20 units
  ]
}`;

    try {
      const passageRaw = await callAI(
        "You are a cognitive assessment content generator. Output ONLY valid JSON, no markdown.",
        passagePrompt,
        apiKey
      );
      const passageData = extractJSON(passageRaw);

      // Generate distraction valid options
      const distPrompt = `Generate 12-18 valid answers for this semantic fluency category:
Category: ${distCat.category}
Starting letter: ${distCat.letter}

Each answer must be a commonly known item in "${distCat.category}" that starts with the letter "${distCat.letter}".

Return ONLY valid JSON (no markdown):
{"validOptions": ["Option1", "Option2", ...]}`;

      const distRaw = await callAI(
        "Output ONLY valid JSON, no markdown.",
        distPrompt,
        apiKey
      );
      const distData = extractJSON(distRaw);

      results.push({
        passage: {
          form_id: formId,
          domain,
          word_count: passageData.word_count || 120,
          fk_grade: 12.5,
          emotional_valence_mean: 0.3,
          passage_text: passageData.passage_text,
          scoreable_units: passageData.scoreable_units,
        },
        distraction: {
          form_id: formId,
          category: distCat.category,
          letter: distCat.letter,
          expected_valid_range: [6, 16],
          instruction_template: `Name as many {category} as you can think of that begin with the letter {letter}.`,
        },
        distractionOptions: {
          form_id: formId,
          category: distCat.category,
          instruction: `For the next 90 seconds, I want you to name as many ${distCat.category.toLowerCase()} as you can that begin with the letter ${distCat.letter}. Speak out loud. Keep going until I tell you to stop. Start whenever you're ready.`,
          valid_options: distData.validOptions || [],
        },
      });

      console.log(`Generated passage ${formId} (${domain})`);
    } catch (e) {
      console.error(`Failed to generate passage ${formId}:`, e);
    }
  }

  return results;
}

async function generateWordTrialsBatch(
  count: number,
  existingWords: string[],
  apiKey: string
): Promise<any[]> {
  const prompt = `Generate ${count} word trials for a cognitive Category Switching test.

RULES (CRITICAL):
1. Each trial has a STIMULUS word (uppercase) and exactly 3 OPTIONS (uppercase)
2. For "meaning" rule: exactly 1 option is a SYNONYM or closely related word
3. For "letter" rule: exactly 1 option starts with the SAME FIRST LETTER as the stimulus
4. For "syllables" rule: exactly 1 option has the SAME NUMBER OF SYLLABLES as the stimulus
5. These three correct answers MUST be three DIFFERENT options (no overlap!)
6. The meaning-answer and letter-answer must NOT share the stimulus syllable count
7. All words should be common English nouns (uppercase)

Mix: ~20% 1-syllable, ~60% 2-syllable, ~20% 3-syllable stimulus words.
Do NOT use any of these words as stimuli: ${existingWords.slice(0, 50).join(", ")}

Return ONLY valid JSON (no markdown):
{"trials": [
  {"word": "FOREST", "syllables": 2, "options": ["WOODS", "FLAME", "PUPPET"], "answers": {"meaning": "WOODS", "letter": "FLAME", "syllables": "PUPPET"}},
  ...
]}`;

  const raw = await callAI(
    "You are a linguistic content generator. Output ONLY valid JSON. Be precise about syllable counts.",
    prompt,
    apiKey
  );
  const data = extractJSON(raw);
  return data.trials || data || [];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { type, batchSize = 5, startFrom = 0 } = body;

    if (type === "passages") {
      // Check how many already exist
      const { count } = await supabase.from("recall_passages").select("*", { count: "exact", head: true });
      const existing = count || 0;
      const actualStart = startFrom || existing;

      console.log(`Generating ${batchSize} passages starting from ${actualStart}`);
      const results = await generatePassageBatch(actualStart, batchSize, LOVABLE_API_KEY);

      let inserted = 0;
      for (const r of results) {
        const { error: pErr } = await supabase.from("recall_passages").upsert(r.passage, { onConflict: "form_id" });
        if (pErr) console.error("Insert passage error:", pErr);
        else inserted++;

        const { error: dErr } = await supabase.from("distraction_options").upsert({
          form_id: r.distractionOptions.form_id,
          category: r.distractionOptions.category,
          letter: r.distraction.letter,
          instruction: r.distractionOptions.instruction,
          valid_options: r.distractionOptions.valid_options,
          expected_valid_range: r.distraction.expected_valid_range,
        }, { onConflict: "form_id" });
        if (dErr) console.error("Insert distraction error:", dErr);
      }

      return new Response(JSON.stringify({
        success: true,
        generated: results.length,
        inserted,
        totalPassages: existing + inserted,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "word_trials") {
      const { data: existingTrials } = await supabase.from("word_trials").select("word");
      const existingWords = (existingTrials || []).map((t: any) => t.word);

      console.log(`Generating ${batchSize} word trials (${existingWords.length} existing)`);
      const trials = await generateWordTrialsBatch(batchSize, existingWords, LOVABLE_API_KEY);

      let inserted = 0;
      for (const t of trials) {
        const { error } = await supabase.from("word_trials").insert({
          word: t.word,
          syllables: t.syllables,
          options: t.options,
          answers: t.answers,
        });
        if (error) {
          console.error("Insert trial error:", error);
        } else {
          inserted++;
        }
      }

      return new Response(JSON.stringify({
        success: true,
        generated: trials.length,
        inserted,
        totalTrials: existingWords.length + inserted,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "status") {
      const { count: pCount } = await supabase.from("recall_passages").select("*", { count: "exact", head: true });
      const { count: dCount } = await supabase.from("distraction_options").select("*", { count: "exact", head: true });
      const { count: wCount } = await supabase.from("word_trials").select("*", { count: "exact", head: true });

      return new Response(JSON.stringify({
        passages: pCount || 0,
        distractions: dCount || 0,
        wordTrials: wCount || 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid type. Use 'passages', 'word_trials', or 'status'" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
