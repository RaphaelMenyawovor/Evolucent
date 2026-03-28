"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type AnimatedCounterProps = {
  value: number;
  className?: string;
  durationMs?: number;
  format?: (n: number) => string;
};

export function AnimatedCounter({
  value,
  className,
  durationMs = 900,
  format = (n) => Math.round(n).toLocaleString("en-GH"),
}: AnimatedCounterProps) {
  const [display, setDisplay] = React.useState(0);
  const displayRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const from = displayRef.current;
    let start: number | null = null;

    const step = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      const next = from + (value - from) * eased;
      displayRef.current = next;
      setDisplay(next);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs]);

  return (
    <span className={cn("tabular-nums", className)} suppressHydrationWarning>
      {format(display)}
    </span>
  );
}
