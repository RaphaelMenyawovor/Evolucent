import { NextRequest, NextResponse } from "next/server";

const TRANSLATION_URL = "https://translation-api.ghananlp.org/v1/translate";

const LANG_PAIRS: Record<string, string> = {
  English: "",
  Twi: "en-tw",
  Ewe: "en-ee",
  Ga: "en-gaa",
  Dagbani: "en-dag",
  Fante: "en-fat",
};

const ALLOWED = new Set(Object.keys(LANG_PAIRS));

function getApiKeys() {
  const primary = process.env.GHANANLP_API_KEY;
  const secondary = process.env.GHANANLP_API_KEY_SECONDARY;
  if (!primary && !secondary) return null;
  return [primary, secondary].filter(Boolean) as string[];
}

async function translateWithFallback(
  text: string,
  langPair: string,
  keys: string[],
): Promise<string> {
  let lastError: Error | null = null;

  for (const key of keys) {
    const res = await fetch(TRANSLATION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": key,
      },
      body: JSON.stringify({ in: text, lang: langPair }),
    });

    if (res.ok) return res.text();
    if (res.status < 500) {
      throw new Error(`Translation API returned ${res.status}`);
    }
    lastError = new Error(`Translation API returned ${res.status}`);
  }

  throw lastError ?? new Error("All API keys exhausted.");
}

export async function POST(req: NextRequest) {
  const keys = getApiKeys();
  if (!keys) {
    return NextResponse.json(
      { error: "Translation service is not configured.", text: "" },
      { status: 503 },
    );
  }

  let body: {
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

  if (language === "English") {
    const summary =
      `${projectTitle}. ${projectRegion}. ` +
      `${projectDescription} ` +
      `GHS ${amountRaised.toLocaleString()} raised of GHS ${targetAmount.toLocaleString()} target.`;
    return NextResponse.json({ text: summary, language });
  }

  const langPair = LANG_PAIRS[language]!;
  const sourceText =
    `${projectTitle}. ${projectDescription} ` +
    `${amountRaised.toLocaleString()} cedis raised of ${targetAmount.toLocaleString()} cedis target.`;

  try {
    const translated = await translateWithFallback(
      sourceText.slice(0, 1000),
      langPair,
      keys,
    );
    return NextResponse.json({ text: translated, language });
  } catch (e) {
    console.error("[translate-project]", e);
    return NextResponse.json(
      { error: "Translation failed", text: "" },
      { status: 502 },
    );
  }
}
