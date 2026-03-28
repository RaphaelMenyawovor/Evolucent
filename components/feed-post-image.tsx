"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  primarySrc: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
};

/**
 * Tries RSS image first; on error swaps to thematic fallback (Unsplash).
 */
export function FeedPostImage({
  primarySrc,
  fallbackSrc,
  alt,
  className,
}: Props) {
  const [phase, setPhase] = React.useState<"primary" | "fallback" | "none">(
    "primary",
  );

  const src =
    phase === "primary"
      ? primarySrc
      : phase === "fallback"
        ? fallbackSrc
        : undefined;

  if (phase === "none") {
    return (
      <div
        className={cn(
          "aspect-video w-full bg-gradient-to-br from-evolucent-sand to-evolucent-off-white",
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- dynamic news CDNs
    <img
      src={src}
      alt={alt}
      className={cn("aspect-video w-full object-cover", className)}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (phase === "primary") {
          setPhase(primarySrc !== fallbackSrc ? "fallback" : "none");
        } else {
          setPhase("none");
        }
      }}
    />
  );
}
