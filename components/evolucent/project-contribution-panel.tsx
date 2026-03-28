"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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

// Paystack test card for judges: 4084 0840 8408 4081 · Exp 01/99 · CVV 408
const DEMO_EMAIL = "demo@evolucent.gh";

type ProjectContributionPanelProps = {
  raised: number;
  target: number;
  supporters: number;
  daysLeft: number;
  projectId: string;
  userEmail?: string;
};

export function ProjectContributionPanel({
  raised,
  target,
  supporters,
  daysLeft,
  projectId,
  userEmail,
}: ProjectContributionPanelProps) {
  const router = useRouter();
  const percent = Math.min(100, Math.round((raised / target) * 100));
  const [amount, setAmount] = React.useState("");
  const [email, setEmail] = React.useState(userEmail ?? "");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [demoMode, setDemoMode] = React.useState(false);

  async function handleFund() {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount < 1) {
      toast.error("Enter a valid amount (min GHS 1)");
      return;
    }

    const resolvedEmail = demoMode ? DEMO_EMAIL : email.trim();
    if (!resolvedEmail || !resolvedEmail.includes("@")) {
      toast.error("Enter a valid email address to continue");
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      toast.error("Payment not configured — contact support");
      return;
    }

    setIsProcessing(true);

    const { default: PaystackPop } = await import("@paystack/inline-js");
    const popup = new PaystackPop();

    popup.newTransaction({
      key: publicKey,
      email: resolvedEmail,
      amount: Math.round(numericAmount * 100), // pesewas
      currency: "GHS",
      metadata: { project_id: projectId },
      onSuccess: async (txn) => {
        toast.loading("Verifying payment…", { id: "payment-verify" });
        try {
          await verifyPayment(txn.reference, projectId);
          toast.success("Contribution confirmed! Thank you.", {
            id: "payment-verify",
          });
          setAmount("");
          router.refresh();
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Verification failed";
          // Surface a friendlier message for the unauthenticated case
          toast.error(
            msg === "Unauthenticated"
              ? "Sign in first to record your contribution."
              : msg,
            { id: "payment-verify" }
          );
        } finally {
          setIsProcessing(false);
        }
      },
      onCancel: () => {
        setIsProcessing(false);
        toast.info("Payment cancelled.");
      },
    });
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
        <FundingProgress raised={raised} target={target} />
        <p className="font-mono text-xs text-muted-foreground">
          {percent}% funded · {daysLeft} days left ·{" "}
          {supporters.toLocaleString("en-GH")} supporters
        </p>

        {/* Amount input */}
        <label className="block">
          <span className="sr-only">Amount (GHS)</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Enter amount (GHS)"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value.replace(/[^0-9.]/g, ""))
            }
            disabled={isProcessing}
            className="w-full rounded-md border border-input bg-background px-3 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
        </label>

        {/* Email — shown when not logged in and not in demo mode */}
        {!userEmail && !demoMode && (
          <label className="block">
            <span className="sr-only">Email for receipt</span>
            <input
              type="email"
              placeholder="Email for receipt"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isProcessing}
              className="w-full rounded-md border border-input bg-background px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </label>
        )}

        <Button
          className="h-14 w-full rounded-md bg-primary text-base font-semibold text-primary-foreground shadow-evolucent-card hover:bg-gold-dark disabled:opacity-60"
          onClick={handleFund}
          disabled={isProcessing || !amount}
        >
          {isProcessing ? "Processing…" : "Contribute now"}
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

        {/* Judge / Demo Mode toggle */}
        <div className="flex items-center justify-between rounded-md border border-dashed border-amber-400/50 bg-amber-50/50 px-3 py-2 dark:bg-amber-950/20">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Judge / Demo Mode
            </p>
            {demoMode && (
              <p className="mt-0.5 font-mono text-[10px] text-amber-600 dark:text-amber-500">
                Card: 4084 0840 8408 4081 · Exp 01/99 · CVV 408
              </p>
            )}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={demoMode}
            onClick={() => setDemoMode((v) => !v)}
            className={`relative ml-2 inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              demoMode ? "bg-amber-500" : "bg-zinc-300 dark:bg-zinc-600"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                demoMode ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <TrustStrip />
        <p className="text-center text-xs text-muted-foreground">
          🔒 Funds held in escrow · Stanbic · Ecobank · Fidelity
        </p>
      </CardContent>
    </Card>
  );
}
