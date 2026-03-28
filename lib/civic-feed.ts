import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "node:crypto";
import Parser from "rss-parser";

import {
  CIVIC_CONCERN_FALLBACK_IMAGES,
  type CivicFallbackKey,
} from "@/lib/civic-feed-images";

export type CivicConcern =
  | "infrastructure"
  | "health"
  | "education"
  | "economy"
  | "governance"
  | "environment"
  | "safety"
  | "other";

export type CivicFeedPost = {
  id: string;
  title: string;
  body: string;
  link: string;
  publishedAt: Date;
  sourceLabel: string;
  concern: CivicConcern;
  aiEnhanced: boolean;
  /** Image from RSS / article HTML when found */
  imageFromFeed: boolean;
  /** Best URL to show first (feed image if any, else thematic fallback) */
  displayImageUrl: string;
  /** Thematic Unsplash URL for broken primary */
  fallbackImageUrl: string;
};

const FEEDS: { url: string; mode: "google" | "standard" }[] = [
  {
    url: "https://news.google.com/rss/search?q=Ghana&hl=en&gl=GH&ceid=GH:en",
    mode: "google",
  },
  {
    url: "https://news.google.com/rss/search?q=Ghana+infrastructure+OR+Ghana+health+OR+Ghana+education&hl=en&gl=GH&ceid=GH:en",
    mode: "google",
  },
  {
    url: "https://citinewsroom.com/feed/",
    mode: "standard",
  },
  {
    url: "https://www.myjoyonline.com/feed/",
    mode: "standard",
  },
  {
    url: "https://www.graphic.com.gh/feed/",
    mode: "standard",
  },
  {
    url: "https://www.modernghana.com/rssfeed/news/rss.xml",
    mode: "standard",
  },
];

export const CIVIC_FEED_MAX_STORIES = 48;
const MAX_ITEMS = CIVIC_FEED_MAX_STORIES;
const AI_ROW_CAP = 28;

export const CIVIC_FEED_SOURCE_COUNT = FEEDS.length;

const CONCERNS: CivicConcern[] = [
  "infrastructure",
  "health",
  "education",
  "economy",
  "governance",
  "environment",
  "safety",
  "other",
];

const parser = new Parser({
  timeout: 14_000,
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
    ],
  },
  requestOptions: {
    headers: {
      "User-Agent":
        "EvolucentCivicFeed/1.0 (+https://evolucent.app; civic news aggregation)",
    },
  },
});

function stableId(link: string): string {
  return createHash("sha256").update(link).digest("hex").slice(0, 24);
}

function splitGoogleTitle(raw: string): { headline: string; outlet: string } {
  const idx = raw.lastIndexOf(" - ");
  if (idx === -1) return { headline: raw.trim(), outlet: "News" };
  return {
    headline: raw.slice(0, idx).trim(),
    outlet: raw.slice(idx + 3).trim() || "News",
  };
}

function normalizeConcern(raw: string): CivicConcern {
  const x = raw.toLowerCase().trim() as CivicConcern;
  return CONCERNS.includes(x) ? x : "other";
}

function concernFallbackUrl(concern: CivicConcern): string {
  const key = concern as CivicFallbackKey;
  return (
    CIVIC_CONCERN_FALLBACK_IMAGES[key] ?? CIVIC_CONCERN_FALLBACK_IMAGES.other
  );
}

function guessConcern(text: string): CivicConcern {
  const t = text.toLowerCase();
  if (
    /hospital|health|malaria|cholera|clinic|doctor|nurse|nhis|disease|vaccin/.test(
      t,
    )
  ) {
    return "health";
  }
  if (
    /school|university|education|student|teacher|textbook|waec|shs|jhs|campus/.test(
      t,
    )
  ) {
    return "education";
  }
  if (
    /road|bridge|flood|drain|water\s+supply|power\s+outage|energy|electric|dam|rail/.test(
      t,
    )
  ) {
    return "infrastructure";
  }
  if (/cedi|economy|inflation|imf|trade|business|market|bank|loan/.test(t)) {
    return "economy";
  }
  if (
    /election|parliament|minister|government|corruption|court|president|mp\s|constitution/.test(
      t,
    )
  ) {
    return "governance";
  }
  if (/climate|environment|forest|galamsey|pollution|plastic|waste/.test(t)) {
    return "environment";
  }
  if (/crime|security|police|robbery|kidnap|accident|fire|violence/.test(t)) {
    return "safety";
  }
  return "other";
}

function firstImgFromHtml(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  const s = m?.[1]?.trim();
  return s || null;
}

function absolutize(src: string, baseUrl: string): string {
  try {
    if (src.startsWith("http")) return src;
    if (src.startsWith("//")) return `https:${src}`;
    return new URL(src, baseUrl).href;
  } catch {
    return src;
  }
}

function pickMediaUrl(item: Record<string, unknown>): string | null {
  const thumb = item.mediaThumbnail;
  if (Array.isArray(thumb) && thumb[0] && typeof thumb[0] === "object") {
    const u = (thumb[0] as { $?: { url?: string } }).$?.url;
    if (u) return u;
  }
  if (thumb && typeof thumb === "object" && "$" in thumb) {
    const u = (thumb as { $?: { url?: string } }).$?.url;
    if (u) return u;
  }

  const content = item.mediaContent;
  if (Array.isArray(content)) {
    for (const c of content) {
      if (!c || typeof c !== "object") continue;
      const node = c as { $?: { url?: string; medium?: string } };
      const url = node.$?.url;
      const medium = node.$?.medium;
      if (url && (medium === "image" || medium === undefined || !medium)) {
        return url;
      }
    }
  }
  return null;
}

function extractImageUrl(
  item: Parser.Item,
  link: string,
): string | null {
  const rec = item as Record<string, unknown>;

  const enc = item.enclosure;
  if (enc?.url) {
    const type = enc.type ?? "";
    if (
      type.startsWith("image") ||
      /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(enc.url)
    ) {
      return absolutize(enc.url, link);
    }
  }

  const media = pickMediaUrl(rec);
  if (media) return absolutize(media, link);

  const encoded =
    (rec["content:encoded"] as string | undefined) ?? item.content;
  const summary = item.summary;
  for (const html of [encoded, summary]) {
    if (typeof html === "string" && html.includes("<img")) {
      const raw = firstImgFromHtml(html);
      if (raw) return absolutize(raw, link);
    }
  }

  return null;
}

function parseJsonArrayFromAssistant(text: string): unknown[] {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
  }
  const parsed = JSON.parse(t) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Assistant response is not a JSON array");
  }
  return parsed;
}

type RawRow = {
  i: number;
  title: string;
  snippet: string;
  link: string;
  publishedAt: Date;
  outlet: string;
  feedImageUrl: string | null;
};

async function enrichRowsWithAI(rows: RawRow[]): Promise<
  Map<number, { headline: string; post: string; concern: CivicConcern }>
> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const capped = rows.slice(0, AI_ROW_CAP);
  if (!apiKey || capped.length === 0) {
    return new Map();
  }

  const model =
    process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";

  const payload = capped.map((r) => ({
    i: r.i,
    title: r.title,
    snippet: r.snippet.slice(0, 450),
  }));

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model,
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: `You help Evolucent, a Ghana civic transparency platform. Below is JSON of recent news headlines/snippets about Ghana (from public RSS).

Return ONLY a valid JSON array (no markdown fences, no commentary). One object per input row, same order, same "i" index as input.

Each object must be exactly:
{"i": number, "headline": string (max 90 chars, punchy for a social feed), "post": string (max 260 chars, plain English, 1–2 short sentences; focus on how this affects ordinary citizens or public life when relevant; stay strictly factual—do not invent details not supported by the snippet), "concern": one of infrastructure, health, education, economy, governance, environment, safety, other}

If a story is not clearly about public/civic life, still summarise the headline neutrally.

Input:
${JSON.stringify(payload)}`,
      },
    ],
  });

  const block = message.content[0];
  const text = block?.type === "text" ? block.text : "";
  if (!text) return new Map();

  let arr: unknown[];
  try {
    arr = parseJsonArrayFromAssistant(text);
  } catch {
    return new Map();
  }

  const out = new Map<
    number,
    { headline: string; post: string; concern: CivicConcern }
  >();

  for (const row of arr) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const i = typeof o.i === "number" ? o.i : Number(o.i);
    if (!Number.isInteger(i)) continue;
    const headline =
      typeof o.headline === "string" ? o.headline : "";
    const post = typeof o.post === "string" ? o.post : "";
    const concern = normalizeConcern(
      typeof o.concern === "string" ? o.concern : "other",
    );
    if (headline && post) {
      out.set(i, { headline, post, concern });
    }
  }

  return out;
}

type ParsedFeedItem = {
  link: string;
  headline: string;
  outlet: string;
  snippet: string;
  publishedAt: Date;
  feedImageUrl: string | null;
};

function mapFeedItems(
  feed: Awaited<ReturnType<typeof parser.parseURL>>,
  mode: "google" | "standard",
  fetchedAt: Date,
): ParsedFeedItem[] {
  const channelTitle = feed.title?.trim() || "News";
  const out: ParsedFeedItem[] = [];

  for (const it of feed.items ?? []) {
    const link = it.link?.trim();
    const titleRaw = it.title?.trim();
    if (!link || !titleRaw) continue;

    let headline: string;
    let outlet: string;
    if (mode === "google") {
      const s = splitGoogleTitle(titleRaw);
      headline = s.headline;
      outlet = s.outlet;
    } else {
      headline = titleRaw.replace(/<[^>]+>/g, "").trim();
      outlet =
        (typeof it.creator === "string" && it.creator.trim()) || channelTitle;
    }

    const rec = it as unknown as Record<string, unknown>;
    const encoded =
      typeof rec["content:encoded"] === "string"
        ? rec["content:encoded"]
        : undefined;
    const htmlSnippet = encoded ?? it.content ?? it.summary;
    const plain =
      typeof htmlSnippet === "string"
        ? htmlSnippet.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
        : "";
    const snippet =
      plain ||
      it.contentSnippet?.trim() ||
      headline;

    const publishedAt = it.pubDate
      ? new Date(it.pubDate)
      : it.isoDate
        ? new Date(it.isoDate)
        : fetchedAt;

    const feedImageUrl = extractImageUrl(it, link);

    out.push({
      link,
      headline,
      outlet,
      snippet,
      publishedAt,
      feedImageUrl,
    });
  }

  return out;
}

export async function getCivicFeed(): Promise<{
  posts: CivicFeedPost[];
  fetchedAt: Date;
  source: "rss+ai" | "rss";
  error?: string;
  feedsLoaded: number;
}> {
  const fetchedAt = new Date();

  const results = await Promise.allSettled(
    FEEDS.map((f) => parser.parseURL(f.url)),
  );

  const merged: ParsedFeedItem[] = [];
  let feedsLoaded = 0;
  const errors: string[] = [];

  results.forEach((res, idx) => {
    if (res.status === "fulfilled" && res.value?.items?.length) {
      feedsLoaded += 1;
      merged.push(
        ...mapFeedItems(res.value, FEEDS[idx].mode, fetchedAt),
      );
    } else if (res.status === "rejected") {
      errors.push(
        `${FEEDS[idx].url}: ${res.reason instanceof Error ? res.reason.message : "failed"}`,
      );
    }
  });

  if (merged.length === 0) {
    return {
      posts: [],
      fetchedAt,
      source: "rss",
      feedsLoaded: 0,
      error:
        errors.join(" · ") || "No feeds returned items (all sources failed).",
    };
  }

  const byLink = new Map<string, ParsedFeedItem>();
  for (const item of merged) {
    const existing = byLink.get(item.link);
    if (!existing || item.publishedAt > existing.publishedAt) {
      byLink.set(item.link, item);
    }
  }

  const deduped = [...byLink.values()].sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
  );

  const sliced = deduped.slice(0, MAX_ITEMS);

  const rows: RawRow[] = sliced.map((p, i) => ({
    i,
    title: p.headline,
    snippet: p.snippet,
    link: p.link,
    publishedAt: p.publishedAt,
    outlet: p.outlet,
    feedImageUrl: p.feedImageUrl,
  }));

  const enriched = await enrichRowsWithAI(rows);

  const posts: CivicFeedPost[] = rows.map((r) => {
    const ai = enriched.get(r.i);
    const aiEnhanced = Boolean(ai);
    const title = ai?.headline ?? r.title;
    const body =
      ai?.post ??
      (r.snippet.length > 280 ? `${r.snippet.slice(0, 277)}…` : r.snippet);
    const concern = ai?.concern ?? guessConcern(`${r.title} ${r.snippet}`);

    const fallbackImageUrl = concernFallbackUrl(concern);
    const imageFromFeed = Boolean(r.feedImageUrl);
    const displayImageUrl = r.feedImageUrl ?? fallbackImageUrl;

    return {
      id: stableId(r.link),
      title,
      body,
      link: r.link,
      publishedAt: r.publishedAt,
      sourceLabel: r.outlet,
      concern,
      aiEnhanced,
      imageFromFeed,
      displayImageUrl,
      fallbackImageUrl,
    };
  });

  return {
    posts,
    fetchedAt,
    source: enriched.size > 0 ? "rss+ai" : "rss",
    feedsLoaded,
  };
}
