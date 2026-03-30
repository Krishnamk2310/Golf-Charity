import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const scores = await prisma.golfScore.findMany({
      where: { userId: session.user.id },
      orderBy: { playedAt: "desc" }
    })

    return NextResponse.json({ scores })
  } catch (error) {
    console.error("Fetch scores error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
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

    const existingScores = await prisma.golfScore.findMany({
      where: { userId: session.user.id },
      orderBy: { playedAt: "asc" }
    })

    if (existingScores.length >= 5) {
      await prisma.golfScore.delete({
        where: { id: existingScores[0].id }
      })
    }

    const newScore = await prisma.golfScore.create({
      data: {
        userId: session.user.id,
        score: parsedScore,
        playedAt: parsedDate
      }
    })

    return NextResponse.json({ success: true, score: newScore })
  } catch (error) {
    console.error("Create score error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
