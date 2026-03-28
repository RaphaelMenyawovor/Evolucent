"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type LiveCounterSlide = {
  label: string;
  flag: string;
  amount: number;
  change: string;
  isNational: boolean;
};

/** Mock data — replace with Supabase / store when wired. */
export const LIVE_COUNTER_SLIDES: LiveCounterSlide[] = [
  {
    label: "Ghana Total",
    flag: "🇬🇭",
    amount: 2_847_300,
    change: "+12.4%",
    isNational: true,
  },
  { label: "Greater Accra", flag: "📍", amount: 891_200, change: "+18.2%", isNational: false },
  { label: "Ashanti Region", flag: "📍", amount: 612_440, change: "+9.7%", isNational: false },
  { label: "Western Region", flag: "📍", amount: 340_120, change: "+6.1%", isNational: false },
  { label: "Western North", flag: "📍", amount: 128_400, change: "+4.2%", isNational: false },
  { label: "Central Region", flag: "📍", amount: 203_800, change: "+14.0%", isNational: false },
  { label: "Eastern Region", flag: "📍", amount: 287_900, change: "+11.8%", isNational: false },
  { label: "Volta Region", flag: "📍", amount: 156_300, change: "+5.4%", isNational: false },
  { label: "Northern Region", flag: "📍", amount: 198_750, change: "+22.3%", isNational: false },
  { label: "North East", flag: "📍", amount: 94_200, change: "+7.1%", isNational: false },
  { label: "Upper East", flag: "📍", amount: 112_600, change: "+8.9%", isNational: false },
  { label: "Upper West", flag: "📍", amount: 88_150, change: "+6.5%", isNational: false },
  { label: "Bono Region", flag: "📍", amount: 142_300, change: "+10.2%", isNational: false },
  { label: "Bono East", flag: "📍", amount: 105_900, change: "+5.8%", isNational: false },
  { label: "Ahafo Region", flag: "📍", amount: 76_400, change: "+4.9%", isNational: false },
  { label: "Oti Region", flag: "📍", amount: 68_200, change: "+9.1%", isNational: false },
  { label: "Savannah Region", flag: "📍", amount: 59_800, change: "+3.6%", isNational: false },
];

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setCount(0);
    const start = performance.now();
    const startVal = 0;
    let cancelled = false;

    const tick = (now: number) => {
      if (cancelled) return;
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(startVal + (target - startVal) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return count;
}

function formatGHS(amount: number): string {
  return new Intl.NumberFormat("en-GH").format(amount);
}

export function LiveCounterSlideshow() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const currentRef = useRef(0);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const slide = LIVE_COUNTER_SLIDES[current];
  const count = useCountUp(slide.amount);

  const goTo = useCallback((index: number) => {
    const len = LIVE_COUNTER_SLIDES.length;
    const next = ((index % len) + len) % len;
    if (next === currentRef.current) return;
    setAnimating(true);
    window.setTimeout(() => {
      setCurrent(next);
      setAnimating(false);
    }, 250);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => {
      goTo(currentRef.current + 1);
    }, 4000);
    return () => window.clearTimeout(id);
  }, [current, paused, goTo]);

  return (
    <div
      className="relative w-full max-w-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div
          className={cn(
            "flex min-w-0 items-center gap-2 transition-all duration-500 ease-out",
            animating ? "translate-y-[-8px] opacity-0" : "translate-y-0 opacity-100"
          )}
        >
          <span className="text-base" aria-hidden>
            {slide.flag}
          </span>
          <span
            className={cn(
              "truncate text-sm font-medium uppercase tracking-[0.1em]",
              slide.isNational ? "text-civic-green" : "text-[var(--evolucent-muted)]"
            )}
          >
            {slide.label}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {LIVE_COUNTER_SLIDES.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to ${s.label}`}
              aria-current={i === current ? "true" : undefined}
              className={cn(
                "h-1.5 rounded-full border-0 p-0 transition-all duration-300 ease-out",
                i === current
                  ? "w-5 bg-civic-green"
                  : "w-1.5 bg-[var(--evolucent-border)] hover:bg-[var(--evolucent-border-strong)]"
              )}
            />
          ))}
        </div>
      </div>

      <div
        className="mb-5 h-px bg-[var(--evolucent-sand)]"
        role="presentation"
      />

      <div className="flex flex-wrap items-end gap-4">
        <div
          className={cn(
            "min-w-0 flex-1 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
            animating ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
          )}
        >
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="mb-1 text-lg font-medium tracking-tight text-[var(--evolucent-muted)]">
              GHS
            </span>
            <span className="font-display text-[clamp(3rem,8vw,5.5rem)] font-extrabold leading-none tracking-[-0.03em] text-evolucent-black tabular-nums dark:text-foreground">
              {formatGHS(count)}
            </span>
          </div>
        </div>

        <div className="mb-2 flex shrink-0 items-center gap-1.5">
          <span
            className="size-[7px] shrink-0 rounded-full bg-civic-green animate-pulse-live"
            aria-hidden
          />
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-civic-green">
            LIVE
          </span>
        </div>
      </div>

      <div
        className={cn(
          "mt-3 flex flex-wrap items-center gap-2 transition-opacity duration-300 ease-out",
          animating ? "opacity-0" : "opacity-100"
        )}
      >
        <span className="inline-flex items-center gap-1 rounded-full bg-civic-green-light px-2.5 py-1 font-mono text-xs font-medium text-civic-green-dark dark:bg-civic-green/20 dark:text-civic-green-light">
          ↑ {slide.change} this month
        </span>
        {!slide.isNational && (
          <button
            type="button"
            onClick={() => goTo(0)}
            className="border-0 bg-transparent font-sans text-xs text-[var(--evolucent-muted)] underline decoration-1 underline-offset-[3px] hover:text-foreground"
          >
            View national total
          </button>
        )}
      </div>
    </div>
  );
}
