import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

/** Valid GhanaNLP TTS language codes */
const TTS_LANGS = new Set(["tw", "ee", "gaa", "dag", "fat"])

export async function POST(req: NextRequest) {
  const keys = getApiKeys()
  if (!keys) {
    return NextResponse.json(
      { error: "TTS service not configured" },
      { status: 503 },
    )
  }

  let text: string
  let language: string
  try {
    const body = await req.json()
    text = body.text
    language = body.language ?? "tw"
    if (typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "text is required and must be a non-empty string" },
        { status: 400 }
      )
    }
    if (!TTS_LANGS.has(language)) {
      return NextResponse.json(
        { error: `Unsupported TTS language: ${language}. Supported: ${[...TTS_LANGS].join(", ")}` },
        { status: 400 }
      )
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const config = LANG_CONFIG[language] ?? LANG_CONFIG.tw!

  const safeText = text.trim().slice(0, 1000)

  try {
    ghanaNlpRes = await fetch(
      "https://translation-api.ghananlp.org/tts/v1/tts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "Ocp-Apim-Subscription-Key": apiKey,
        },
        body: JSON.stringify({ text: safeText, language }),
      }
    )

    if (!translateRes.ok) {
      return NextResponse.json(
        { error: `Translation failed: ${translateRes.status}` },
        { status: 502 },
      )
    }

    const translatedText = await translateRes.text()

    const ttsRes = await fetchWithFallback(
      TTS_URL,
      JSON.stringify({
        text: translatedText.trim(),
        language: config.ttsLanguage,
        speaker_id: "female",
        stream: true,
        format: "wav",
      }),
      keys,
    )

    if (!ttsRes.ok) {
      return NextResponse.json(
        { error: `TTS generation failed: ${ttsRes.status}` },
        { status: 502 },
      )
    }

    const audioBuffer = await ttsRes.arrayBuffer()

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=3600",
        "X-Translation": encodeURIComponent(translatedText.trim()),
      },
    })
  } catch {
    return NextResponse.json(
      { error: "TTS upstream request failed" },
      { status: 502 },
    )
  }
}
