"use client";

import * as React from "react";
import {
  ALL_PROJECTS,
  filterAndSortProjects,
  type ProjectFilterStatus,
  type ProjectSortOption,
} from "@/lib/projects-data";
import { ProjectFilters, FILTER_CATEGORIES, FILTER_REGIONS } from "@/components/ProjectFilters";
import { ProjectsGrid } from "@/components/ProjectsGrid";

const PAGE_SIZE = 6;

export function ProjectsListing() {
  const [category, setCategory] =
    React.useState<(typeof FILTER_CATEGORIES)[number]>("All");
  const [region, setRegion] =
    React.useState<(typeof FILTER_REGIONS)[number]>("All Regions");
  const [sort, setSort] = React.useState<ProjectSortOption>("Most Urgent");
  const [status, setStatus] = React.useState<ProjectFilterStatus>("All");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(
    () =>
      filterAndSortProjects(ALL_PROJECTS, {
        category,
        region,
        sort,
        status,
      }),
    [category, region, sort, status]
  );

  React.useEffect(() => {
    setPage(1);
  }, [category, region, sort, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  return (
    <>
      <ProjectFilters
        category={category}
        onCategoryChange={setCategory}
        region={region}
        onRegionChange={setRegion}
        sort={sort}
        onSortChange={setSort}
        status={status}
        onStatusChange={setStatus}
      />
      <ProjectsGrid
        projects={filtered}
        page={safePage}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </>
  );
}
