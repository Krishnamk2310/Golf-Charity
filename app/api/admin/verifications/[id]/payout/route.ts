import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const verification = await prisma.winnerVerification.findUnique({ where: { id: params.id } })
    if (!verification) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (verification.status !== "APPROVED") {
      return NextResponse.json({ error: "Verification must be approved first" }, { status: 400 })
    }

    const updated = await prisma.winnerVerification.update({
      where: { id: params.id },
      data: { payoutStatus: "PAID" }
    })

    return NextResponse.json({ success: true, verification: updated })
  } catch (error) {
    console.error("Payout error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
