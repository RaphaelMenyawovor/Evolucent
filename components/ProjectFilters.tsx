"use client";

import { cn } from "@/lib/utils";
import type { ProjectFilterStatus, ProjectSortOption } from "@/lib/projects-data";

export const FILTER_CATEGORIES = [
  "All",
  "Health",
  "Roads",
  "Education",
  "Water",
  "Infrastructure",
  "Energy",
] as const;

export const FILTER_REGIONS = [
  "All Regions",
  "Greater Accra",
  "Ashanti",
  "Northern",
  "Western",
  "Eastern",
  "Volta",
  "Central",
  "Upper East",
  "Upper West",
  "Bono",
  "Savannah",
  "Bono East",
  "Ahafo",
  "Western North",
  "Oti",
  "North East",
] as const;

export const FILTER_SORT_OPTIONS: ProjectSortOption[] = [
  "Most Urgent",
  "Trending",
  "Near Complete",
  "Newest",
  "Most Funded",
];

const STATUS_OPTIONS: Exclude<ProjectFilterStatus, "All">[] = [
  "Funding",
  "Verified Complete",
  "Urgent",
];

type ProjectFiltersProps = {
  category: (typeof FILTER_CATEGORIES)[number];
  onCategoryChange: (c: (typeof FILTER_CATEGORIES)[number]) => void;
  region: (typeof FILTER_REGIONS)[number];
  onRegionChange: (r: (typeof FILTER_REGIONS)[number]) => void;
  sort: ProjectSortOption;
  onSortChange: (s: ProjectSortOption) => void;
  status: ProjectFilterStatus;
  onStatusChange: (s: ProjectFilterStatus) => void;
};

export function ProjectFilters({
  category,
  onCategoryChange,
  region,
  onRegionChange,
  sort,
  onSortChange,
  status,
  onStatusChange,
}: ProjectFiltersProps) {
  const pillBase =
    "rounded-full border-[1.5px] border-border bg-card px-4 py-1.5 text-[13px] font-medium text-muted-foreground transition-all duration-150 hover:border-foreground/20";
  const pillActive =
    "border-evolucent-black bg-evolucent-black text-evolucent-off-white dark:border-foreground dark:bg-foreground dark:text-background";

  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Category
        </span>
        {FILTER_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className={cn(pillBase, category === cat && pillActive)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 gap-y-3">
        <span className="mr-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Filter
        </span>
        {STATUS_OPTIONS.map((s) => {
          const isOn = status === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onStatusChange(isOn ? "All" : s)}
              className={cn(
                pillBase,
                isOn &&
                  (s === "Urgent"
                    ? "border-0 bg-[var(--evolucent-red)] text-white"
                    : s === "Verified Complete"
                      ? "border-0 bg-civic-green text-white"
                      : pillActive)
              )}
            >
              {s === "Urgent" ? "🚨 " : s === "Verified Complete" ? "✓ " : ""}
              {s}
            </button>
          );
        })}

        <select
          value={region}
          onChange={(e) =>
            onRegionChange(e.target.value as (typeof FILTER_REGIONS)[number])
          }
          className="rounded-full border-[1.5px] border-border bg-card px-4 py-1.5 text-[13px] font-medium text-foreground outline-none"
          aria-label="Region"
        >
          {FILTER_REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as ProjectSortOption)}
          className="ml-auto rounded-full border-[1.5px] border-border bg-card px-4 py-1.5 text-[13px] font-medium text-foreground outline-none md:ml-0"
          aria-label="Sort"
        >
          {FILTER_SORT_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
