import { Suspense } from "react";
import Link from "next/link";
import { Bookmark, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FundingProgress } from "@/components/evolucent/funding-progress";
import { ProjectLanguageReader } from "@/components/ProjectLanguageReader";
import { ProjectContributionPanel } from "@/components/evolucent/project-contribution-panel";
import { KhayaAIPlayer } from "@/components/khaya-ai-player";
import { AIImpact } from "@/components/ai-impact";
import { WhatsAppShareButton } from "@/components/whatsapp-share-button";
import { getSessionSafe } from "@/lib/auth-session";
import { prisma } from "@/src/db";
import { formatGHS, formatRegion, formatTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";

type VerificationStep = {
  id: string;
  label: string;
  description: string;
  status: "completed" | "active" | "pending";
  date?: string;
  verifier?: string;
};

type LedgerRow = {
  id: string;
  amount: number;
  alias: string;
  region: string;
  at: Date;
  method: "momo" | "bank" | "card";
};

const MOCK_BY_ID: Record<
  string,
  {
    title: string;
    region: string;
    category: string;
    raised: number;
    target: number;
    supporters: number;
    daysLeft: number;
    description: string;
    aiSummary: string;
    urgencyScore: number;
    steps: VerificationStep[];
    ledger: LedgerRow[];
  }
> = {
  "proj-kumasi-solar": {
    title: "Kumasi Central Market solar lighting",
    region: "ashanti region",
    category: "Infrastructure",
    raised: 34_200,
    target: 50_000,
    supporters: 1240,
    daysLeft: 12,
    description:
      "The Kumasi Central Market serves over 20,000 traders daily. This project installs commercial-grade solar streetlights across main arteries. Funds stay in escrow until independent audit clears release.",
    aiSummary:
      "Twi · English: Ɔhaw no yɛ sɛ anadwo hann nni hɔ — solar bɛboa ma aduanan tom. Every pesewa tracked on the public ledger.",
    urgencyScore: 84,
    steps: [
      {
        id: "1",
        label: "Problem identified",
        description: "",
        status: "completed",
        date: "Jan 12, 2026",
      },
      {
        id: "2",
        label: "Community voting",
        description: "",
        status: "completed",
        verifier: "4,230 votes",
      },
      { id: "3", label: "Funding active", description: "", status: "active" },
      {
        id: "4",
        label: "Independent audit",
        description: "",
        status: "pending",
        verifier: "KPMG Ghana (assigned)",
      },
      {
        id: "5",
        label: "Funds released",
        description: "",
        status: "pending",
      },
      { id: "6", label: "Project proof", description: "", status: "pending" },
    ],
    ledger: [],
  },
  default: {
    title: "Civic infrastructure project",
    region: "greater accra",
    category: "Roads",
    raised: 18_400,
    target: 60_000,
    supporters: 890,
    daysLeft: 21,
    description:
      "Citizens chose this. We publish every contribution in real time. Release happens only after independent verification.",
    aiSummary:
      "Nyansa tia: project yi yɛ sɛ ɛbɛboa kuw no — funds wɔ escrow mu.",
    urgencyScore: 72,
    steps: [
      {
        id: "1",
        label: "Problem identified",
        description: "",
        status: "completed",
        date: "Feb 2, 2026",
      },
      {
        id: "2",
        label: "Community voting",
        description: "",
        status: "completed",
        verifier: "2,102 votes",
      },
      { id: "3", label: "Funding active", description: "", status: "active" },
      {
        id: "4",
        label: "Independent audit",
        description: "",
        status: "pending",
      },
      {
        id: "5",
        label: "Funds released",
        description: "",
        status: "pending",
      },
      { id: "6", label: "Project proof", description: "", status: "pending" },
    ],
    ledger: [],
  },
};

function getMockProject(id: string) {
  return MOCK_BY_ID[id] ?? MOCK_BY_ID.default;
}

/** Derive a privacy-safe alias from a full name: "Kofi Asante" → "Kofi A." */
function toAlias(name: string | null): string {
  if (!name) return "Anonymous";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0]}.`;
}

/** Normalise Paystack/DB method string to the display union. */
function toDisplayMethod(method: string | null): "momo" | "bank" | "card" {
  if (method === "momo") return "momo";
  if (method === "bank") return "bank";
  return "card";
}

/** Skeleton for the AIImpact async server component */
function AIImpactSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 h-5 w-36 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="space-y-2">
        <div className="h-4 w-[85%] animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-4 w-[75%] animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-4 w-[65%] animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

type PageProps = { params: Promise<{ id: string }> };

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const mock = getMockProject(id);
  const session = await getSessionSafe();

  // Fetch live data from DB. Contributions include user region + method for the ledger.
  const dbProject = await prisma.project.findUnique({
    where: { id },
    include: {
      contributions: {
        where: { status: "SUCCESS" },
        include: { user: { select: { name: true, region: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: { select: { contributions: { where: { status: "SUCCESS" } } } },
    },
  }).catch(() => null);

  // Prefer live DB values; fall back to mock for projects not yet in DB.
  const raised = dbProject?.currentAmount ?? mock.raised;
  const target = dbProject?.goalAmount ?? mock.target;
  const supporters = dbProject?._count.contributions ?? mock.supporters;

  const ledger: LedgerRow[] =
    dbProject && dbProject.contributions.length > 0
      ? dbProject.contributions.map((c) => ({
          id: c.paymentRef.slice(-6).toUpperCase(),
          amount: c.amount,
          alias: toAlias(c.user.name),
          region: c.user.region ?? "Ghana",
          at: c.createdAt,
          method: toDisplayMethod((c as { method?: string | null }).method ?? null),
        }))
      : mock.ledger;

  const p = {
    ...mock,
    raised,
    target,
    supporters,
    // Use DB description/title if available (more up-to-date)
    title: dbProject?.title ?? mock.title,
    description: dbProject?.description ?? mock.description,
  };

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-12">
      {/* Top bar */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" className="gap-1 font-semibold" asChild>
            <Link href="/projects">
              <ChevronLeft className="size-4" />
              Back to projects
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <WhatsAppShareButton projectTitle={p.title} />
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Bookmark"
            >
              <Bookmark className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-12 lg:gap-10">
        {/* ── Left column ── */}
        <div className="lg:col-span-7">
          {/* Hero image */}
          <div className="relative aspect-video overflow-hidden rounded-lg bg-muted shadow-evolucent-card ring-1 ring-border/60">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200&auto=format&fit=crop)",
              }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />
          </div>

          {/* Badges */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full font-bold">
              {formatRegion(p.region)}
            </Badge>
            <Badge variant="outline" className="rounded-full font-bold">
              {p.category}
            </Badge>
            <Badge className="rounded-full border-0 bg-gold-light font-bold text-gold-dark">
              Urgency {p.urgencyScore}
            </Badge>
          </div>

          {/* Language reader */}
          <ProjectLanguageReader
            projectTitle={p.title}
            projectDescription={`${p.aiSummary}\n\n${p.description}`}
            projectRegion={formatRegion(p.region)}
            amountRaised={raised}
            targetAmount={target}
          />

          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
            {p.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Posted by Evolucent Civic Board ·{" "}
            <span className="font-medium text-civic-green">Verified ✓</span>
          </p>

          {/* Twi audio player */}
          <div className="mt-6">
            <KhayaAIPlayer text={p.description} />
          </div>

          {/* Plain summary */}
          <Card className="mt-6 shadow-evolucent-card ring-1 ring-border/60">
            <CardHeader>
              <CardTitle className="font-display text-lg">Plain summary</CardTitle>
              <CardDescription>
                AI + Twi touchpoint — bilingual trust layer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed">
              <p>{p.aiSummary}</p>
              <p className="text-muted-foreground">{p.description}</p>
            </CardContent>
          </Card>

          {/* AI Impact Summary (async server component — Suspense-wrapped) */}
          <div className="mt-6">
            <Suspense fallback={<AIImpactSkeleton />}>
              <AIImpact
                project={{
                  id,
                  title: p.title,
                  description: p.description,
                  impactSummary: p.aiSummary,
                }}
              />
            </Suspense>
          </div>

          {/* Urgency score */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Urgency score
              </h2>
              <span className="font-mono text-sm font-semibold">
                {p.urgencyScore}/100
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-linear-to-r from-gold to-gold-dark transition-all duration-1000"
                style={{ width: `${p.urgencyScore}%` }}
              />
            </div>
          </div>

          {/* Verification timeline */}
          <section className="mt-10">
            <h2 className="font-display text-lg font-bold">
              Verification timeline
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Funds move only when the board and auditors agree — 6/8 votes to
              release.
            </p>
            <ol className="mt-4 space-y-4 border-l-2 border-border pl-4">
              {p.steps.map((step) => (
                <li key={step.id} className="relative">
                  <span
                    className={cn(
                      "absolute -left-5.25 top-1.5 size-2.5 rounded-full border-2 border-background",
                      step.status === "completed" && "bg-civic-green",
                      step.status === "active" && "bg-gold",
                      step.status === "pending" && "bg-muted-foreground/40"
                    )}
                  />
                  <p className="font-display font-bold">{step.label}</p>
                  {step.date ? (
                    <p className="font-mono text-xs text-muted-foreground">
                      {step.date}
                    </p>
                  ) : null}
                  {step.verifier ? (
                    <p className="text-sm text-muted-foreground">
                      {step.verifier}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>

          {/* On-page transaction ledger */}
          <section className="mt-10">
            <h2 className="font-display text-lg font-bold">
              Public transaction ledger
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every pesewa is visible — this is the core trust mechanism.
            </p>
            {ledger.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No contributions yet. Be the first!
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {ledger.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/80 bg-card px-3 py-2 text-sm shadow-evolucent-card"
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {row.id}
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      {formatGHS(row.amount)}
                    </span>
                    <span className="text-muted-foreground">
                      {row.alias} · {formatRegion(row.region)} ·{" "}
                      {row.method.toUpperCase()}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatTimestamp(row.at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ── Right column (sticky) ── */}
        <div className="lg:col-span-5">
          <div className="space-y-6 lg:sticky lg:top-20">
            <ProjectContributionPanel
              raised={raised}
              target={target}
              supporters={supporters}
              daysLeft={p.daysLeft}
              projectId={id}
              userEmail={session?.user?.email ?? undefined}
            />
            {/* Progress bar visible standalone on mobile */}
            <div className="lg:hidden">
              <FundingProgress raised={raised} target={target} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
