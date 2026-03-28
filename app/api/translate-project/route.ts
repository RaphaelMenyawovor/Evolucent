import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const LANGUAGE_PROMPTS: Record<string, string> = {
  English:
    "Summarize this civic project in clear, simple English that any citizen can understand. Keep it under 120 words. Be direct and factual.",
  Twi: "Translate and summarize this civic project into Akan Twi (as spoken in Ghana). Use simple everyday Twi that ordinary Ghanaians understand. Keep it under 120 words. Start directly in Twi.",
  Ewe: "Translate and summarize this civic project into Ewe (as spoken in the Volta Region of Ghana). Use simple conversational Ewe. Keep it under 120 words. Start directly in Ewe.",
  Ga: "Translate and summarize this civic project into Ga (as spoken in Greater Accra, Ghana). Use simple everyday Ga. Keep it under 120 words. Start directly in Ga.",
  Dagbani:
    "Translate and summarize this civic project into Dagbani (as spoken in Northern Ghana). Use simple conversational Dagbani. Keep it under 120 words. Start directly in Dagbani.",
  Fante:
    "Translate and summarize this civic project into Fante (as spoken in the Central Region of Ghana). Use simple everyday Fante. Keep it under 120 words. Start directly in Fante.",
};

const ALLOWED = new Set(Object.keys(LANGUAGE_PROMPTS));

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Translation service is not configured.", text: "" },
      { status: 503 }
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
    return NextResponse.json({ error: "Unsupported language", text: "" }, { status: 400 });
  }

  const projectContext = `
Project: ${projectTitle}
Region: ${projectRegion}
Description: ${projectDescription}
Funding: GHS ${amountRaised} raised of GHS ${targetAmount} target
`;

  const prompt = LANGUAGE_PROMPTS[language];
  const model =
    process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model,
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `${prompt}\n\nProject details:\n${projectContext}`,
        },
      ],
    });

    const block = message.content[0];
    const text = block?.type === "text" ? block.text : "";

    return NextResponse.json({ text, language });
  } catch (e) {
    console.error("[translate-project]", e);
    return NextResponse.json(
      { error: "Translation failed", text: "" },
      { status: 502 }
    );
  }
}
