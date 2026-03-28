import { config } from "dotenv"
config()

import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "../src/generated/prisma"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const PROJECTS = [
  { id: "proj-kumasi-solar", title: "Kumasi Central Market solar lighting", description: "The Kumasi Central Market serves over 20,000 traders daily. This project installs commercial-grade solar streetlights across main arteries. Funds stay in escrow until independent audit clears release.", region: "Ashanti Region", goalAmount: 50_000, currentAmount: 34_200 },
  { id: "proj-accra-drains", title: "Accra flood drain clearance", description: "Watch it happen — live ledger, every pesewa tracked. Clearing clogged drains across Accra to prevent seasonal flooding.", region: "Greater Accra", goalAmount: 15_000, currentAmount: 1_200 },
  { id: "proj-tamale-it", title: "Tamale community IT centre renovation", description: "Verified and complete. Impact report incoming. Renovating the community IT centre to serve Northern Region youth.", region: "Northern Region", goalAmount: 20_000, currentAmount: 20_000 },
  { id: "proj-cape-coast-clinic", title: "Cape Coast rural clinic water tanks", description: "Zero waste pledge on the monthly report badge. Installing water storage tanks for rural clinics in the Central Region.", region: "Central Region", goalAmount: 80_000, currentAmount: 62_400 },
  { id: "proj-ho-water", title: "Ho municipal water extension", description: "Pipes and pumps for three adjoining communities. Extending municipal water supply in the Volta Region.", region: "Volta Region", goalAmount: 70_000, currentAmount: 45_100 },
  { id: "proj-wa-solar-school", title: "Wa senior high solar classrooms", description: "Reliable power for labs and evening prep. Solar-powered classrooms for Wa Senior High School.", region: "Upper West Region", goalAmount: 55_000, currentAmount: 28_900 },
  { id: "proj-tema-road", title: "Tema community link road resurfacing", description: "Safer access to the industrial corridor. Resurfacing key community link roads in Tema.", region: "Greater Accra", goalAmount: 120_000, currentAmount: 88_000 },
  { id: "proj-sunyani-market", title: "Sunyani market waste segregation hub", description: "Urgent sanitation upgrade before rainy season. Building a waste segregation hub at Sunyani central market.", region: "Bono Region", goalAmount: 35_000, currentAmount: 9_200 },
  { id: "proj-koforidua-clinic", title: "Koforidua maternal health wing", description: "Citizens voted this as top regional priority. Expanding the maternal health wing at Koforidua hospital.", region: "Eastern Region", goalAmount: 140_000, currentAmount: 112_000 },
  { id: "proj-takoradi-pier", title: "Takoradi fish landing pier repairs", description: "Structural audit complete; funding for works. Repairing the fish landing pier at Takoradi harbour.", region: "Western Region", goalAmount: 90_000, currentAmount: 54_300 },
  { id: "proj-damongo-solar", title: "Damongo rural health post solar", description: "Cold chain for vaccines — every pesewa visible. Solar installation for rural health posts in the Savannah Region.", region: "Savannah Region", goalAmount: 28_000, currentAmount: 15_600 },
  { id: "proj-bolga-boreholes", title: "Bolgatanga peri-urban boreholes", description: "Six mechanised boreholes with public ledger. Drilling boreholes in peri-urban areas around Bolgatanga.", region: "Upper East Region", goalAmount: 95_000, currentAmount: 76_500 },
  { id: "proj-dambai-ferry", title: "Dambai crossing safety upgrades", description: "Lighting and barriers — board-governed escrow. Safety upgrades at the Dambai river crossing.", region: "Oti Region", goalAmount: 48_000, currentAmount: 33_000 },
  { id: "proj-goaso-clinic", title: "Goaso CHPS compound expansion", description: "Outpatient capacity for two districts. Expanding the CHPS compound to serve Goaso and surrounding districts.", region: "Ahafo Region", goalAmount: 65_000, currentAmount: 41_800 },
  { id: "proj-nalerigu-lab", title: "Nalerigu diagnostic lab equipment", description: "Critical need — independent verification on release. Equipping the diagnostic laboratory at Nalerigu hospital.", region: "North East Region", goalAmount: 42_000, currentAmount: 19_400 },
  { id: "proj-sekondi-youth", title: "Sekondi youth ICT hub", description: "Verified complete — impact report published. Youth ICT training hub in Sekondi.", region: "Western Region", goalAmount: 100_000, currentAmount: 100_000 },
  { id: "proj-techiman-energy", title: "Techiman market LED retrofit", description: "Lower bills, brighter stalls — civic fund. LED lighting retrofit for Techiman central market.", region: "Bono East Region", goalAmount: 40_000, currentAmount: 22_100 },
  { id: "proj-ellembelle-solar", title: "Ellembelle community solar streetlights", description: "Coastal communities — high visibility on ledger. Solar streetlights for communities in the Ellembelle district.", region: "Western North Region", goalAmount: 32_000, currentAmount: 8_400 },
]

async function main() {
  console.log("Seeding projects...")

  for (const project of PROJECTS) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: {
        title: project.title,
        description: project.description,
        region: project.region,
        goalAmount: project.goalAmount,
        currentAmount: project.currentAmount,
      },
      create: {
        id: project.id,
        title: project.title,
        description: project.description,
        region: project.region,
        goalAmount: project.goalAmount,
        currentAmount: project.currentAmount,
        status: "ACTIVE",
      },
    })
    console.log(`  ✓ ${project.id}`)
  }

  console.log(`\nSeeded ${PROJECTS.length} projects.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
