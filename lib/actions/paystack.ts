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
  }
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

  // Paystack amounts are in pesewas (1 GHS = 100 pesewas)
  const amountGHS = body.data.amount / 100

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
  revalidatePath(`/projects/${projectId}`)

  return { projectId, amount: amountGHS }
}
