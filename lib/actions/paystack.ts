"use server"

import { auth } from "@/auth"
import { prisma } from "@/src/db"
import { revalidatePath } from "next/cache"

type PaystackVerifyResponse = {
  status: boolean
  message: string
  data: {
    status: string      // "success" | "failed" | "abandoned"
    reference: string
    amount: number      // in pesewas — divide by 100 for GHS
    channel: string     // "card" | "bank" | "mobile_money" | "ussd" | "qr" etc.
  }
}

/** Normalise Paystack channel names to the app's three display values. */
function normaliseChannel(channel: string): "card" | "bank" | "momo" {
  if (channel === "mobile_money") return "momo"
  if (channel === "bank") return "bank"
  return "card"
}

export async function verifyGhanaCard(idNumber: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthenticated")
  }

  const userExists = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  })
  if (!userExists) {
    throw new Error("Unauthenticated: User account not found.")
  }

  const regex = /^GH-[0-9]{9}-[0-9]$/
  if (!regex.test(idNumber)) {
    throw new Error("Invalid Ghana Card format. Expected GH-XXXXXXXXX-X")
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { kycStatus: "VERIFIED" },
  })

  return { success: true }
}

export async function verifyPayment(reference: string, projectId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthenticated")
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    throw new Error("Missing PAYSTACK_SECRET_KEY environment variable")
  }

  // Idempotency pre-check — avoid hitting Paystack if already processed
  const existing = await prisma.contribution.findUnique({
    where: { paymentRef: reference },
    include: { project: { select: { id: true } } },
  })

  if (existing?.status === "SUCCESS") {
    return { projectId: existing.project.id, amount: existing.amount }
  }

  // Verify with Paystack
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  )

  if (!res.ok) {
    throw new Error(`Paystack verification request failed: HTTP ${res.status}`)
  }

  const body: PaystackVerifyResponse = await res.json()

  if (!body.status || body.data.status !== "success") {
    throw new Error(
      `Payment not confirmed. Paystack status: ${body.data?.status ?? "unknown"}`
    )
  }

  // Ensure the project exists before writing to avoid FK constraint errors.
  // Run `npx prisma db seed` if this throws — projects must be seeded first.
  const projectExists = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  })
  if (!projectExists) {
    throw new Error(
      "Project not found in database. Please contact support — reference: " + reference
    )
  }

  // Ensure user still exists (local DB resets can leave orphaned JWTs)
  const userExists = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  })
  if (!userExists) {
    throw new Error("Unauthenticated: User account not found. Please sign out and sign in again.")
  }

  // Paystack amounts are in pesewas (1 GHS = 100 pesewas)
  const amountGHS = body.data.amount / 100
  const method = normaliseChannel(body.data.channel ?? "")

  // Atomic write with race-condition guard inside the transaction
  await prisma.$transaction(async (tx) => {
    const inTxExisting = await tx.contribution.findUnique({
      where: { paymentRef: reference },
    })
    if (inTxExisting) return // concurrent request already wrote this

    await tx.contribution.create({
      data: {
        amount: amountGHS,
        paymentRef: reference,
        status: "SUCCESS",
        method,
        projectId,
        userId: session.user.id,
      },
    })

    await tx.project.update({
      where: { id: projectId },
      data: { currentAmount: { increment: amountGHS } },
    })
  })

  revalidatePath("/ledger")
  revalidatePath(`/project/${projectId}`)
  revalidatePath(`/projects/${projectId}`)

  return { projectId, amount: amountGHS }
}

/**
 * Validates a payment exclusively by its Paystack reference.
 * Lookups the project_id from Paystack's transaction metadata.
 */
export async function handlePaymentSuccess(reference: string) {
  // Try finding it directly in our DB first
  const existing = await prisma.contribution.findUnique({
    where: { paymentRef: reference },
    include: { project: { select: { id: true } } },
  })
  
  if (existing?.status === "SUCCESS") {
    return { projectId: existing.project.id, amount: existing.amount }
  }

  // If not yet verified or missing in DB, fetch from Paystack to find project_id metadata
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) throw new Error("Missing PAYSTACK_SECRET_KEY")

  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: "no-store",
    }
  )

  if (!res.ok) throw new Error("Paystack request failed")
  
  const data = await res.json()
  const projectId = data?.data?.metadata?.project_id
  
  if (!projectId) {
    throw new Error("Cannot associate this payment with a project: missing metadata.")
  }

  // Delegate the actual DB write and verification to verifyPayment
  return verifyPayment(reference, projectId)
}
