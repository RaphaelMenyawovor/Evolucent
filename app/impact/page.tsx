import { ImpactProjectCard } from "@/components/ImpactProjectCard";
import { ImpactStatsStrip } from "@/components/ImpactStatsStrip";
import { COMPLETED_IMPACT_PROJECTS } from "@/lib/impact-projects";

const TOTAL_RELEASED = COMPLETED_IMPACT_PROJECTS.reduce(
  (sum, p) => sum + p.amountRaised,
  0,
);
const TOTAL_SUPPORTERS = COMPLETED_IMPACT_PROJECTS.reduce(
  (sum, p) => sum + p.supporters,
  0,
);

export default function ImpactPage() {
  const n = COMPLETED_IMPACT_PROJECTS.length;

  return (
    <main className="min-h-screen bg-evolucent-off-white">
      <section className="bg-evolucent-black py-14 pb-12">
        <div className="mx-auto max-w-[1152px] px-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.12em] text-civic-green">
            Verified Impact
          </p>
          <h1 className="mb-4 max-w-[680px] font-display text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-evolucent-off-white">
            This is what your
            <br />
            money built.
          </h1>
          <p className="mb-7 max-w-[520px] text-[17px] leading-relaxed text-[#a8a49c]">
            Every project here is independently verified complete. Before and
            after proof is public. Every pesewa is accounted for.
          </p>

          <div className="flex flex-wrap gap-3">
            {[
              { value: `${n}`, label: "Projects complete" },
              {
                value: `GHS ${(TOTAL_RELEASED / 1000).toFixed(0)}K`,
                label: "Released & verified",
              },
              {
                value: TOTAL_SUPPORTERS.toLocaleString(),
                label: "Citizens contributed",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="inline-flex items-center gap-2 rounded-full border border-civic-green/25 bg-civic-green/10 px-[18px] py-2"
              >
                <span className="font-mono text-[15px] font-bold text-civic-green">
                  {stat.value}
                </span>
                <span className="text-[13px] text-[#a8a49c]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ImpactStatsStrip
        completed={n}
        totalReleased={TOTAL_RELEASED}
        totalSupporters={TOTAL_SUPPORTERS}
      />

      <div className="mx-auto max-w-[1152px] px-6 py-12">
        <div className="mb-8 flex flex-wrap items-baseline gap-3">
          <h2 className="font-display text-[26px] font-extrabold tracking-tight text-evolucent-black">
            Completed & verified
          </h2>
          <span className="rounded-full bg-civic-green-light px-2.5 py-0.5 font-mono text-[13px] text-civic-green">
            {n} projects
          </span>
        </div>

        <div className="flex flex-col gap-6">
          {COMPLETED_IMPACT_PROJECTS.map((project) => (
            <ImpactProjectCard key={project.id} project={project} />
          ))}
        </div>

        <div className="mt-14 rounded-[20px] bg-evolucent-black px-6 py-10 text-center md:px-10">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-gold">
            The Zero Waste Pledge
          </p>
          <h3 className="mb-3 font-display text-[28px] font-extrabold tracking-tight text-evolucent-off-white">
            Every pesewa. Accounted for.
          </h3>
          <p className="mx-auto mb-6 max-w-[520px] text-[15px] leading-relaxed text-[#a8a49c]">
            We publish a full public financial report every month — total in,
            total out, every project, every bank statement. Nothing hidden.
          </p>
          <a
            href="/reports"
            className="inline-block rounded-[10px] bg-gold px-7 py-3 text-sm font-semibold tracking-tight text-evolucent-black no-underline"
          >
            View monthly reports →
          </a>
        </div>
      </div>
    </main>
  );
}
