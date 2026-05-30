"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"

interface PaymentSuccessViewProps {
  projectId: string
  amount: number
}

export function PaymentSuccessView({ projectId, amount }: PaymentSuccessViewProps) {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/projects/${projectId}`)
    }, 3000)
    return () => clearTimeout(timer)
  }, [router, projectId])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-500">
      <CheckCircle className="size-16 text-green-500" />
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Payment Successful!
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        GHS {amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} contributed
      </p>
      <p className="text-sm text-zinc-400 dark:text-zinc-500">
        Redirecting you in 3 seconds&hellip;
      </p>
    </div>
  )
}
