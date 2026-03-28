"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart2,
  Bot,
  Home,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LiveCounterSlideshow } from "@/components/LiveCounterSlideshow";
import { FundingProgress } from "@/components/evolucent/funding-progress";
import { ClientRelativeTime } from "@/components/evolucent/client-relative-time";
import { FlagStripeBar, GhanaHeroDecoration } from "@/components/evolucent/ghana-hero-decoration";
import { formatCompact, formatGHS, formatRegion } from "@/lib/format";
import {
  ALL_PROJECTS,
  filterAndSortProjects,
  type CivicProject,
  type ProjectSortOption,
} from "@/lib/projects-data";
import { cn } from "@/lib/utils";

const TOTAL_RAISED = 18_420_500;
const CONTRIBUTORS = 12_340;
const PROJECTS_FUNDED = 47;
const ACTIVE_REGIONS = 14;

const CATEGORIES = [
  "All",
  "Health",
  "Roads",
  "Education",
  "Water",
  "Infrastructure",
  "Energy",
] as const;

const SORTS = [
  "Most Urgent",
  "Trending",
  "Near Complete",
  "Newest",
] as const satisfies readonly ProjectSortOption[];

/** Fixed demo timestamps — avoid `Date.now()` at module load (differs SSR vs client). */
const PULSE_ITEMS = [
  {
    id: "1",
    type: "ai" as const,
    region: "Ashanti",
    text: "Kumasi Water Project crossed 68% funded — momentum strong.",
    at: new Date("2026-03-28T10:18:00.000Z"),
  },
  {
    id: "2",
    type: "citizen" as const,
    region: "Greater Accra",
    initials: "KA",
    text: "Accra Road Fix flagged 🚨 URGENT — citizens asking for visibility.",
    at: new Date("2026-03-28T09:45:00.000Z"),
  },
  {
    id: "3",
    type: "ai" as const,
    region: "Northern",
    text: "Tamale Clinic: new verification step posted. Twi summary available.",
    at: new Date("2026-03-28T08:00:00.000Z"),
  },
];

function urgencyBadge(u: CivicProject["urgency"]) {
  switch (u) {
    case "critical":
      return (
        <Badge className="rounded-full border-0 bg-red-100 font-bold text-[var(--evolucent-red)] dark:bg-red-950/40 dark:text-red-300">
          Critical
        </Badge>
      );
    case "high":
      return (
        <Badge className="rounded-full border-0 bg-gold-light font-bold text-gold-dark">
          High
        </Badge>
      );
    case "funded":
      return (
        <Badge className="rounded-full border-0 bg-civic-green-light font-bold text-civic-green-dark">
          Verified complete
        </Badge>
      );
    default:
      return (
        <Badge
          variant="secondary"
          className="rounded-full font-bold text-info"
        >
          Active
        </Badge>
      );
  }
}

export default function HomePage() {
  const [category, setCategory] = React.useState<(typeof CATEGORIES)[number]>("All");
  const [sort, setSort] = React.useState<(typeof SORTS)[number]>("Most Urgent");

  const filtered = React.useMemo(
    () =>
      filterAndSortProjects(ALL_PROJECTS, {
        category,
        region: "All Regions",
        sort,
        status: "All",
      }),
    [category, sort]
  );

  const stats = [
    { label: "Total raised", value: formatGHS(TOTAL_RAISED), mono: true },
    { label: "Contributors", value: formatCompact(CONTRIBUTORS), mono: true },
    { label: "Projects funded", value: String(PROJECTS_FUNDED), mono: true },
    { label: "Active regions", value: `${ACTIVE_REGIONS}/16`, mono: true },
  ];

  return (
    <div className="pb-24">
      <section className="relative overflow-hidden bg-evolucent-black text-evolucent-off-white">
        <FlagStripeBar />
        <GhanaHeroDecoration className="pointer-events-none absolute -right-8 top-16 size-[min(90vw,420px)] text-white opacity-[0.07]" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-14">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-gold">
            Ghana&apos;s Civic Fund
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            A transparent way of how citizens fund change. Watch it happen.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/70 md:text-base">
            Not charity — civic infrastructure.{" "}
            <span className="text-gold-light">Ɛyɛ ɔman no dwuma</span> — it is
            the nation&apos;s work.
          </p>

          <div className="mt-8 max-w-2xl rounded-[var(--radius-lg)] bg-evolucent-off-white p-5 text-foreground shadow-evolucent-elevated ring-1 ring-white/10 md:p-6 dark:bg-card dark:ring-border/60">
            <LiveCounterSlideshow />
          </div>
          <p className="mt-3 font-mono text-sm text-white/60">
            Every line on the ledger is public
          </p>

          <div className="mt-8 flex flex-wrap gap-3" id="contribute">
            <Button
              size="lg"
              className="h-12 rounded-[var(--radius-md)] bg-primary px-7 text-base font-semibold text-primary-foreground shadow-evolucent-elevated hover:bg-gold-dark"
              asChild
            >
              <Link href="/project/proj-accra-drains">Start contributing</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-[var(--radius-md)] border-white/25 bg-white/5 text-white hover:bg-white/10"
              asChild
            >
              <Link href="/projects">See all projects</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="font-display text-lg font-bold">National stats</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Radical transparency — same numbers our board sees.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {stats.map((s) => (
                <Card
                  key={s.label}
                  className="shadow-evolucent-card ring-1 ring-border/60"
                >
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs font-medium uppercase tracking-wide">
                      {s.label}
                    </CardDescription>
                    <CardTitle
                      className={cn(
                        "font-display text-2xl font-bold",
                        s.mono && "font-mono text-xl"
                      )}
                    >
                      {s.value}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8" id="pulse">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-lg font-bold">The Pulse</h2>
              <span className="font-mono text-xs text-muted-foreground">
                Live feed
              </span>
            </div>
            <Card className="mt-4 max-h-[420px] overflow-y-auto shadow-evolucent-card ring-1 ring-border/60">
              <CardContent className="space-y-3 pt-6">
                {PULSE_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="animate-slide-in-feed flex gap-3 rounded-[var(--radius-md)] border border-border/80 bg-card p-3"
                  >
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted"
                      aria-hidden
                    >
                      {item.type === "ai" ? (
                        <Bot className="size-5 text-info" />
                      ) : (
                        <span className="font-display text-sm font-bold text-primary">
                          {item.initials}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="secondary" className="rounded-full text-[10px] font-bold">
                          {formatRegion(item.region)}
                        </Badge>
                        <ClientRelativeTime
                          date={item.at}
                          className="font-mono text-muted-foreground"
                        />
                      </div>
                      <p className="mt-1 text-sm leading-snug">{item.text}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full font-semibold text-primary">
                  Load more <ArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8" id="projects">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Projects</h2>
            <p className="text-sm text-muted-foreground">
              Filter by category. Sort by urgency or momentum.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    category === c
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])}
                className="rounded-[var(--radius-sm)] border border-input bg-background px-2 py-1 text-foreground"
              >
                {SORTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const pct = Math.min(100, Math.round((p.raised / p.target) * 100));
            return (
              <Card
                key={p.id}
                className="flex flex-col shadow-evolucent-card ring-1 ring-border/60"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    {urgencyBadge(p.urgency)}
                    <Badge variant="outline" className="rounded-full text-[10px] font-bold">
                      {formatRegion(p.region)}
                    </Badge>
                  </div>
                  <CardTitle className="font-display text-lg leading-snug">
                    {p.title}
                  </CardTitle>
                  <CardDescription>{p.blurb}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <FundingProgress raised={p.raised} target={p.target} />
                  <p className="font-mono text-xs text-muted-foreground">
                    {p.supporters.toLocaleString("en-GH")} supporters · {pct}% funded
                  </p>
                </CardContent>
                <CardFooter className="border-t border-border/60">
                  <Button
                    className="w-full rounded-[var(--radius-md)] bg-primary font-semibold text-primary-foreground hover:bg-gold-dark"
                    asChild
                  >
                    <Link href={`/project/${p.id}`}>
                      {p.urgency === "funded" ? "View impact" : "Contribute"}{" "}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label="Mobile"
      >
        <div className="mx-auto flex max-w-md items-center justify-around py-2">
          {[
            { icon: Home, label: "Home", href: "/", active: true },
            { icon: BarChart2, label: "Projects", href: "/projects" },
            { icon: Activity, label: "Pulse", href: "#pulse" },
            { icon: Wallet, label: "Contribute", href: "#contribute" },
            { icon: User, label: "Account", href: "#" },
          ].map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {tab.active ? (
                <span className="mb-0.5 size-1.5 rounded-full bg-primary" />
              ) : (
                <span className="mb-0.5 size-1.5" />
              )}
              <tab.icon className={cn("size-5", tab.active && "text-primary")} />
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>

      <footer className="border-t border-border bg-muted/30 py-6 text-center text-xs text-muted-foreground">
        <p className="flex items-center justify-center gap-2">
          <Sparkles className="size-3.5 text-gold" aria-hidden />
          Built at KNUST · Powered by citizens · ✦ For Ghana. For Africa.
        </p>
      </footer>
    </div>
  );
}
