import type { PollProposal } from "@/lib/poll-proposals";

const RANK_STYLES = [
  { bg: "bg-gold", color: "text-evolucent-black" },
  { bg: "bg-evolucent-sand", color: "text-evolucent-black" },
  { bg: "bg-evolucent-sand", color: "text-muted-foreground" },
] as const;

export function PollLeaderboard({ proposals }: { proposals: PollProposal[] }) {
  const sorted = [...proposals]
    .sort((a, b) => b.yesVotes - a.yesVotes)
    .slice(0, 3);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-baseline gap-3">
        <h2 className="font-display text-[22px] font-extrabold tracking-tight text-evolucent-black">
          Top voted this month
        </h2>
        <span className="text-[13px] text-muted-foreground">
          Projects citizens are backing most
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {sorted.map((p, i) => {
          const pct = Math.round((p.yesVotes / p.totalVotes) * 100);
          const rank = RANK_STYLES[i] ?? RANK_STYLES[2];
          return (
            <div
              key={p.id}
              className="grid grid-cols-[40px_1fr_80px] items-center gap-4 rounded-xl border border-evolucent-sand bg-card px-5 py-4"
            >
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-full font-display text-[15px] font-extrabold ${rank.bg} ${rank.color}`}
              >
                {i + 1}
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-evolucent-black">
                  {p.title}
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-evolucent-sand">
                  <div
                    className={`h-full rounded-full transition-[width] duration-1000 ease-out ${i === 0 ? "bg-gold" : "bg-civic-green"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`font-mono text-lg font-bold ${i === 0 ? "text-gold-dark" : "text-civic-green-dark"}`}
                >
                  {pct}%
                </span>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  YES votes
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
