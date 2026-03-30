import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const sub = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
    })

    if (!sub) return NextResponse.json({ error: "No active subscription found" }, { status: 404 })

    const updated = await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "CANCELLED" }
    })

    return NextResponse.json({ success: true, subscription: updated })
  } catch (error) {
    console.error("Cancel subscription error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
