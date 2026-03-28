import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GHANA_REGIONS } from "@/lib/ghana-regions";
import {
  getNationalContributors,
  getRegionalContributors,
  getRegionsByGiving,
  type ContributorRow,
} from "@/lib/leaderboard";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Leaderboards | Evolucent",
  description:
    "Top civic contributors nationwide and by region — plus which regions receive the most support.",
};

export const dynamic = "force-dynamic";

function contributorLabel(row: ContributorRow) {
  if (row.name?.trim()) return row.name.trim();
  if (row.email?.trim()) return row.email.split("@")[0] ?? row.email;
  return "Citizen";
}

function RankBadge({ rank }: { rank: number }) {
  const gold = rank === 1;
  const silver = rank === 2;
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-extrabold",
        gold && "bg-gold text-evolucent-black",
        silver && "bg-evolucent-sand text-evolucent-black",
        !gold && !silver && "bg-evolucent-off-white text-muted-foreground ring-1 ring-border",
      )}
    >
      {rank}
    </span>
  );
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const { region: regionParam } = await searchParams;
  const selectedRegion =
    regionParam &&
    GHANA_REGIONS.includes(regionParam as (typeof GHANA_REGIONS)[number])
      ? regionParam
      : null;

  const [national, regional, regionGiving] = await Promise.all([
    getNationalContributors(20),
    selectedRegion
      ? getRegionalContributors(selectedRegion, 20)
      : Promise.resolve([] as Awaited<ReturnType<typeof getRegionalContributors>>),
    getRegionsByGiving(16),
  ]);

  const maxRegionGhs =
    regionGiving.length > 0 ? regionGiving[0]!.totalGhs : 1;

  return (
    <main className="min-h-screen bg-evolucent-off-white">
      <section className="border-b border-evolucent-sand bg-evolucent-black px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-[1152px]">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-gold">
            Civic leaderboards
          </p>
          <h1 className="mb-3 max-w-[640px] font-display text-3xl font-extrabold tracking-tight text-evolucent-off-white sm:text-4xl">
            Who&apos;s building Ghana together
          </h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-[#a8a49c]">
            Rankings use total verified contribution amounts on Evolucent.
            Regional lists include citizens who set their home region in{" "}
            <Link
              href="/account/profile"
              className="font-semibold text-gold underline-offset-2 hover:underline"
            >
              Profile
            </Link>
            .
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1152px] space-y-12 px-4 py-10 sm:px-6">
        {/* Nationwide */}
        <section>
          <div className="mb-6 flex flex-wrap items-baseline gap-3">
            <h2 className="font-display text-xl font-extrabold text-evolucent-black sm:text-2xl">
              Nationwide — top contributors
            </h2>
            <span className="rounded-full bg-civic-green-light px-2.5 py-0.5 font-mono text-xs text-civic-green-dark">
              All regions
            </span>
          </div>
          {national.length === 0 ? (
            <p className="rounded-xl border border-evolucent-sand bg-card p-6 text-sm text-muted-foreground">
              No contributions recorded yet. Be the first to back a project.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {national.map((row) => (
                <li
                  key={row.userId}
                  className="flex items-center gap-4 rounded-xl border border-evolucent-sand bg-card p-4 shadow-evolucent-card"
                >
                  <RankBadge rank={row.rank} />
                  {row.image ? (
                    <Image
                      src={row.image}
                      alt=""
                      width={44}
                      height={44}
                      className="size-11 shrink-0 rounded-full border border-evolucent-sand object-cover"
                    />
                  ) : (
                    <div
                      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold/15 font-display text-sm font-bold text-gold-dark"
                      aria-hidden
                    >
                      {contributorLabel(row).slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-evolucent-black">
                      {contributorLabel(row)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.region ? `${row.region}` : "Region not set"}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-sm font-bold text-civic-green-dark sm:text-base">
                    GHS {row.totalGhs.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* By region */}
        <section>
          <div className="mb-4 flex flex-wrap items-baseline gap-3">
            <h2 className="font-display text-xl font-extrabold text-evolucent-black sm:text-2xl">
              By region — top contributors
            </h2>
          </div>
          <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
            Pick a region to see supporters who listed that area on their
            profile. Empty until citizens add a region.
          </p>
          <div className="mb-6 flex flex-wrap gap-2">
            <Link
              href="/leaderboard"
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                !selectedRegion
                  ? "border-evolucent-black bg-evolucent-black text-evolucent-off-white"
                  : "border-border bg-card text-muted-foreground hover:border-evolucent-border-strong",
              )}
            >
              All (see nationwide above)
            </Link>
            {GHANA_REGIONS.map((r) => (
              <Link
                key={r}
                href={`/leaderboard?region=${encodeURIComponent(r)}`}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  selectedRegion === r
                    ? "border-evolucent-black bg-evolucent-black text-evolucent-off-white"
                    : "border-border bg-card text-muted-foreground hover:border-evolucent-border-strong",
                )}
              >
                {r}
              </Link>
            ))}
          </div>
          {selectedRegion ? (
            regional.length === 0 ? (
              <p className="rounded-xl border border-evolucent-sand bg-card p-6 text-sm text-muted-foreground">
                No ranked contributors in <strong>{selectedRegion}</strong> yet.
                Set your region in{" "}
                <Link
                  href="/account/profile"
                  className="font-semibold text-civic-green underline-offset-2 hover:underline"
                >
                  Profile
                </Link>{" "}
                and encourage others in your area.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {regional.map((row) => (
                  <li
                    key={row.userId}
                    className="flex items-center gap-4 rounded-xl border border-evolucent-sand bg-card p-4 shadow-evolucent-card"
                  >
                    <RankBadge rank={row.rank} />
                    {row.image ? (
                      <Image
                        src={row.image}
                        alt=""
                        width={44}
                        height={44}
                        className="size-11 shrink-0 rounded-full border border-evolucent-sand object-cover"
                      />
                    ) : (
                      <div
                        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold/15 font-display text-sm font-bold text-gold-dark"
                        aria-hidden
                      >
                        {contributorLabel(row).slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-evolucent-black">
                        {contributorLabel(row)}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-sm font-bold text-civic-green-dark sm:text-base">
                      GHS {row.totalGhs.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a region pill above to load its leaderboard.
            </p>
          )}
        </section>

        {/* Regions by giving */}
        <section>
          <div className="mb-6 flex flex-wrap items-baseline gap-3">
            <h2 className="font-display text-xl font-extrabold text-evolucent-black sm:text-2xl">
              Regions by civic giving
            </h2>
            <span className="rounded-full bg-gold/20 px-2.5 py-0.5 font-mono text-xs text-gold-dark">
              By project location
            </span>
          </div>
          <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
            Total GHS contributed to projects based in each region — a view of
            where support is flowing across the country.
          </p>
          {regionGiving.length === 0 ? (
            <p className="rounded-xl border border-evolucent-sand bg-card p-6 text-sm text-muted-foreground">
              No regional totals yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {regionGiving.map((row) => {
                const pct = Math.round((row.totalGhs / maxRegionGhs) * 100);
                return (
                  <li
                    key={row.region}
                    className="rounded-xl border border-evolucent-sand bg-card p-4 shadow-evolucent-card"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <RankBadge rank={row.rank} />
                        <span className="font-semibold text-evolucent-black">
                          {row.region}
                        </span>
                      </div>
                      <span className="font-mono text-sm font-bold text-civic-green-dark">
                        GHS {row.totalGhs.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-evolucent-sand">
                      <div
                        className="h-full rounded-full bg-civic-green transition-[width] duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {row.contributionCount} contribution
                      {row.contributionCount === 1 ? "" : "s"}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
