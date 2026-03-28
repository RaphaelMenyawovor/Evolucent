"use server"

import { auth } from "@/auth"
import { prisma } from "@/src/db"

export async function verifyGhanaCard(idNumber: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthenticated")
  }

  // Ensure user still exists
  const userExists = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  })
  if (!userExists) {
    throw new Error("Unauthenticated: User account not found.")
  }

  // Basic Ghana Card regex validation
  const regex = /^GH-[0-9]{9}-[0-9]$/i
  if (!regex.test(idNumber)) {
    throw new Error("Invalid Ghana Card format. Expected GH-XXXXXXXXX-X")
  }

  // TODO: Add Hubtel integration for actual ID verification
  // For now, we optimism-update the kycStatus to VERIFIED
  
  await prisma.user.update({
    where: { id: session.user.id },
    data: { kycStatus: "VERIFIED" }
  })

  return { success: true }
}
