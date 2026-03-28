"use client";

import { signIn, useSession } from "next-auth/react";
import { CheckCircle, Users, MapPin, ThumbsUp } from "lucide-react";
import type { PollProposal } from "@/lib/poll-proposals";

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Health: { bg: "bg-red-50", text: "text-red-800" },
  Roads: { bg: "bg-evolucent-sand", text: "text-amber-950" },
  Education: { bg: "bg-sky-50", text: "text-sky-900" },
  Water: { bg: "bg-civic-green-light", text: "text-civic-green-dark" },
  Infrastructure: { bg: "bg-evolucent-off-white", text: "text-muted-foreground" },
  Energy: { bg: "bg-amber-50", text: "text-amber-950" },
};

type Props = {
  proposal: PollProposal;
  userVote: "yes" | "no" | null;
  onVote: (choice: "yes" | "no") => void;
};

export function PollCard({ proposal, userVote, onVote }: Props) {
  const { data: session, status } = useSession();
  const voted = userVote !== null;

  const displayTotal = voted
    ? proposal.totalVotes + 1
    : proposal.totalVotes;
  const displayYes = voted && userVote === "yes"
    ? proposal.yesVotes + 1
    : proposal.yesVotes;
  const yesPct = Math.round((displayYes / displayTotal) * 100);
  const noPct = 100 - yesPct;

  const catStyle =
    CATEGORY_COLORS[proposal.category] ?? {
      bg: "bg-evolucent-sand",
      text: "text-muted-foreground",
    };

  const urgencyColor =
    proposal.urgency >= 85
      ? "text-destructive"
      : proposal.urgency >= 65
        ? "text-gold-dark"
        : "text-civic-green";

  const urgencyBar =
    proposal.urgency >= 85
      ? "bg-destructive"
      : proposal.urgency >= 65
        ? "bg-gold"
        : "bg-civic-green";

  const tryVote = (choice: "yes" | "no") => {
    if (status === "loading") return;
    if (!session) {
      void signIn("google", { callbackUrl: "/poll" });
      return;
    }
    onVote(choice);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-card p-6 transition-all duration-200 ${
        voted
          ? userVote === "yes"
            ? "border-2 border-civic-green"
            : "border-2 border-border"
          : "border-[1.5px] border-evolucent-sand"
      }`}
    >
      {voted && (
        <div
          className={`absolute top-4 -right-7 rotate-[35deg] px-9 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-white ${
            userVote === "yes" ? "bg-civic-green" : "bg-muted-foreground"
          }`}
        >
          {userVote === "yes" ? "Voted YES" : "Passed"}
        </div>
      )}

      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${catStyle.bg} ${catStyle.text}`}
        >
          {proposal.category}
        </span>
        <span className="rounded-full border border-evolucent-sand bg-evolucent-off-white px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          {proposal.region}
        </span>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {displayTotal.toLocaleString()} votes · {proposal.daysLeft}d left
        </span>
      </div>

      <h3 className="mb-2.5 font-display text-lg font-extrabold leading-tight tracking-tight text-evolucent-black">
        {proposal.title}
      </h3>

      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
        {proposal.description}
      </p>

      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Urgency
          </span>
          <span className={`font-mono text-[13px] font-semibold ${urgencyColor}`}>
            {proposal.urgency}/100
          </span>
        </div>
        <div className="h-[5px] overflow-hidden rounded-full bg-evolucent-sand">
          <div
            className={`h-full rounded-full ${urgencyBar}`}
            style={{ width: `${proposal.urgency}%` }}
          />
        </div>
      </div>

      {voted && (
        <div className="mb-4 space-y-3">
          <div className="rounded-xl bg-evolucent-off-white p-4">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Vote results
              </span>
              <span className="font-mono text-xs font-semibold text-evolucent-black">
                {displayTotal.toLocaleString()} total votes
              </span>
            </div>

            <div className="mb-2 flex h-3 overflow-hidden rounded-full">
              <div
                className="rounded-l-full bg-civic-green transition-all duration-500"
                style={{ width: `${yesPct}%` }}
              />
              <div
                className="rounded-r-full bg-muted-foreground/25 transition-all duration-500"
                style={{ width: `${noPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-civic-green-dark">
                ✓ {yesPct}% YES ({displayYes.toLocaleString()})
              </span>
              <span className="text-muted-foreground">
                ✗ {noPct}% NO ({(displayTotal - displayYes).toLocaleString()})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center rounded-lg border border-evolucent-sand bg-card px-2 py-2.5">
              <Users className="mb-1 size-4 text-muted-foreground" />
              <span className="font-mono text-sm font-bold text-evolucent-black">
                {displayTotal.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground">Total voters</span>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-evolucent-sand bg-card px-2 py-2.5">
              <MapPin className="mb-1 size-4 text-muted-foreground" />
              <span className="font-mono text-sm font-bold text-evolucent-black">
                {proposal.region}
              </span>
              <span className="text-[10px] text-muted-foreground">Region</span>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-evolucent-sand bg-card px-2 py-2.5">
              <ThumbsUp className="mb-1 size-4 text-civic-green" />
              <span className="font-mono text-sm font-bold text-civic-green-dark">
                {displayYes.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground">Backed it</span>
            </div>
          </div>
        </div>
      )}

      {!session && status !== "loading" && (
        <p className="mb-3 text-center text-xs text-muted-foreground">
          Sign in with Google to cast your vote — one vote per project.
        </p>
      )}

      {!voted ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => tryVote("yes")}
            disabled={status === "loading"}
            className="rounded-[10px] bg-civic-green py-3.5 text-sm font-bold tracking-tight text-white transition-colors hover:bg-civic-green-dark disabled:opacity-50"
          >
            ✓ YES — Fund This
          </button>
          <button
            type="button"
            onClick={() => tryVote("no")}
            disabled={status === "loading"}
            className="rounded-[10px] border-[1.5px] border-border bg-card py-3.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-evolucent-border-strong disabled:opacity-50"
          >
            ✗ Not Now
          </button>
        </div>
      ) : (
        <div
          className={`flex items-center justify-center gap-2 rounded-[10px] px-3 py-3 text-sm font-semibold ${
            userVote === "yes"
              ? "bg-civic-green-light text-civic-green-dark"
              : "bg-evolucent-off-white text-muted-foreground"
          }`}
        >
          <CheckCircle className="size-4" />
          {userVote === "yes"
            ? "You voted YES — your voice is counted"
            : "You passed on this project"}
        </div>
      )}
    </div>
  );
}
