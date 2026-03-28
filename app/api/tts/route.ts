import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const apiKey = process.env.GHANANLP_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "TTS service not configured" },
      { status: 503 }
    )
  }

  let text: string
  try {
    const body = await req.json()
    text = body.text
    if (typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "text is required and must be a non-empty string" },
        { status: 400 }
      )
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  // GhanaNLP has a character limit — truncate to 500 chars
  const safeText = text.trim().slice(0, 500)

  let ghanaNlpRes: Response
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
        body: JSON.stringify({ text: safeText, language: "tw" }),
      }
    )
  } catch {
    return NextResponse.json(
      { error: "TTS upstream request failed" },
      { status: 502 }
    )
  }

  if (!ghanaNlpRes.ok) {
    return NextResponse.json(
      { error: `TTS generation failed: ${ghanaNlpRes.status}` },
      { status: 502 }
    )
  }

  const audioBuffer = await ghanaNlpRes.arrayBuffer()

  return new NextResponse(audioBuffer, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  })
}
