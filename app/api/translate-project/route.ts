import { NextRequest, NextResponse } from "next/server";

/** Map display language name → GhanaNLP API language code */
const LANG_CODES: Record<string, string> = {
  Twi: "tw",
  Ewe: "ee",
  Ga: "gaa",
  Dagbani: "dag",
  Fante: "fat",
};

const ALLOWED = new Set(["English", ...Object.keys(LANG_CODES)]);

export async function POST(req: NextRequest) {
  const apiKey = process.env.GHANANLP_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Translation service not configured.", text: "" },
      { status: 503 }
    );
  }

  let body: {
    /** Raw text (used by KhayaAIPlayer — overrides project fields) */
    text?: string;
    projectTitle?: string;
    projectDescription?: string;
    projectRegion?: string;
    amountRaised?: number;
    targetAmount?: number;
    language?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON", text: "" }, { status: 400 });
  }

  const {
    text: rawText,
    projectTitle = "",
    projectDescription = "",
    projectRegion = "",
    amountRaised = 0,
    targetAmount = 0,
    language = "English",
  } = body;

  if (!ALLOWED.has(language)) {
    return NextResponse.json(
      { error: "Unsupported language", text: "" },
      { status: 400 },
    );
  }

  // Build source text — prefer explicit `text`, otherwise compose from project fields
  const sourceText = (
    rawText ??
    [
      projectTitle,
      projectRegion ? `Located in ${projectRegion}.` : "",
      projectDescription,
      amountRaised > 0
        ? `GHS ${amountRaised.toLocaleString()} raised of GHS ${targetAmount.toLocaleString()} target.`
        : "",
    ]
      .filter(Boolean)
      .join(" ")
  )
    .trim()
    .slice(0, 800); // GhanaNLP character limit

  // Return early if no text to translate
  if (!sourceText) {
    return NextResponse.json({ text: "", language, langCode: "en" });
  }

  // English — return the source text as-is, no API call needed
  if (language === "English") {
    return NextResponse.json({ text: sourceText, language, langCode: "en" });
  }

  const langCode = LANG_CODES[language];

  try {
    const res = await fetch("https://translation-api.ghananlp.org/v1/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
      },
      body: JSON.stringify({ in: "en", out: langCode, text: sourceText }),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`GhanaNLP translate HTTP ${res.status}`);
    }

    // GhanaNLP returns plain translated text
    const raw = await res.text();
    let translatedText: string;
    try {
      // Handle in case the API wraps the result in JSON
      const json = JSON.parse(raw) as Record<string, unknown>;
      translatedText =
        (json.translatedText as string) ??
        (json.text as string) ??
        raw;
    } catch {
      translatedText = raw;
    }

    return NextResponse.json({ text: translatedText.trim(), language, langCode });
  } catch (e) {
    console.error("[translate-project]", e);
    return NextResponse.json(
      { error: "Translation failed", text: "" },
      { status: 502 },
    );
  }
}
