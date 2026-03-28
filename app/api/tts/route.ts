import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const TRANSLATION_URL = "https://translation-api.ghananlp.org/v1/translate"
const TTS_URL = "https://translation-api.ghananlp.org/tts/v2/synthesize"

const LANG_CONFIG: Record<string, { translationPair: string; ttsLanguage: string }> = {
  tw:  { translationPair: "en-tw",  ttsLanguage: "twi" },
  gaa: { translationPair: "en-gaa", ttsLanguage: "gaa" },
  ee:  { translationPair: "en-ee",  ttsLanguage: "ewe" },
  fat: { translationPair: "en-fat", ttsLanguage: "fante" },
  dag: { translationPair: "en-dag", ttsLanguage: "dag" },
}

function getApiKeys() {
  const primary = process.env.GHANANLP_API_KEY
  const secondary = process.env.GHANANLP_API_KEY_SECONDARY
  if (!primary && !secondary) return null
  return [primary, secondary].filter(Boolean) as string[]
}

function ghanaNlpHeaders(apiKey: string) {
  return {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Ocp-Apim-Subscription-Key": apiKey,
  }
}

async function fetchWithFallback(
  url: string,
  body: string,
  keys: string[],
): Promise<Response> {
  let lastError: Error | null = null

  for (const key of keys) {
    const response = await fetch(url, {
      method: "POST",
      headers: ghanaNlpHeaders(key),
      body,
    })
    if (response.ok || response.status < 500) return response
    lastError = new Error(`API returned ${response.status}`)
  }

  throw lastError ?? new Error("All API keys exhausted.")
}

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
        { status: 400 },
      )
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const config = LANG_CONFIG[language] ?? LANG_CONFIG.tw!

  const safeText = text.trim().slice(0, 1000)

  try {
    const translateRes = await fetchWithFallback(
      TRANSLATION_URL,
      JSON.stringify({ in: safeText, lang: config.translationPair }),
      keys,
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
