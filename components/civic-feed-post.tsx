import Link from "next/link";
import { ClientRelativeTime } from "@/components/evolucent/client-relative-time";
import { FeedPostImage } from "@/components/feed-post-image";
import type { CivicConcern, CivicFeedPost } from "@/lib/civic-feed";
import { cn } from "@/lib/utils";

const CONCERN_STYLES: Record<
  CivicConcern,
  { label: string; className: string }
> = {
  infrastructure: {
    label: "Infrastructure",
    className: "bg-evolucent-sand text-evolucent-black",
  },
  health: {
    label: "Health",
    className: "bg-red-50 text-red-800",
  },
  education: {
    label: "Education",
    className: "bg-sky-50 text-sky-900",
  },
  economy: {
    label: "Economy",
    className: "bg-amber-50 text-amber-950",
  },
  governance: {
    label: "Governance",
    className: "bg-violet-50 text-violet-900",
  },
  environment: {
    label: "Environment",
    className: "bg-emerald-50 text-emerald-900",
  },
  safety: {
    label: "Safety",
    className: "bg-orange-50 text-orange-900",
  },
  other: {
    label: "Civic life",
    className: "bg-evolucent-off-white text-muted-foreground border border-border",
  },
};

function initials(source: string) {
  const parts = source.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "N";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase().slice(0, 2);
}

export function CivicFeedPostCard({ post }: { post: CivicFeedPost }) {
  const concern = CONCERN_STYLES[post.concern] ?? CONCERN_STYLES.other;

  return (
    <article className="overflow-hidden rounded-2xl border border-evolucent-sand bg-card shadow-evolucent-card transition-shadow hover:shadow-evolucent-elevated">
      <div className="flex gap-3 border-b border-evolucent-sand/80 bg-evolucent-off-white/80 px-4 py-3">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold/20 font-display text-sm font-bold text-gold-dark"
          aria-hidden
        >
          {initials(post.sourceLabel)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-evolucent-black">
              {post.sourceLabel}
            </span>
            <span className="text-muted-foreground" aria-hidden>
              ·
            </span>
            <ClientRelativeTime
              date={post.publishedAt}
              className="text-sm text-muted-foreground"
            />
            {post.aiEnhanced ? (
              <>
                <span className="text-muted-foreground" aria-hidden>
                  ·
                </span>
                <span className="rounded-full bg-civic-green/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-civic-green-dark">
                  AI brief
                </span>
              </>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            Ghana public feed · headlines for citizens
          </p>
        </div>
      </div>

      <div className="relative border-b border-evolucent-sand">
        <FeedPostImage
          primarySrc={post.displayImageUrl}
          fallbackSrc={post.fallbackImageUrl}
          alt={`Image for story: ${post.title}`}
          className="w-full"
        />
        <span
          className={cn(
            "absolute bottom-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow-sm",
            post.imageFromFeed
              ? "bg-evolucent-black/70 text-white"
              : "bg-card/90 text-muted-foreground",
          )}
        >
          {post.imageFromFeed ? "Outlet" : "Thematic"}
        </span>
      </div>

      <div className="px-4 py-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              concern.className,
            )}
          >
            {concern.label}
          </span>
        </div>

        <h2 className="mb-2 font-display text-lg font-extrabold leading-snug tracking-tight text-evolucent-black">
          {post.title}
        </h2>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {post.body}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-evolucent-sand pt-4">
          <Link
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-civic-green underline-offset-4 hover:underline"
          >
            Read source →
          </Link>
        </div>
      </div>
    </article>
  );
}
