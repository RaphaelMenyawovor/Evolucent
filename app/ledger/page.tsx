import { prisma } from "@/src/db"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const dynamic = "force-dynamic"

export default async function LedgerPage() {
  const contributions = await prisma.contribution.findMany({
    where: { status: "SUCCESS" },
    include: {
      user: { select: { name: true, kycStatus: true } },
      project: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Public Ledger
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Every confirmed contribution is recorded here — full transparency for
          all civic funding on Evolucent.
        </p>
      </div>

      {contributions.length === 0 ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          No confirmed contributions yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Contributor</TableHead>
                <TableHead className="text-right">Amount (GHS)</TableHead>
                <TableHead>Payment Ref</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributions.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.project.title}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{c.user.name ?? "Anonymous"}</span>
                      {c.user.kycStatus === "VERIFIED" && (
                        <Badge className="shrink-0 border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
                          <ShieldCheck className="mr-0.5 size-3" />
                          Verified Citizen
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {c.amount.toLocaleString("en-GH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      {c.paymentRef.length > 20
                        ? `${c.paymentRef.slice(0, 8)}…${c.paymentRef.slice(-6)}`
                        : c.paymentRef}
                    </span>
                  </TableCell>
                  <TableCell className="text-zinc-500 dark:text-zinc-400">
                    {c.createdAt.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  )
}
