import { notFound } from "next/navigation"
import { prisma } from "@/src/db"
import { ContributionList } from "@/components/contribution-list"
import { KhayaAIPlayer } from "@/components/khaya-ai-player"
import { AIImpact } from "@/components/ai-impact"
import { WhatsAppShareButton } from "@/components/whatsapp-share-button"

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) notFound()

  const progressPct = Math.min(
    100,
    project.goalAmount > 0
      ? Math.round((project.currentAmount / project.goalAmount) * 100)
      : 0
  )

  const projectUrl = `${process.env.AUTH_URL ?? ""}/projects/${id}`

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 flex flex-col gap-8">
      {/* Header */}
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-500">
          {project.region}
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {project.title}
        </h1>
      </div>

      {/* Description */}
      <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-300">
        {project.description}
      </p>

      {/* Listen in Twi */}
      <KhayaAIPlayer text={project.description} />

      {/* Funding progress */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            GHS {project.currentAmount.toLocaleString()}
          </span>
          <span className="text-sm text-zinc-400 dark:text-zinc-500">
            of GHS {project.goalAmount.toLocaleString()} goal
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          {progressPct}% funded
        </p>
      </section>

      {/* AI Impact Summary */}
      <AIImpact project={project} />

      {/* Contribution ledger */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Contributions
        </h2>
        <ContributionList projectId={id} />
      </section>

      {/* Share */}
      <WhatsAppShareButton
        projectTitle={project.title}
        projectUrl={projectUrl}
      />
    </main>
  )
}
