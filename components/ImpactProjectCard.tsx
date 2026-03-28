"use client";

import type { CompletedImpactProject } from "@/lib/impact-projects";

export function ImpactProjectCard({
  project,
}: {
  project: CompletedImpactProject;
}) {
  return (
    <div className="overflow-hidden rounded-[20px] border-[1.5px] border-evolucent-sand bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-civic-green/30 bg-civic-green-light px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-civic-green-dark">
            ✓ Verified Complete
          </span>
          <span className="text-xs text-muted-foreground">
            · Audited by {project.auditor} · {project.completedDate}
          </span>
        </div>
        <span className="rounded-full border border-evolucent-sand bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          {project.region}
        </span>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-2">
        <div className="relative aspect-video overflow-hidden bg-evolucent-sand md:aspect-auto md:min-h-[200px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- external URLs + onError fallback */}
          <img
            src={project.beforeImage}
            alt={`Before: ${project.title}`}
            className="size-full object-cover grayscale-[30%]"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute bottom-3 left-3 rounded-full bg-evolucent-black/75 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-white">
            Before
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 z-10 hidden size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-evolucent-sand bg-card text-sm font-bold text-civic-green md:flex">
          →
        </div>

        <div className="relative aspect-video overflow-hidden bg-civic-green-light md:aspect-auto md:min-h-[200px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.afterImage}
            alt={`After: ${project.title}`}
            className="size-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute bottom-3 right-3 rounded-full bg-civic-green px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-white">
            After
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="mb-2.5 font-display text-[22px] font-extrabold tracking-tight text-evolucent-black">
          {project.title}
        </h3>
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        <div className="mb-5 rounded-lg border border-evolucent-sand border-l-[3px] border-l-civic-green bg-evolucent-off-white px-4 py-3">
          <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-widest text-civic-green-dark">
            Real impact
          </p>
          <p className="m-0 text-sm leading-snug text-evolucent-black">
            {project.impact}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-4 border-y border-evolucent-sand py-4">
          {(
            [
              {
                label: "Total raised",
                value: `GHS ${project.amountRaised.toLocaleString()}`,
                color: undefined as string | undefined,
              },
              {
                label: "Supporters",
                value: project.supporters.toLocaleString(),
                color: undefined,
              },
              {
                label: "Funded",
                value: "100%",
                color: "text-civic-green",
              },
            ] as const
          ).map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className={`mb-0.5 font-mono text-base font-bold ${stat.color ?? "text-evolucent-black"}`}
              >
                {stat.value}
              </p>
              <p className="m-0 text-[11px] uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <a
          href={`/project/${project.id}/report`}
          className="inline-flex items-center gap-1.5 border-b-[1.5px] border-civic-green pb-px text-[13px] font-semibold text-civic-green no-underline"
        >
          View full audit report →
        </a>
      </div>
    </div>
  );
}
