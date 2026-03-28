type Props = {
  completed: number;
  totalReleased: number;
  totalSupporters: number;
};

export function ImpactStatsStrip({
  completed,
  totalReleased,
  totalSupporters,
}: Props) {
  const stats = [
    { value: `${completed}`, label: "Projects complete" },
    { value: `GHS ${(totalReleased / 1000).toFixed(0)}K`, label: "Released & audited" },
    { value: totalSupporters.toLocaleString(), label: "Citizens who built this" },
    { value: "0", label: "Pesewas unaccounted for" },
  ] as const;

  return (
    <div className="bg-civic-green">
      <div className="mx-auto grid max-w-[1152px] grid-cols-2 px-6 md:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`px-6 py-5 ${i % 2 === 0 ? "max-md:border-r max-md:border-white/15" : ""} ${i < 3 ? "md:border-r md:border-white/15" : ""}`}
          >
            <p className="mb-0.5 font-display text-2xl font-extrabold tracking-tight text-white">
              {stat.value}
            </p>
            <p className="m-0 text-xs tracking-wide text-white/70">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
