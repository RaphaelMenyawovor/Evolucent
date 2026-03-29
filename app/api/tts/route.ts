import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/** Valid GhanaNLP TTS language codes */
const TTS_LANGS = new Set(["tw", "ee", "gaa", "dag", "fat"]);

export async function POST(req: NextRequest) {
  const apiKey = process.env.GHANANLP_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TTS service not configured" },
      { status: 503 },
    );
  }

  let text: string;
  let language: string;

  try {
    const body = await req.json();
    text = body.text;
    language = body.language ?? "tw";

    if (typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    if (!TTS_LANGS.has(language)) {
      return NextResponse.json(
        {
          error: `Unsupported TTS language: ${language}. Supported: ${[...TTS_LANGS].join(", ")}`,
        },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const safeText = text.trim().slice(0, 1000);

  try {
    console.log(`[tts] Generating speech for text length: ${safeText.length}, language: ${language}`);
    
    // v1 TTS API endpoint for GhanaNLP
    const res = await fetch("https://translation-api.ghananlp.org/tts/v1/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
      },
      body: JSON.stringify({ text: safeText, language }),
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        console.error("[tts] GhanaNLP Authentication failed.");
        return NextResponse.json(
          { error: "TTS service authentication failed. Check API keys." },
          { status: res.status },
        );
      }
      const data = await res.text();
      console.error(`[tts] GhanaNLP TTS API error (${res.status}): ${data}`);
      return NextResponse.json(
        { error: `TTS service error: ${res.status}` },
        { status: 502 },
      );
    }

    const audioBuffer = await res.arrayBuffer();

    // Respond with the audio buffer as a WAV file
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=3600",
        "X-Generated-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (e) {
    console.error("[tts] Fetch failure:", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { error: "Failed to connect to TTS upstream service." },
      { status: 502 },
    );
  }
}
