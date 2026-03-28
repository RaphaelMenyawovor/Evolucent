import { prisma } from "@/src/db";

export type ContributorRow = {
  rank: number;
  userId: string;
  name: string | null;
  email: string | null;
  image: string | null;
  region: string | null;
  totalGhs: number;
};

export type RegionGivingRow = {
  rank: number;
  region: string;
  totalGhs: number;
  contributionCount: number;
};

/** Top contributors nationwide by total contribution amount. */
export async function getNationalContributors(
  limit = 25,
): Promise<ContributorRow[]> {
  const grouped = await prisma.contribution.groupBy({
    by: ["userId"],
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: limit,
  });

  if (grouped.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      region: true,
    },
  });
  const byId = new Map(users.map((u) => [u.id, u]));

  return grouped.map((g, i) => {
    const u = byId.get(g.userId);
    return {
      rank: i + 1,
      userId: g.userId,
      name: u?.name ?? null,
      email: u?.email ?? null,
      image: u?.image ?? null,
      region: u?.region ?? null,
      totalGhs: g._sum.amount ?? 0,
    };
  });
}

/** Top contributors where the user has set `region` to the given value. */
export async function getRegionalContributors(
  region: string,
  limit = 25,
): Promise<ContributorRow[]> {
  const regionalUsers = await prisma.user.findMany({
    where: { region },
    select: { id: true },
  });
  const ids = regionalUsers.map((u) => u.id);
  if (ids.length === 0) return [];

  const grouped = await prisma.contribution.groupBy({
    by: ["userId"],
    where: { userId: { in: ids } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: limit,
  });

  if (grouped.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      region: true,
    },
  });
  const byId = new Map(users.map((u) => [u.id, u]));

  return grouped.map((g, i) => {
    const u = byId.get(g.userId);
    return {
      rank: i + 1,
      userId: g.userId,
      name: u?.name ?? null,
      email: u?.email ?? null,
      image: u?.image ?? null,
      region: u?.region ?? null,
      totalGhs: g._sum.amount ?? 0,
    };
  });
}

/** Rank regions by total GHS contributed to projects in each region. */
export async function getRegionsByGiving(
  limit = 16,
): Promise<RegionGivingRow[]> {
  const grouped = await prisma.contribution.groupBy({
    by: ["projectId"],
    _sum: { amount: true },
    _count: { id: true },
  });

  if (grouped.length === 0) return [];

  const projects = await prisma.project.findMany({
    where: { id: { in: grouped.map((g) => g.projectId) } },
    select: { id: true, region: true },
  });
  const projectRegion = new Map(projects.map((p) => [p.id, p.region]));

  const regionTotals = new Map<string, { total: number; count: number }>();
  for (const row of grouped) {
    const reg = projectRegion.get(row.projectId) ?? "Unknown";
    const cur = regionTotals.get(reg) ?? { total: 0, count: 0 };
    cur.total += row._sum.amount ?? 0;
    cur.count += row._count.id;
    regionTotals.set(reg, cur);
  }

  const sorted = [...regionTotals.entries()]
    .map(([region, v]) => ({
      region,
      totalGhs: v.total,
      contributionCount: v.count,
    }))
    .sort((a, b) => b.totalGhs - a.totalGhs)
    .slice(0, limit);

  return sorted.map((r, i) => ({
    rank: i + 1,
    region: r.region,
    totalGhs: r.totalGhs,
    contributionCount: r.contributionCount,
  }));
}
