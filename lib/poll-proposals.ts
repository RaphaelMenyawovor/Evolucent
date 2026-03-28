export type PollProposal = {
  id: string;
  title: string;
  description: string;
  region: string;
  category: string;
  urgency: number;
  yesVotes: number;
  totalVotes: number;
  daysLeft: number;
};

export const POLL_PROPOSALS: PollProposal[] = [
  {
    id: "p1",
    title: "Kumasi Central Market Water Access",
    description:
      "Over 8,000 traders at Kumasi Central Market have no reliable access to clean water. This project installs 4 permanent water stations with filtration.",
    region: "Ashanti",
    category: "Water",
    urgency: 89,
    yesVotes: 3240,
    totalVotes: 3640,
    daysLeft: 12,
  },
  {
    id: "p2",
    title: "Accra Flood Drain Rehabilitation",
    description:
      "Three major drains in Adabraka and Kaneshie overflow every rainy season, flooding homes and destroying livelihoods. This project clears and lines 2.4km of drainage.",
    region: "Greater Accra",
    category: "Infrastructure",
    urgency: 94,
    yesVotes: 4102,
    totalVotes: 4580,
    daysLeft: 8,
  },
  {
    id: "p3",
    title: "Tamale Primary School Roof Repair",
    description:
      "4 classrooms at Tamale Zogbeli Primary School have no functional roofing. Students and teachers cannot use them during rainy season — affecting 320 children.",
    region: "Northern",
    category: "Education",
    urgency: 81,
    yesVotes: 2190,
    totalVotes: 3010,
    daysLeft: 19,
  },
  {
    id: "p4",
    title: "Cape Coast Clinic Generator Fund",
    description:
      "Assin Fosu Health Centre loses power 3–5 times per week. A backup generator ensures night deliveries, surgeries, and refrigerated vaccines are never interrupted.",
    region: "Central",
    category: "Health",
    urgency: 77,
    yesVotes: 1870,
    totalVotes: 2640,
    daysLeft: 24,
  },
  {
    id: "p5",
    title: "Ho Market Road Resurfacing",
    description:
      "The main access road to Ho Central Market has been impassable for trucks since 2023, raising the cost of goods for 12,000 daily users.",
    region: "Volta",
    category: "Roads",
    urgency: 68,
    yesVotes: 980,
    totalVotes: 1620,
    daysLeft: 30,
  },
];

export const POLL_CATEGORIES = [
  "All",
  "Health",
  "Roads",
  "Education",
  "Water",
  "Infrastructure",
  "Energy",
] as const;
