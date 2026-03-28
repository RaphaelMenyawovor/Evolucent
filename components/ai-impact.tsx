import { GoogleGenerativeAI } from "@google/generative-ai"
import { prisma } from "@/src/db"

interface AIImpactProps {
  project: {
    id: string
    title: string
    description: string
    impactSummary: string | null
  }
}

async function generateAndStoreImpactSummary(project: {
  id: string
  title: string
  description: string
}): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const prompt =
    `Summarize the following civic project's goals into exactly 3 concise bullet points ` +
    `for a public transparency ledger. Return only the 3 bullets, each starting with '•'.\n\n` +
    `Project: ${project.title}\n\n${project.description}`

  const result = await model.generateContent(prompt)
  const summary = result.response.text()

  // Persist so subsequent renders skip the API call
  await prisma.project.update({
    where: { id: project.id },
    data: { impactSummary: summary },
  })

  return summary
}

export async function AIImpact({ project }: AIImpactProps) {
  if (!process.env.GOOGLE_AI_API_KEY) {
    return null // graceful degradation when key is absent
  }

  let summary = project.impactSummary

  if (!summary) {
    try {
      summary = await generateAndStoreImpactSummary(project)
    } catch {
      return null // non-fatal — AI summary is an enhancement, not core UI
    }
  }

  const bullets = summary
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("•"))

  if (bullets.length === 0) return null

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        AI Impact Summary
      </h2>
      <ul className="flex flex-col gap-2">
        {bullets.map((bullet, i) => (
          <li key={i} className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="mt-0.5 shrink-0 text-indigo-500">•</span>
            <span>{bullet.replace(/^•\s*/, "")}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
