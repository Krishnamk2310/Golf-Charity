import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, adminNotes } = await req.json()

    if (action !== "APPROVED" && action !== "REJECTED") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const updated = await prisma.winnerVerification.update({
      where: { id: params.id },
      data: { status: action, adminNotes: adminNotes || null }
    })

    return NextResponse.json({ success: true, verification: updated })
  } catch (error) {
    console.error("Admin verify action error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
