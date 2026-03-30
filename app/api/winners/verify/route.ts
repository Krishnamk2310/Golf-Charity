import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { drawEntryId, proofUrl } = await req.json()

    if (!drawEntryId || !proofUrl) {
      return NextResponse.json({ error: "Missing drawEntryId or proofUrl" }, { status: 400 })
    }

    const drawEntry = await prisma.drawEntry.findUnique({
      where: { id: drawEntryId },
      include: { draw: true }
    })

    if (!drawEntry || drawEntry.userId !== session.user.id) {
      return NextResponse.json({ error: "Draw entry not found" }, { status: 404 })
    }

    if (drawEntry.draw.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Draw is not published yet" }, { status: 400 })
    }

    const existing = await prisma.winnerVerification.findUnique({
      where: { drawEntryId }
    })

    if (existing) {
      const updated = await prisma.winnerVerification.update({
        where: { drawEntryId },
        data: { proofUrl, status: "PENDING" }
      })
      return NextResponse.json({ success: true, verification: updated })
    }

    const verification = await prisma.winnerVerification.create({
      data: {
        drawEntryId,
        userId: session.user.id,
        proofUrl,
        status: "PENDING",
        payoutStatus: "PENDING"
      }
    })

    return NextResponse.json({ success: true, verification })
  } catch (error) {
    console.error("Winner verify error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const verifications = await prisma.winnerVerification.findMany({
      where: { userId: session.user.id },
      include: {
        drawEntry: {
          include: { draw: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ verifications })
  } catch (error) {
    console.error("Fetch verifications error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
