"use server"

import { auth } from "@/auth"
import { prisma } from "@/src/db"
import { randomUUID } from "crypto"
import { revalidatePath } from "next/cache"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type HubtelInitiateResponse = {
  status: string
  data: {
    checkoutUrl: string
    clientReference: string
  }
}

// ---------------------------------------------------------------------------
// initiatePayment
// ---------------------------------------------------------------------------

export async function initiatePayment(amount: number, projectId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthenticated")
  }

  const baseUrl = process.env.AUTH_URL
  const apiId = process.env.HUBTEL_API_ID
  const apiKey = process.env.HUBTEL_API_KEY
  const merchantAccount = process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER

  if (!baseUrl || !apiId || !apiKey || !merchantAccount) {
    throw new Error(
      "Missing required env vars: AUTH_URL, HUBTEL_API_ID, HUBTEL_API_KEY, HUBTEL_MERCHANT_ACCOUNT_NUMBER"
    )
  }

  // Create the PENDING record first so we have a stable ID to use as clientReference
  const contribution = await prisma.contribution.create({
    data: {
      amount,
      projectId,
      userId: session.user.id,
      status: "PENDING",
      paymentRef: `pending_${randomUUID()}`,
    },
  })

  const basicAuth = Buffer.from(`${apiId}:${apiKey}`).toString("base64")

  let body: HubtelInitiateResponse
  try {
    const res = await fetch("https://payproxyapi.hubtel.com/items/initiate", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        totalAmount: amount,
        description: `Contribution to project ${projectId}`,
        callbackUrl: `${baseUrl}/api/hubtel/webhook`,
        returnUrl: `${baseUrl}/payment/callback`,
        cancellationUrl: `${baseUrl}/payment/callback?status=cancelled`,
        merchantAccountNumber: merchantAccount,
        clientReference: contribution.id,
      }),
    })

    body = await res.json()
  } catch (err) {
    // Network or parse failure — clean up the orphaned PENDING record
    await prisma.contribution.delete({ where: { id: contribution.id } })
    throw new Error("Payment initiation failed. Please try again.")
  }

  if (body.status !== "Success") {
    await prisma.contribution.delete({ where: { id: contribution.id } })
    throw new Error("Payment initiation failed. Please try again.")
  }

  // Replace the temporary placeholder ref with the stable contribution ID
  // (which is also the clientReference we sent to Hubtel, and they will echo
  //  back in the return URL so we can look it up on callback)
  await prisma.contribution.update({
    where: { id: contribution.id },
    data: { paymentRef: contribution.id },
  })

  return { contributionId: contribution.id, checkoutUrl: body.data.checkoutUrl }
}

// ---------------------------------------------------------------------------
// handlePaymentSuccess
// ---------------------------------------------------------------------------

export async function handlePaymentSuccess(paymentRef: string) {
  // paymentRef === the clientReference we sent to Hubtel === contribution.id
  const contribution = await prisma.contribution.findUnique({
    where: { id: paymentRef },
    include: { project: { select: { id: true } } },
  })

  if (!contribution) {
    throw new Error("Contribution not found")
  }

  // Idempotency: if the record was already processed (e.g. page refresh),
  // return the existing data without re-running the transaction
  if (contribution.status !== "PENDING") {
    return {
      projectId: contribution.project.id,
      amount: contribution.amount,
    }
  }

  await prisma.$transaction([
    prisma.contribution.update({
      where: { id: contribution.id },
      data: { status: "SUCCESS" },
    }),
    prisma.project.update({
      where: { id: contribution.projectId },
      data: { currentAmount: { increment: contribution.amount } },
    }),
  ])

  return {
    projectId: contribution.project.id,
    amount: contribution.amount,
  }
}

// ---------------------------------------------------------------------------
// verifyGhanaCard
// ---------------------------------------------------------------------------

// Ghana Card format: GH-XXXXXXXXX-X
// Middle segment: 9 uppercase alphanumeric characters
// Check character: 1 uppercase alphanumeric character
const GHANA_CARD_REGEX = /^GH-[A-Z0-9]{9}-[A-Z0-9]$/

export async function verifyGhanaCard(idNumber: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthenticated")
  }

  const normalized = idNumber.trim().toUpperCase()

  if (!GHANA_CARD_REGEX.test(normalized)) {
    throw new Error(
      "Invalid Ghana Card number. Expected format: GH-XXXXXXXXX-X"
    )
  }

  // --- Hubtel KYC API integration point ---
  // When Hubtel KYC becomes available, replace the block below with:
  //
  //   const res = await fetch("https://kyc.hubtel.com/v1/verify", {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Basic ${Buffer.from(`${process.env.HUBTEL_API_ID}:${process.env.HUBTEL_API_KEY}`).toString("base64")}`,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ idNumber: normalized }),
  //   })
  //   const body = await res.json()
  //   if (body.status !== "Success") throw new Error("Verification failed")
  //
  // Mock: any correctly-formatted ID is accepted

  await prisma.user.update({
    where: { id: session.user.id },
    data: { kycStatus: "VERIFIED" },
  })

  revalidatePath("/profile")

  return { success: true as const }
}
