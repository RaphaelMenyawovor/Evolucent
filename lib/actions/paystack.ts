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
