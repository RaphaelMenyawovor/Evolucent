"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FundingProgress } from "@/components/evolucent/funding-progress";
import type { CivicProject, ProjectUrgency } from "@/lib/projects-data";
import { formatRegion } from "@/lib/format";
import { cn } from "@/lib/utils";

function urgencyBadge(u: ProjectUrgency) {
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
        <Badge variant="secondary" className="rounded-full font-bold text-info">
          Active
        </Badge>
      );
  }
}

type ProjectsGridProps = {
  projects: CivicProject[];
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function ProjectsGrid({
  projects,
  page,
  pageSize,
  onPageChange,
}: ProjectsGridProps) {
  const totalPages = Math.max(1, Math.ceil(projects.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const slice = projects.slice(start, start + pageSize);

  if (projects.length === 0) {
    return (
      <p className="rounded-[var(--radius-lg)] border border-border bg-card py-16 text-center text-muted-foreground">
        No projects match these filters. Try adjusting category or region.
      </p>
    );
  }

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {slice.map((p) => {
          const pct = Math.min(100, Math.round((p.raised / p.target) * 100));
          return (
            <Card
              key={p.id}
              className="flex flex-col shadow-evolucent-card ring-1 ring-border/60"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  {urgencyBadge(p.urgency)}
                  <Badge
                    variant="outline"
                    className="rounded-full text-[10px] font-bold"
                  >
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

      {totalPages > 1 ? (
        <nav
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
          aria-label="Pagination"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Button
              key={n}
              type="button"
              variant={n === safePage ? "default" : "outline"}
              size="sm"
              className={cn(
                "min-w-10",
                n === safePage && "bg-primary text-primary-foreground"
              )}
              onClick={() => onPageChange(n)}
            >
              {n}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
          >
            Next
          </Button>
        </nav>
      ) : null}
    </div>
  );
}
