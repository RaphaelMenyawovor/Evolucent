export type CompletedImpactProject = {
  id: string;
  title: string;
  region: string;
  category: string;
  description: string;
  amountRaised: number;
  targetAmount: number;
  supporters: number;
  completedDate: string;
  auditor: string;
  beforeImage: string;
  afterImage: string;
  impact: string;
};

export const COMPLETED_IMPACT_PROJECTS: CompletedImpactProject[] = [
  {
    id: "proj-tamale-it",
    title: "Tamale Community IT Centre Renovation",
    region: "Northern Region",
    category: "Education",
    description:
      "Full renovation of the Tamale Zogbeli IT centre — replacing all computers, fixing the roof, and installing reliable solar power backup for uninterrupted learning.",
    amountRaised: 20_000,
    targetAmount: 20_000,
    supporters: 420,
    completedDate: "January 2026",
    auditor: "KPMG Ghana",
    beforeImage:
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1200&auto=format&fit=crop",
    afterImage:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
    impact:
      "340 students now have access to working computers and internet for the first time.",
  },
  {
    id: "c2",
    title: "Kumasi Suame Road Resurfacing",
    region: "Ashanti Region",
    category: "Roads",
    description:
      "Resurfaced 1.2km of the Suame Magazine access road, improving daily movement for over 22,000 traders and residents.",
    amountRaised: 55_000,
    targetAmount: 55_000,
    supporters: 1840,
    completedDate: "December 2025",
    auditor: "Deloitte Ghana",
    beforeImage:
      "https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=1200&auto=format&fit=crop",
    afterImage:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1200&auto=format&fit=crop",
    impact:
      "22,000 daily users. Truck delivery times cut by 40%. Zero flood disruptions this rainy season.",
  },
  {
    id: "c3",
    title: "Accra Korle-Bu Borehole Project",
    region: "Greater Accra",
    category: "Water",
    description:
      "Installed a solar-powered borehole serving 3 communities in the Korle-Bu catchment area, providing clean water to 4,200 residents.",
    amountRaised: 38_000,
    targetAmount: 38_000,
    supporters: 980,
    completedDate: "November 2025",
    auditor: "PwC Ghana",
    beforeImage:
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=1200&auto=format&fit=crop",
    afterImage:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1200&auto=format&fit=crop",
    impact:
      "4,200 residents now have clean water access. Waterborne disease cases down 60% in Q4 2025.",
  },
];
