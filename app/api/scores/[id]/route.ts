import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { score, playedAt } = await req.json()
    const parsedScore = parseInt(score, 10)
    const parsedDate = new Date(playedAt)

    if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 45) {
      return NextResponse.json({ error: "Score must be an integer between 1 and 45" }, { status: 400 })
    }

    if (parsedDate > new Date()) {
      return NextResponse.json({ error: "Played date cannot be in the future" }, { status: 400 })
    }

    const targetScore = await prisma.golfScore.findUnique({ where: { id: params.id } })
    if (!targetScore || targetScore.userId !== session.user.id) {
      return NextResponse.json({ error: "Score not found" }, { status: 404 })
    }

    const updatedScore = await prisma.golfScore.update({
      where: { id: params.id },
      data: { score: parsedScore, playedAt: parsedDate }
    })

    return NextResponse.json({ success: true, score: updatedScore })
  } catch (error) {
    console.error("Update score error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const targetScore = await prisma.golfScore.findUnique({ where: { id: params.id } })
    if (!targetScore || targetScore.userId !== session.user.id) {
      return NextResponse.json({ error: "Score not found" }, { status: 404 })
    }

    await prisma.golfScore.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete score error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
