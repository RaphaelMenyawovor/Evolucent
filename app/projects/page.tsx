import { prisma } from "@/src/db";
import { ProjectsListing } from "@/components/ProjectsListing";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [dbProjects, contributorCount, projectCounts] = await Promise.all([
    prisma.project.findMany({
      select: { id: true, currentAmount: true, region: true },
    }),
    prisma.contribution.groupBy({
      by: ["userId"],
      where: { status: "SUCCESS" },
    }),
    prisma.project.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  const progressMap: Record<string, number> = {};
  for (const p of dbProjects) {
    progressMap[p.id] = p.currentAmount;
  }

  const uniqueRegions = new Set(dbProjects.map((p) => p.region));
  const activeCount =
    projectCounts.find((g) => g.status === "ACTIVE")?._count.id ?? 0;
  const totalProjects = projectCounts.reduce((sum, g) => sum + g._count.id, 0);
  const completedCount = totalProjects - activeCount;

  const stats = [
    { label: "Active Projects", value: String(activeCount || dbProjects.length) },
    { label: "Completed", value: String(completedCount) },
    { label: "Regions Covered", value: `${uniqueRegions.size}/16` },
    { label: "Total Contributors", value: contributorCount.length.toLocaleString() },
  ];

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
        <ProjectsListing progressMap={progressMap} />
      </div>
    </main>
  );
}
