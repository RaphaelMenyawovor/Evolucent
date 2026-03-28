"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, Loader2 } from "lucide-react"
import { verifyGhanaCard } from "@/lib/actions/hubtel"

export function VerifyIdentityForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [idNumber, setIdNumber] = useState("")
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        await verifyGhanaCard(idNumber)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed. Please try again.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="ghana-card"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Ghana Card Number
        </label>
        <input
          id="ghana-card"
          type="text"
          placeholder="GH-XXXXXXXXX-X"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          disabled={isPending}
          required
          spellCheck={false}
          autoComplete="off"
          className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-mono text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
        />
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Format: GH&#8209;XXXXXXXXX&#8209;X &nbsp;·&nbsp; Example: GH&#8209;123456789&#8209;0
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || idNumber.trim().length === 0}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Verifying…
          </>
        ) : (
          <>
            <ShieldCheck className="size-4" />
            Verify
          </>
        )}
      </button>
    </form>
  )
}
