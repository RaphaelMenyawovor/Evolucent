import Link from "next/link"
import { handlePaymentSuccess } from "@/lib/actions/paystack"
import { PaymentSuccessView } from "./_components/payment-success-view"

// searchParams is a Promise in Next.js 15+ — must be awaited
export default async function CallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const { clientReference, status } = params

  // PayStack redirects here with status=cancelled when the user aborts checkout
  if (status === "cancelled" || !clientReference) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
          {status === "cancelled" ? "Payment cancelled." : "Payment reference missing."}
        </p>
        <Link
          href="/"
          className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          Return home
        </Link>
      </div>
    )
  }

  try {
    const result = await handlePaymentSuccess(clientReference)
    return <PaymentSuccessView projectId={result.projectId} amount={result.amount} />
  } catch {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
          Could not confirm your payment.
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          If you were charged, please contact support with reference:{" "}
          <span className="font-mono">{clientReference}</span>
        </p>
        <Link
          href="/"
          className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          Return home
        </Link>
      </div>
    )
  }
}
