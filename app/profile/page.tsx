import Image from "next/image"
import { redirect } from "next/navigation"
import { ShieldCheck, ShieldOff } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/src/db"
import { Badge } from "@/components/ui/badge"
import { VerifyIdentityForm } from "./_components/verify-identity-form"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  // Read kycStatus directly from DB — the JWT may be stale after verification
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, kycStatus: true },
  })

  if (!user) redirect("/")

  const isVerified = user.kycStatus === "VERIFIED"

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      {/* Profile header */}
      <div className="mb-8 flex items-center gap-4">
        {user.image ? (
          <Image
            src={user.image}
            alt=""
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div className="flex size-16 items-center justify-center rounded-full bg-zinc-200 text-xl font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {(user.name ?? user.email ?? "?")[0].toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {user.name ?? "Unnamed user"}
          </h1>
          <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
            {user.email}
          </p>
        </div>
      </div>

      {/* Identity status card */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Identity Verification
          </h2>
          {isVerified ? (
            <Badge className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
              <ShieldCheck className="mr-0.5 size-3" />
              Verified Citizen
            </Badge>
          ) : (
            <Badge variant="outline">
              <ShieldOff className="mr-0.5 size-3" />
              Unverified
            </Badge>
          )}
        </div>

        {isVerified ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your Ghana Card has been verified. Your name will appear with a{" "}
            <span className="font-medium text-green-700 dark:text-green-400">
              Verified Citizen
            </span>{" "}
            badge on all public contribution ledgers.
          </p>
        ) : (
          <>
            <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
              Verify your Ghana Card to receive a Verified Citizen badge on the
              public contribution ledger.
            </p>
            <VerifyIdentityForm />
          </>
        )}
      </section>
    </main>
  )
}
