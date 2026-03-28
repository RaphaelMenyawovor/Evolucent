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
import { verifyPayment } from "@/lib/actions/paystack";
import { CheckCircle, Loader2 } from "lucide-react";

type ProjectContributionPanelProps = {
  projectId: string;
  raised: number;
  target: number;
  supporters: number;
  daysLeft: number;
  userEmail?: string | null;
};

export function ProjectContributionPanel({
  projectId,
  raised,
  target,
  supporters,
  daysLeft,
  userEmail,
}: ProjectContributionPanelProps) {
  const percent = Math.min(100, Math.round((raised / target) * 100));
  const [amount, setAmount] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<number | null>(null);

  async function handleContribute() {
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }

    if (!userEmail) {
      setError("Please sign in to contribute.");
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      setError("Payment service is not configured.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { default: PaystackPop } = await import("@paystack/inline-js");
      const paystack = new PaystackPop();

      paystack.newTransaction({
        key: publicKey,
        email: userEmail,
        amount: Math.round(numericAmount * 100),
        currency: "GHS",
        onSuccess: async (transaction: { reference: string }) => {
          try {
            await verifyPayment(transaction.reference, projectId);
            setSuccess(numericAmount);
            setAmount("");
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "Payment verification failed.",
            );
          } finally {
            setIsLoading(false);
          }
        },
        onCancel: () => {
          setError("Payment cancelled.");
          setIsLoading(false);
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not open payment. Please try again.",
      );
      setIsLoading(false);
    }
  }

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
        <label className="block">
          <span className="sr-only">Amount</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Enter amount (GHS)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleContribute();
            }}
            className="w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-3 font-mono text-sm"
          />
        </label>
        <Button
          onClick={handleContribute}
          disabled={isLoading || !amount.trim()}
          className="h-14 w-full rounded-[var(--radius-md)] bg-primary text-base font-semibold text-primary-foreground shadow-evolucent-card hover:bg-gold-dark disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Processing…
            </>
          ) : (
            "Contribute now"
          )}
        </Button>

        {success ? (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/30">
            <CheckCircle className="size-5 shrink-0 text-green-600" />
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              GHS {success.toLocaleString()} contributed successfully!
            </p>
          </div>
        ) : null}

        {error ? (
          <p className="text-center text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

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
        <FundingProgress raised={raised} target={target} />
        <p className="font-mono text-xs text-muted-foreground">
          {percent}% funded · {daysLeft} days left ·{" "}
          {supporters.toLocaleString("en-GH")} supporters
        </p>
        <TrustStrip />
        <p className="text-center text-xs text-muted-foreground">
          🔒 Funds held in escrow · Stanbic · Ecobank · Fidelity
        </p>
      </CardContent>
    </Card>
  );
}
