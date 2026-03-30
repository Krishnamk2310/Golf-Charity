import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const entries = await prisma.drawEntry.findMany({
      where: { 
        userId: session.user.id,
        draw: {
          status: "PUBLISHED"
        }
      },
      include: {
        draw: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ entries })
  } catch (error) {
    console.error("Fetch draw history error: ", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
