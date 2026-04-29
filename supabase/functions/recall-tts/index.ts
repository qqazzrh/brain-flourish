import { corsHeaders } from "jsr:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { text, voiceId } = await req.json();
    if (!text || typeof text !== "string" || text.length > 5000) {
      return new Response(JSON.stringify({ error: "Invalid text" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const voice = voiceId || "EXAVITQu4vr4xnSDxMaL"; // Sarah

    const elResp = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
            style: 0.2,
            use_speaker_boost: true,
            speed: 1.0,
          },
        }),
      }
    );

    if (!elResp.ok) {
      const errText = await elResp.text();
      console.error("ElevenLabs error", elResp.status, errText);
      return new Response(JSON.stringify({ error: `ElevenLabs ${elResp.status}: ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audio = await elResp.arrayBuffer();
    return new Response(audio, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "audio/mpeg" },
    });
  } catch (err) {
    console.error("recall-tts error", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});