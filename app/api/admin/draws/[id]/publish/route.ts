import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const targetDraw = await prisma.draw.findUnique({
      where: { id: params.id },
      include: {
        entries: true
      }
    })

    if (!targetDraw) return NextResponse.json({ error: "Draw not found" }, { status: 404 })
    if (targetDraw.status === "PUBLISHED") {
      return NextResponse.json({ error: "Draw is already published" }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.draw.update({
        where: { id: params.id },
        data: { status: "PUBLISHED" }
      })

      const winningEntries = targetDraw.entries.filter(e => e.matchCount >= 3)

      if (winningEntries.length > 0) {
        await tx.winnerVerification.createMany({
          data: winningEntries.map(e => ({
            drawEntryId: e.id,
            userId: e.userId,
            proofUrl: "",
            status: "PENDING",
            payoutStatus: "PENDING"
          }))
        })
      }
    })


    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Publish draw error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
