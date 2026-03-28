import 'dotenv/config'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '../src/generated/prisma/client'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

/**
 * Projects are seeded with their canonical slug IDs so that:
 * 1. The /project/[id] detail page resolves them from the DB
 * 2. verifyPayment can update Project.currentAmount correctly
 *
 * IDs must match lib/projects-data.ts ALL_PROJECTS and MOCK_BY_ID.
 */
const PROJECTS = [
  {
    id: 'proj-kumasi-solar',
    title: 'Kumasi Central Market solar lighting',
    description:
      'The Kumasi Central Market serves over 20,000 traders daily. This project installs commercial-grade solar streetlights across main arteries. Funds stay in escrow until independent audit clears release.',
    region: 'Ashanti Region',
    goalAmount: 50_000,
    currentAmount: 34_200,
    status: 'ACTIVE',
  },
  {
    id: 'proj-accra-drains',
    title: 'Accra flood drain clearance',
    description:
      'Watch it happen — live ledger, every pesewa tracked. Clearing and reinforcing key drainage channels to prevent seasonal flooding in Greater Accra.',
    region: 'Greater Accra',
    goalAmount: 15_000,
    currentAmount: 1_200,
    status: 'ACTIVE',
  },
  {
    id: 'proj-tamale-it',
    title: 'Tamale community IT centre renovation',
    description:
      'Verified and complete. Impact report incoming. Full renovation of the Tamale community ICT centre including new equipment and reliable power.',
    region: 'Northern Region',
    goalAmount: 20_000,
    currentAmount: 20_000,
    status: 'FUNDED',
  },
  {
    id: 'proj-cape-coast-clinic',
    title: 'Cape Coast rural clinic water tanks',
    description:
      'Zero waste pledge on the monthly report badge. Installation of high-capacity water storage tanks at Cape Coast rural clinic to ensure uninterrupted supply.',
    region: 'Central Region',
    goalAmount: 80_000,
    currentAmount: 62_400,
    status: 'ACTIVE',
  },
  {
    id: 'proj-ho-water',
    title: 'Ho municipal water extension',
    description:
      'Pipes and pumps for three adjoining communities. Extension of the municipal water network to underserved peri-urban areas of Ho.',
    region: 'Volta Region',
    goalAmount: 70_000,
    currentAmount: 45_100,
    status: 'ACTIVE',
  },
  {
    id: 'proj-wa-solar-school',
    title: 'Wa senior high solar classrooms',
    description:
      'Reliable power for labs and evening prep. Solar PV systems installed across six classrooms and the science lab at Wa Senior High School.',
    region: 'Upper West Region',
    goalAmount: 55_000,
    currentAmount: 28_900,
    status: 'ACTIVE',
  },
  {
    id: 'proj-tema-road',
    title: 'Tema community link road resurfacing',
    description:
      'Safer access to the industrial corridor. Full resurfacing of 2.4 km of community access road linking residential areas to the Tema industrial zone.',
    region: 'Greater Accra',
    goalAmount: 120_000,
    currentAmount: 88_000,
    status: 'ACTIVE',
  },
  {
    id: 'proj-sunyani-market',
    title: 'Sunyani market waste segregation hub',
    description:
      'Urgent sanitation upgrade before rainy season. Construction of a covered waste segregation station at Sunyani central market.',
    region: 'Bono Region',
    goalAmount: 35_000,
    currentAmount: 9_200,
    status: 'ACTIVE',
  },
  {
    id: 'proj-koforidua-clinic',
    title: 'Koforidua maternal health wing',
    description:
      'Citizens voted this as top regional priority. New maternal health wing at the Koforidua Regional Hospital, adding 10 beds and a dedicated delivery suite.',
    region: 'Eastern Region',
    goalAmount: 140_000,
    currentAmount: 112_000,
    status: 'ACTIVE',
  },
  {
    id: 'proj-takoradi-pier',
    title: 'Takoradi fish landing pier repairs',
    description:
      'Structural audit complete; funding for works. Repair and reinforcement of the Takoradi fish landing pier following a structural audit.',
    region: 'Western Region',
    goalAmount: 90_000,
    currentAmount: 54_300,
    status: 'ACTIVE',
  },
  {
    id: 'proj-damongo-solar',
    title: 'Damongo rural health post solar',
    description:
      'Cold chain for vaccines — every pesewa visible. Solar power system for the Damongo rural health post, enabling a reliable cold chain for vaccine storage.',
    region: 'Savannah Region',
    goalAmount: 28_000,
    currentAmount: 15_600,
    status: 'ACTIVE',
  },
  {
    id: 'proj-bolga-boreholes',
    title: 'Bolgatanga peri-urban boreholes',
    description:
      'Six mechanised boreholes with public ledger. Construction of six solar-powered mechanised boreholes serving peri-urban communities around Bolgatanga.',
    region: 'Upper East Region',
    goalAmount: 95_000,
    currentAmount: 76_500,
    status: 'ACTIVE',
  },
  {
    id: 'proj-dambai-ferry',
    title: 'Dambai crossing safety upgrades',
    description:
      'Lighting and barriers — board-governed escrow. Installation of solar lighting and safety barriers at the Dambai river crossing.',
    region: 'Oti Region',
    goalAmount: 48_000,
    currentAmount: 33_000,
    status: 'ACTIVE',
  },
  {
    id: 'proj-goaso-clinic',
    title: 'Goaso CHPS compound expansion',
    description:
      'Outpatient capacity for two districts. Expansion of the Goaso CHPS compound to serve the combined outpatient needs of Ahafo North and Tano North districts.',
    region: 'Ahafo Region',
    goalAmount: 65_000,
    currentAmount: 41_800,
    status: 'ACTIVE',
  },
  {
    id: 'proj-nalerigu-lab',
    title: 'Nalerigu diagnostic lab equipment',
    description:
      'Critical need — independent verification on release. Procurement and installation of diagnostic laboratory equipment at Nalerigu Regional Hospital.',
    region: 'North East Region',
    goalAmount: 42_000,
    currentAmount: 19_400,
    status: 'ACTIVE',
  },
  {
    id: 'proj-sekondi-youth',
    title: 'Sekondi youth ICT hub',
    description:
      'Verified complete — impact report published. Full fit-out of a youth ICT training hub in Sekondi with 40 workstations, fibre internet, and 3-year trainer contract.',
    region: 'Western Region',
    goalAmount: 100_000,
    currentAmount: 100_000,
    status: 'FUNDED',
  },
  {
    id: 'proj-techiman-energy',
    title: 'Techiman market LED retrofit',
    description:
      'Lower bills, brighter stalls — civic fund. LED retrofit of all lighting across Techiman central market, cutting energy costs for 600+ traders.',
    region: 'Bono East Region',
    goalAmount: 40_000,
    currentAmount: 22_100,
    status: 'ACTIVE',
  },
  {
    id: 'proj-ellembelle-solar',
    title: 'Ellembelle community solar streetlights',
    description:
      'Coastal communities — high visibility on ledger. Installation of 30 solar streetlights across three coastal communities in Ellembelle District.',
    region: 'Western North Region',
    goalAmount: 32_000,
    currentAmount: 8_400,
    status: 'ACTIVE',
  },
]

async function main() {
  console.log('🌱 Starting seeding...')

  for (const p of PROJECTS) {
    const project = await prisma.project.upsert({
      where: { id: p.id },
      update: {
        title: p.title,
        description: p.description,
        region: p.region,
        goalAmount: p.goalAmount,
        status: p.status,
        // Do not overwrite currentAmount — real contributions may have raised it
      },
      create: {
        id: p.id,
        title: p.title,
        description: p.description,
        region: p.region,
        goalAmount: p.goalAmount,
        currentAmount: p.currentAmount,
        status: p.status,
      },
    })
    console.log(`✓ ${project.title}`)
  }

  console.log('✅ Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
