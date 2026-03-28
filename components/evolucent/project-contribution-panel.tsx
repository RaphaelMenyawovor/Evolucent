"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { AnimatedCounter } from "@/components/evolucent/animated-counter";
import { FundingProgress } from "@/components/evolucent/funding-progress";
import { TrustStrip } from "@/components/evolucent/trust-strip";
import { formatGHS } from "@/lib/format";

type ProjectContributionPanelProps = {
  raised: number;
  target: number;
  supporters: number;
  daysLeft: number;
};

export function ProjectContributionPanel({
  raised,
  target,
  supporters,
  daysLeft,
}: ProjectContributionPanelProps) {
  const percent = Math.min(100, Math.round((raised / target) * 100));

  return (
    <Card className="shadow-evolucent-elevated ring-1 ring-border/60">
      <CardHeader>
        <CardDescription className="font-mono text-xs uppercase tracking-widest">
          Live ledger
        </CardDescription>
        <div className="flex flex-wrap items-end gap-2">
          <span className="font-mono text-sm text-muted-foreground">GHS</span>
          <AnimatedCounter
            value={raised}
            className="font-display text-4xl font-extrabold tabular-nums text-foreground md:text-5xl"
            format={(n) => Math.round(n).toLocaleString("en-GH")}
          />
          <span className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-civic-green animate-pulse-live">
            ● LIVE
          </span>
        </div>
        <p className="font-mono text-sm text-muted-foreground">
          raised of {formatGHS(target)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <FundingProgress raised={raised} target={target} />
        <p className="font-mono text-xs text-muted-foreground">
          {percent}% funded · {daysLeft} days left ·{" "}
          {supporters.toLocaleString("en-GH")} supporters
        </p>
        <Button className="h-14 w-full rounded-[var(--radius-md)] bg-primary text-base font-semibold text-primary-foreground shadow-evolucent-card hover:bg-gold-dark">
          Contribute now
        </Button>
        <div className="flex flex-wrap gap-2">
          {(["MTN MoMo", "Bank", "Card"] as const).map((m) => (
            <Badge
              key={m}
              variant="secondary"
              className="rounded-full px-3 py-1.5 text-xs font-semibold"
            >
              {m}
            </Badge>
          ))}
        </div>
        <label className="block">
          <span className="sr-only">Amount</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Enter amount (GHS)"
            className="w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-3 font-mono text-sm"
            readOnly
          />
        </label>
        <TrustStrip />
        <p className="text-center text-xs text-muted-foreground">
          🔒 Funds held in escrow · Stanbic · Ecobank · Fidelity
        </p>
      </CardContent>
    </Card>
  );
}
