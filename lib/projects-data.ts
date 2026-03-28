/** Shared mock civic projects — replace with DB / API later. */

export type ProjectUrgency = "critical" | "high" | "medium" | "funded";

export type CivicProject = {
  id: string;
  title: string;
  region: string;
  category: string;
  raised: number;
  target: number;
  supporters: number;
  urgency: ProjectUrgency;
  blurb: string;
};

export const ALL_PROJECTS: CivicProject[] = [
  {
    id: "proj-kumasi-solar",
    title: "Kumasi Central Market solar lighting",
    region: "Ashanti Region",
    category: "Infrastructure",
    raised: 34_200,
    target: 50_000,
    supporters: 847,
    urgency: "high",
    blurb: "Night trading safety for 20,000+ traders. Citizens chose this.",
  },
  {
    id: "proj-accra-drains",
    title: "Accra flood drain clearance",
    region: "Greater Accra",
    category: "Water",
    raised: 1_200,
    target: 15_000,
    supporters: 112,
    urgency: "critical",
    blurb: "Watch it happen — live ledger, every pesewa tracked.",
  },
  {
    id: "proj-tamale-it",
    title: "Tamale community IT centre renovation",
    region: "Northern Region",
    category: "Education",
    raised: 20_000,
    target: 20_000,
    supporters: 420,
    urgency: "funded",
    blurb: "Verified and complete. Impact report incoming.",
  },
  {
    id: "proj-cape-coast-clinic",
    title: "Cape Coast rural clinic water tanks",
    region: "Central Region",
    category: "Health",
    raised: 62_400,
    target: 80_000,
    supporters: 2_031,
    urgency: "medium",
    blurb: "Zero waste pledge on the monthly report badge.",
  },
  {
    id: "proj-ho-water",
    title: "Ho municipal water extension",
    region: "Volta Region",
    category: "Water",
    raised: 45_100,
    target: 70_000,
    supporters: 612,
    urgency: "high",
    blurb: "Pipes and pumps for three adjoining communities.",
  },
  {
    id: "proj-wa-solar-school",
    title: "Wa senior high solar classrooms",
    region: "Upper West Region",
    category: "Energy",
    raised: 28_900,
    target: 55_000,
    supporters: 340,
    urgency: "medium",
    blurb: "Reliable power for labs and evening prep.",
  },
  {
    id: "proj-tema-road",
    title: "Tema community link road resurfacing",
    region: "Greater Accra",
    category: "Roads",
    raised: 88_000,
    target: 120_000,
    supporters: 1_890,
    urgency: "medium",
    blurb: "Safer access to the industrial corridor.",
  },
  {
    id: "proj-sunyani-market",
    title: "Sunyani market waste segregation hub",
    region: "Bono Region",
    category: "Infrastructure",
    raised: 9_200,
    target: 35_000,
    supporters: 156,
    urgency: "critical",
    blurb: "Urgent sanitation upgrade before rainy season.",
  },
  {
    id: "proj-koforidua-clinic",
    title: "Koforidua maternal health wing",
    region: "Eastern Region",
    category: "Health",
    raised: 112_000,
    target: 140_000,
    supporters: 3_400,
    urgency: "high",
    blurb: "Citizens voted this as top regional priority.",
  },
  {
    id: "proj-takoradi-pier",
    title: "Takoradi fish landing pier repairs",
    region: "Western Region",
    category: "Infrastructure",
    raised: 54_300,
    target: 90_000,
    supporters: 721,
    urgency: "medium",
    blurb: "Structural audit complete; funding for works.",
  },
  {
    id: "proj-damongo-solar",
    title: "Damongo rural health post solar",
    region: "Savannah Region",
    category: "Energy",
    raised: 15_600,
    target: 28_000,
    supporters: 203,
    urgency: "high",
    blurb: "Cold chain for vaccines — every pesewa visible.",
  },
  {
    id: "proj-bolga-boreholes",
    title: "Bolgatanga peri-urban boreholes",
    region: "Upper East Region",
    category: "Water",
    raised: 76_500,
    target: 95_000,
    supporters: 1_102,
    urgency: "medium",
    blurb: "Six mechanised boreholes with public ledger.",
  },
  {
    id: "proj-dambai-ferry",
    title: "Dambai crossing safety upgrades",
    region: "Oti Region",
    category: "Roads",
    raised: 33_000,
    target: 48_000,
    supporters: 445,
    urgency: "medium",
    blurb: "Lighting and barriers — board-governed escrow.",
  },
  {
    id: "proj-goaso-clinic",
    title: "Goaso CHPS compound expansion",
    region: "Ahafo Region",
    category: "Health",
    raised: 41_800,
    target: 65_000,
    supporters: 589,
    urgency: "high",
    blurb: "Outpatient capacity for two districts.",
  },
  {
    id: "proj-nalerigu-lab",
    title: "Nalerigu diagnostic lab equipment",
    region: "North East Region",
    category: "Health",
    raised: 19_400,
    target: 42_000,
    supporters: 267,
    urgency: "critical",
    blurb: "Critical need — independent verification on release.",
  },
  {
    id: "proj-sekondi-youth",
    title: "Sekondi youth ICT hub",
    region: "Western Region",
    category: "Education",
    raised: 100_000,
    target: 100_000,
    supporters: 2_100,
    urgency: "funded",
    blurb: "Verified complete — impact report published.",
  },
  {
    id: "proj-techiman-energy",
    title: "Techiman market LED retrofit",
    region: "Bono East Region",
    category: "Energy",
    raised: 22_100,
    target: 40_000,
    supporters: 388,
    urgency: "medium",
    blurb: "Lower bills, brighter stalls — civic fund.",
  },
  {
    id: "proj-ellembelle-solar",
    title: "Ellembelle community solar streetlights",
    region: "Western North Region",
    category: "Energy",
    raised: 8_400,
    target: 32_000,
    supporters: 94,
    urgency: "critical",
    blurb: "Coastal communities — high visibility on ledger.",
  },
];

export type ProjectFilterStatus = "All" | "Funding" | "Verified Complete" | "Urgent";

export type ProjectSortOption =
  | "Most Urgent"
  | "Trending"
  | "Near Complete"
  | "Newest"
  | "Most Funded";

export function projectMatchesStatus(
  p: CivicProject,
  status: ProjectFilterStatus
): boolean {
  if (status === "All") return true;
  if (status === "Urgent") return p.urgency === "critical";
  if (status === "Verified Complete") return p.urgency === "funded";
  if (status === "Funding")
    return p.urgency === "high" || p.urgency === "medium" || p.urgency === "critical";
  return true;
}

/** Match dropdown region to project.region (handles "Ashanti" vs "Ashanti Region"). */
export function regionMatchesFilter(projectRegion: string, filter: string): boolean {
  if (filter === "All Regions") return true;
  const pr = projectRegion.toLowerCase().replace(/\s+region$/i, "").trim();
  const fr = filter.toLowerCase().replace(/\s+region$/i, "").trim();
  return pr.includes(fr) || fr.includes(pr) || projectRegion.toLowerCase().includes(fr);
}

export function filterAndSortProjects(
  projects: CivicProject[],
  opts: {
    category: string;
    region: string;
    sort: ProjectSortOption;
    status: ProjectFilterStatus;
  }
): CivicProject[] {
  let list = projects.filter((p) => {
    if (opts.category !== "All" && p.category !== opts.category) return false;
    if (!regionMatchesFilter(p.region, opts.region)) return false;
    if (!projectMatchesStatus(p, opts.status)) return false;
    return true;
  });

  const urgencyOrder: Record<ProjectUrgency, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    funded: 3,
  };

  switch (opts.sort) {
    case "Most Urgent":
      list = [...list].sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
      break;
    case "Trending":
      list = [...list].sort((a, b) => b.supporters - a.supporters);
      break;
    case "Near Complete":
      list = [...list].sort(
        (a, b) => b.raised / b.target - a.raised / a.target
      );
      break;
    case "Newest":
      list = [...list].reverse();
      break;
    case "Most Funded":
      list = [...list].sort((a, b) => b.raised - a.raised);
      break;
    default:
      break;
  }

  return list;
}
