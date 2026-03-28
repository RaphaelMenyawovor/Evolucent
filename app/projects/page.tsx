import { ProjectsListing } from "@/components/ProjectsListing";
import { prisma } from "@/src/db";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [activeCount, fundedCount, regionRows, contributorCount] =
    await Promise.all([
      prisma.project.count({ where: { status: "ACTIVE" } }),
      prisma.project.count({ where: { status: "FUNDED" } }),
      prisma.project.findMany({
        select: { region: true },
        distinct: ["region"],
      }),
      prisma.contribution.count({ where: { status: "SUCCESS" } }),
    ]).catch(() => [0, 0, [], 0] as const);

  const stats = [
    { label: "Active Projects", value: activeCount.toString() },
    { label: "Completed", value: fundedCount.toString() },
    {
      label: "Regions Covered",
      value: `${(regionRows as { region: string }[]).length}/16`,
    },
    {
      label: "Total Contributors",
      value: (contributorCount as number).toLocaleString("en-GH"),
    },
  ] as const;

  return (
    <main className="min-h-screen bg-evolucent-off-white dark:bg-background">
      <div className="bg-evolucent-black py-10 pb-12 md:py-12">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-3 font-sans text-xs font-medium uppercase tracking-[0.12em] text-gold">
            All Projects
          </p>
          <h1 className="mb-4 max-w-3xl font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-tight tracking-tight text-evolucent-off-white">
            Every pesewa.
            <br />
            Every project. Public.
          </h1>
          <p className="max-w-md font-sans text-base text-[#A8A49C]">
            Browse all active, pending, and completed civic projects across
            Ghana&apos;s 16 regions.
          </p>
        </div>
      </div>

      <div className="bg-primary py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-6 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <span className="font-display text-[22px] font-extrabold text-evolucent-black">
                {stat.value}
              </span>
              <span className="font-sans text-[13px] text-[#4A3800] dark:text-primary-foreground/90">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <ProjectsListing />
      </div>
    </main>
  );
}
