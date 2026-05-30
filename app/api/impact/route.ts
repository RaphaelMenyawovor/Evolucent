import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { prisma } from "@/src/db"

let _impactModel: ReturnType<GoogleGenerativeAI["getGenerativeModel"]> | null = null
function getImpactModel() {
  if (_impactModel) return _impactModel
  const key = process.env.GOOGLE_AI_API_KEY
  if (!key) return null
  _impactModel = new GoogleGenerativeAI(key).getGenerativeModel({ model: "gemini-2.0-flash" })
  return _impactModel
}

export async function POST(req: NextRequest) {
  const model = getImpactModel()
  if (!model) {
    return NextResponse.json(
      { error: "AI service not configured" },
      { status: 503 },
    )
  }

  let amount: number
  let projectId: string | undefined
  let projectTitle: string | undefined
  let projectDescription: string | undefined
  let goalAmount: number | undefined
  let currentAmount: number | undefined

  try {
    const body = await req.json()
    amount = Number(body.amount)
    projectId = body.projectId
    projectTitle = body.projectTitle
    projectDescription = body.projectDescription
    goalAmount = body.goalAmount != null ? Number(body.goalAmount) : undefined
    currentAmount = body.currentAmount != null ? Number(body.currentAmount) : undefined

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Provide a valid positive amount." },
        { status: 400 },
      )
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  try {
    let title = projectTitle ?? ""
    let description = projectDescription ?? ""
    let goal = goalAmount ?? 0
    let raised = currentAmount ?? 0

    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          title: true,
          description: true,
          goalAmount: true,
          currentAmount: true,
        },
      })

      if (project) {
        title = project.title
        description = project.description
        goal = project.goalAmount
        raised = project.currentAmount
      }
    }

    if (!title) {
      return NextResponse.json(
        { error: "Provide project details or a valid projectId." },
        { status: 400 },
      )
    }

    const prompt =
      `You are a civic funding assistant for Ghana. A citizen wants to contribute GHS ${amount.toFixed(2)} to a project.\n\n` +
      `Project: "${title}"\n` +
      `Description: "${description}"\n` +
      `Goal: GHS ${goal.toFixed(2)}\n` +
      `Already raised: GHS ${raised.toFixed(2)}\n\n` +
      `Write exactly ONE sentence explaining the tangible impact of their GHS ${amount.toFixed(2)} contribution. ` +
      `Be specific with quantities (e.g. bags of cement, meters of pipe, solar panels, waste bins). ` +
      `Keep it warm, concrete, and under 30 words. Do not use quotation marks. Do not mention the goal or total raised.`

    const result = await model.generateContent(prompt)
    const statement = result.response.text().trim()

    return NextResponse.json({ statement, amount, projectTitle: title })
  } catch (error) {
    console.error("[impact]", error)
    return NextResponse.json(
      { error: "Could not generate impact statement." },
      { status: 500 },
    )
  }
}
