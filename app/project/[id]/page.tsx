import Link from "next/link";
import { Bookmark, ChevronLeft, Share2 } from "lucide-react";
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
import { ContributionImpact } from "@/components/evolucent/contribution-impact";
import { formatGHS, formatRegion, formatTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";
import { auth } from "@/auth";
import { prisma } from "@/src/db";

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

const MOCK_BY_ID: Record<string, {
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
}> = {
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
      { id: "1", label: "Problem identified", description: "", status: "completed", date: "Jan 12, 2026" },
      { id: "2", label: "Community voting", description: "", status: "completed", verifier: "4,230 votes" },
      { id: "3", label: "Funding active", description: "", status: "active" },
      { id: "4", label: "Independent audit", description: "", status: "pending", verifier: "KPMG Ghana (assigned)" },
      { id: "5", label: "Funds released", description: "", status: "pending" },
      { id: "6", label: "Project proof", description: "", status: "pending" },
    ],
    ledger: [
      { id: "EV7-K2", amount: 20, alias: "Kofi A.", region: "Ashanti", at: new Date("2026-03-28T11:57:00.000Z"), method: "momo" },
      { id: "EV7-J9", amount: 200, alias: "Anonymous", region: "Greater Accra", at: new Date("2026-03-28T11:20:00.000Z"), method: "bank" },
      { id: "EV7-H1", amount: 50, alias: "Ama S.", region: "Western", at: new Date("2026-03-28T08:40:00.000Z"), method: "card" },
    ],
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
      { id: "1", label: "Problem identified", description: "", status: "completed", date: "Feb 2, 2026" },
      { id: "2", label: "Community voting", description: "", status: "completed", verifier: "2,102 votes" },
      { id: "3", label: "Funding active", description: "", status: "active" },
      { id: "4", label: "Independent audit", description: "", status: "pending" },
      { id: "5", label: "Funds released", description: "", status: "pending" },
      { id: "6", label: "Project proof", description: "", status: "pending" },
    ],
    ledger: [
      { id: "EV9-A1", amount: 100, alias: "Kwame B.", region: "Ashanti", at: new Date("2026-03-28T11:52:00.000Z"), method: "momo" },
    ],
  },
};

function getProject(id: string) {
  return MOCK_BY_ID[id] ?? MOCK_BY_ID.default;
}

type PageProps = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const p = getProject(id);
  const session = await auth();

  const dbProject = await prisma.project.findUnique({
    where: { id },
    select: { currentAmount: true },
  });
  const liveRaised = dbProject?.currentAmount ?? p.raised;

  const contributions = await prisma.contribution.findMany({
    where: { projectId: id, status: "SUCCESS" },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-12">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" className="gap-1 font-semibold" asChild>
            <Link href="/projects">
              <ChevronLeft className="size-4" />
              Back to projects
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full" aria-label="Share">
              <Share2 className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full" aria-label="Bookmark">
              <Bookmark className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <div className="relative aspect-video overflow-hidden rounded-[var(--radius-lg)] bg-muted shadow-evolucent-card ring-1 ring-border/60">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200&auto=format&fit=crop)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>

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

          <ProjectLanguageReader
            projectTitle={p.title}
            projectDescription={`${p.aiSummary}\n\n${p.description}`}
            projectRegion={formatRegion(p.region)}
            amountRaised={liveRaised}
            targetAmount={p.target}
          />

          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
            {p.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Posted by Evolucent Civic Board ·{" "}
            <span className="font-medium text-civic-green">Verified ✓</span>
          </p>

          <Card className="mt-8 shadow-evolucent-card ring-1 ring-border/60">
            <CardHeader>
              <CardTitle className="font-display text-lg">Plain summary</CardTitle>
              <CardDescription>AI + Twi touchpoint — bilingual trust layer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed">
              <p>{p.aiSummary}</p>
              <p className="text-muted-foreground">{p.description}</p>
            </CardContent>
          </Card>

          <div className="mt-8">
            <ContributionImpact
              projectTitle={p.title}
              projectDescription={p.description}
              goalAmount={p.target}
              currentAmount={liveRaised}
            />
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Urgency score
              </h2>
              <span className="font-mono text-sm font-semibold">{p.urgencyScore}/100</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-gold-dark transition-all duration-1000"
                style={{ width: `${p.urgencyScore}%` }}
              />
            </div>
          </div>

          <section className="mt-10">
            <h2 className="font-display text-lg font-bold">Verification timeline</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Funds move only when the board and auditors agree — 6/8 votes to release.
            </p>
            <ol className="mt-4 space-y-4 border-l-2 border-border pl-4">
              {p.steps.map((step) => (
                <li key={step.id} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-background",
                      step.status === "completed" && "bg-civic-green",
                      step.status === "active" && "bg-gold",
                      step.status === "pending" && "bg-muted-foreground/40"
                    )}
                  />
                  <p className="font-display font-bold">{step.label}</p>
                  {step.date ? (
                    <p className="font-mono text-xs text-muted-foreground">{step.date}</p>
                  ) : null}
                  {step.verifier ? (
                    <p className="text-sm text-muted-foreground">{step.verifier}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-lg font-bold">Public transaction ledger</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every pesewa is visible — this is the core trust mechanism.
            </p>
            {contributions.length === 0 ? (
              <p className="mt-4 rounded-[var(--radius-md)] border border-border/80 bg-card px-3 py-4 text-center text-sm text-muted-foreground shadow-evolucent-card">
                No contributions yet. Be the first to fund this change!
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {contributions.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-border/80 bg-card px-3 py-2 text-sm shadow-evolucent-card"
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {c.paymentRef.length > 20
                        ? `${c.paymentRef.slice(0, 8)}…${c.paymentRef.slice(-6)}`
                        : c.paymentRef}
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      {formatGHS(c.amount)}
                    </span>
                    <span className="text-muted-foreground">
                      {c.user.name ?? "Anonymous Citizen"}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatTimestamp(c.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="space-y-6 lg:sticky lg:top-20">
            <ProjectContributionPanel
              projectId={id}
              raised={liveRaised}
              target={p.target}
              supporters={p.supporters}
              daysLeft={p.daysLeft}
              userEmail={session?.user?.email}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
