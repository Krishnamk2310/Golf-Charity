import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    const where: any = {}
    if (status && status !== "ALL") where.status = status

    const verifications = await prisma.winnerVerification.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        drawEntry: { include: { draw: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ verifications })
  } catch (error) {
    console.error("Admin fetch verifications error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
