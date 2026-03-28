"use client"

import { useCallback, useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

type ContributionImpactProps = {
  projectId?: string
  projectTitle: string
  projectDescription: string
  goalAmount: number
  currentAmount: number
}

export function ContributionImpact({
  projectId,
  projectTitle,
  projectDescription,
  goalAmount,
  currentAmount,
}: ContributionImpactProps) {
  const [amount, setAmount] = useState("")
  const [statement, setStatement] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    const numericAmount = Number(amount)

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid amount greater than 0.")
      return
    }

    setIsLoading(true)
    setError(null)
    setStatement(null)

    try {
      const response = await fetch("/api/impact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          projectTitle,
          projectDescription,
          goalAmount,
          currentAmount,
          amount: numericAmount,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error ?? `Request failed with ${response.status}`)
      }

      const data = await response.json()
      setStatement(data.statement)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not generate impact statement.",
      )
    } finally {
      setIsLoading(false)
    }
  }, [amount, projectId, projectTitle, projectDescription, goalAmount, currentAmount])

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        What your contribution does
      </h2>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        Enter an amount to see the real-world impact of your donation.
      </p>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
            GHS
          </span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleGenerate()
            }}
            placeholder="50.00"
            className="w-full rounded-[var(--radius-md)] border border-input bg-background py-2.5 pl-12 pr-3 font-mono text-sm"
          />
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isLoading || !amount.trim()}
          variant="outline"
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {isLoading ? "Thinking…" : "Show Impact"}
        </Button>
      </div>

      {statement ? (
        <div className="mt-4 rounded-lg border border-civic-green/20 bg-civic-green-light p-4 dark:bg-civic-green/10">
          <p className="text-sm font-medium leading-relaxed text-zinc-900 dark:text-zinc-50">
            {statement}
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </section>
  )
}
