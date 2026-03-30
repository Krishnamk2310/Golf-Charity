import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { simulateDraw } from "@/lib/drawEngine"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const draws = await prisma.draw.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { entries: true }
        }
      }
    })

    return NextResponse.json({ draws })
  } catch (error) {
    console.error("Admin fetch draws error: ", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { month, drawType } = await req.json()
    if (!month || !drawType) return NextResponse.json({ error: "Missing parameters" }, { status: 400 })

    const result = await simulateDraw(month, drawType)

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Admin simulate draw error: ", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
