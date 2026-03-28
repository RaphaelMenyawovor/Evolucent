"use client";

import { useState } from "react";
import { PollCard } from "@/components/PollCard";
import { PollLeaderboard } from "@/components/PollLeaderboard";
import {
  POLL_CATEGORIES,
  POLL_PROPOSALS,
  type PollProposal,
} from "@/lib/poll-proposals";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Browse proposals",
    desc: "Read civic problems submitted from all 16 regions",
  },
  {
    step: "02",
    title: "Cast your vote",
    desc: "Vote YES to prioritise or NO to pass — one vote per project",
  },
  {
    step: "03",
    title: "Top projects get funded",
    desc: "Highest-voted proposals rise to the top of the funding queue",
  },
] as const;

export default function PollPage() {
  const [activeCategory, setActiveCategory] =
    useState<(typeof POLL_CATEGORIES)[number]>("All");
  const [votes, setVotes] = useState<Record<string, "yes" | "no">>({});

  const handleVote = (id: string, choice: "yes" | "no") => {
    setVotes((prev) => ({ ...prev, [id]: choice }));
  };

  const filtered: PollProposal[] =
    activeCategory === "All"
      ? POLL_PROPOSALS
      : POLL_PROPOSALS.filter((p) => p.category === activeCategory);

  return (
    <main className="min-h-screen bg-evolucent-off-white">
      <section className="bg-evolucent-black py-14 pb-12">
        <div className="mx-auto max-w-[1152px] px-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.12em] text-gold">
            Citizen Poll
          </p>
          <h1 className="mb-4 max-w-[680px] font-display text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-evolucent-off-white">
            Your vote moves
            <br />
            the money.
          </h1>
          <p className="mb-7 max-w-[480px] text-[17px] leading-relaxed text-[#a8a49c]">
            Citizens decide which projects get funded first. Every vote shapes
            where the next pesewa goes.
          </p>
          <div className="inline-flex items-center gap-2.5 rounded-full border border-gold/25 bg-gold/10 px-5 py-2.5">
            <span className="size-[7px] shrink-0 animate-pulse-live rounded-full bg-gold" />
            <span className="font-mono text-sm font-medium tracking-wide text-gold">
              14,302 votes cast this month
            </span>
          </div>
        </div>
      </section>

      <section className="bg-gold">
        <div className="mx-auto grid max-w-[1152px] px-6 md:grid-cols-3">
          {HOW_IT_WORKS.map((item, i) => (
            <div
              key={item.step}
              className={`border-black/12 py-6 pr-4 md:px-7 md:py-6 ${i < 2 ? "md:border-r" : ""}`}
            >
              <span className="mb-1.5 block font-mono text-[11px] font-medium tracking-widest text-black/40">
                {item.step}
              </span>
              <p className="mb-1 font-display text-base font-bold text-evolucent-black">
                {item.title}
              </p>
              <p className="m-0 text-[13px] leading-snug text-black/55">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-[1152px] px-6 py-12">
        <PollLeaderboard proposals={POLL_PROPOSALS} />

        <div className="my-10 h-px bg-evolucent-sand" />

        <div className="mb-7 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Filter
          </span>
          {POLL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`cursor-pointer rounded-full border-[1.5px] px-[18px] py-[7px] text-[13px] font-medium transition-all duration-150 ${
                activeCategory === cat
                  ? "border-evolucent-black bg-evolucent-black text-evolucent-off-white"
                  : "border-border bg-card text-muted-foreground hover:border-evolucent-border-strong"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filtered.map((proposal) => (
            <PollCard
              key={proposal.id}
              proposal={proposal}
              userVote={votes[proposal.id] ?? null}
              onVote={(choice) => handleVote(proposal.id, choice)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
