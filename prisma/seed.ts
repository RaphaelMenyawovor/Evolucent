import { PrismaClient } from '../src/generated/prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seeding...')

  // 1. Create realistic Civic Projects
  const projects = [
    {
      title: 'KNUST Unity Hall Solar Streetlights',
      description: 'Installing 20 high-efficiency solar streetlights around the Unity Hall perimeter to improve student safety and reduce reliance on the national grid during dumsor.',
      region: 'Ashanti',
      goalAmount: 25000.00,
      currentAmount: 8500.00,
      status: 'ACTIVE',
    },
    {
      title: 'Accra-Tema Motorway Pothole Emergency Fix',
      region: 'Greater Accra',
      goalAmount: 120000.00,
      currentAmount: 45000.00,
      status: 'ACTIVE',
    },
    {
      title: 'Kumasi Central Market Sanitation Upgrade',
      description: 'Provision of modern, automated waste bins and a 3-month contract for private waste collection to clear the backlog of refuse in the central market area.',
      region: 'Ashanti',
      goalAmount: 15000.00,
      currentAmount: 12000.00,
      status: 'ACTIVE',
    },
    {
      title: 'Tamale Rural Water Borehole Project',
      description: 'Construction of a solar-powered mechanized borehole for the Savelugu community to provide clean drinking water for 500 households.',
      region: 'Northern',
      goalAmount: 45000.00,
      currentAmount: 0.00,
      status: 'ACTIVE',
    },
  ]

  for (const p of projects) {
    const project = await prisma.project.upsert({
      where: { id: p.title.toLowerCase().replace(/ /g, '-') }, // Using a slug for ID or just let it generate UUID
      update: {},
      create: {
        title: p.title,
        description: p.description ?? '',
        region: p.region,
        goalAmount: p.goalAmount,
        currentAmount: p.currentAmount,
        status: p.status,
      },
    })
    console.log(`Created project: ${project.title}`)
  }

  // 2. Create a "Test User" for yourself (Optional)
  // This helps for testing the "My Contributions" page immediately.
  const testUser = await prisma.user.upsert({
    where: { email: 'your-email@gmail.com' }, // Replace with your Google email
    update: {},
    create: {
      name: 'Test Citizen',
      email: 'your-email@gmail.com',
      phoneNumber: '0244000000',
      kycStatus: 'VERIFIED',
    },
  })

  console.log(`Created test user: ${testUser.name}`)
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