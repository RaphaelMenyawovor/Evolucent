import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { CivicFeedPostCard } from "@/components/civic-feed-post";
import {
  CIVIC_FEED_MAX_STORIES,
  CIVIC_FEED_SOURCE_COUNT,
  getCivicFeed,
} from "@/lib/civic-feed";

export const metadata: Metadata = {
  title: "Civic feed | Evolucent",
  description:
    "Latest Ghana headlines reframed for citizens — see what is happening across the country.",
};

const getCachedFeed = unstable_cache(
  async () => getCivicFeed(),
  ["civic-feed-v2"],
  { revalidate: 600 },
);

export default async function FeedPage() {
  const { posts, fetchedAt: rawFetchedAt, source, error, feedsLoaded } =
    await getCachedFeed();
  const fetchedAt = new Date(rawFetchedAt);

  return (
    <div className="min-h-screen bg-evolucent-off-white">
      <section className="border-b border-evolucent-sand bg-evolucent-black px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-gold">
            Civic radar
          </p>
          <h1 className="mb-3 font-display text-3xl font-extrabold tracking-tight text-evolucent-off-white sm:text-4xl">
            What&apos;s happening in Ghana
          </h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-[#a8a49c]">
            A living feed of public-interest stories — aggregated from open news
            sources and, when configured, shortened into citizen-friendly posts
            so you can spot problems and conversations worth your attention.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-[#a8a49c]">
            <span className="rounded-full border border-white/15 px-3 py-1">
              Refreshes about every 10 minutes
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              {source === "rss+ai" ? "Headlines + AI briefs" : "Headlines only"}
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              Up to {CIVIC_FEED_MAX_STORIES} stories · {CIVIC_FEED_SOURCE_COUNT}{" "}
              feeds
              {posts.length > 0
                ? ` · ${feedsLoaded} loaded this cycle`
                : null}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {error && posts.length === 0 ? (
          <div
            className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center"
            role="alert"
          >
            <p className="font-semibold text-destructive">
              We couldn&apos;t load the news feed right now.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        ) : null}

        {posts.length > 0 ? (
          <ul className="flex flex-col gap-6">
            {posts.map((post) => (
              <li key={post.id}>
                <CivicFeedPostCard post={post} />
              </li>
            ))}
          </ul>
        ) : !error ? (
          <p className="text-center text-muted-foreground">
            No stories available yet. Try again shortly.
          </p>
        ) : null}

        <p className="mt-10 text-center text-[11px] leading-relaxed text-muted-foreground">
          Stories merge several Ghana-focused RSS feeds (including Google News
          and major local outlets). Images come from the article when the feed
          provides one; otherwise we show a thematic placeholder. AI summaries use
          your Anthropic key when set — always read the original outlet. Last
          cache refresh:{" "}
          <time dateTime={fetchedAt.toISOString()}>
            {fetchedAt.toLocaleString("en-GH", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </time>
          .
        </p>
      </div>
    </div>
  );
}
