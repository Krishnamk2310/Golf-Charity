import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const draw = await prisma.draw.findUnique({
      where: { id: params.id },
      include: {
        entries: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { matchCount: "desc" }
        }
      }
    })

    if (!draw) return NextResponse.json({ error: "Draw not found" }, { status: 404 })

    return NextResponse.json({ draw })
  } catch (error) {
    console.error("Admin fetch draw error: ", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const targetDraw = await prisma.draw.findUnique({ where: { id: params.id } })
    if (!targetDraw || targetDraw.status === "PUBLISHED") {
      return NextResponse.json({ error: "Cannot delete published draw" }, { status: 400 })
    }

    await prisma.draw.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete draw error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
