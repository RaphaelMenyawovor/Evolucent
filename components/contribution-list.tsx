import { prisma } from "@/src/db"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck } from "lucide-react"

interface ContributionListProps {
  projectId: string
}

export async function ContributionList({ projectId }: ContributionListProps) {
  const contributions = await prisma.contribution.findMany({
    where: { projectId, status: "SUCCESS" },
    include: { user: { select: { name: true, kycStatus: true } } },
    orderBy: { createdAt: "desc" },
  })

  if (contributions.length === 0) {
    return (
      <p className="text-sm text-zinc-400 dark:text-zinc-500">
        No contributions yet. Be the first!
      </p>
    )
  }

  return (
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {contributions.map((c) => (
        <li key={c.id} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {c.user.name ?? "Anonymous"}
            </span>
            {c.user.kycStatus === "VERIFIED" && (
              <Badge
                className="shrink-0 border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
              >
                <ShieldCheck className="mr-0.5 size-3" />
                Verified Citizen
              </Badge>
            )}
          </div>
          <div className="ml-4 flex shrink-0 flex-col items-end gap-0.5">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              GHS {c.amount.toLocaleString()}
            </span>
            <time
              dateTime={c.createdAt.toISOString()}
              className="text-xs text-zinc-400 dark:text-zinc-500"
            >
              {c.createdAt.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </time>
          </div>
        </li>
      ))}
    </ul>
  )
}
