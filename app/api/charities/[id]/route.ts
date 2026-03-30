import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const charity = await prisma.charity.findUnique({
      where: { id: params.id },
      include: {
        events: {
          orderBy: { eventDate: "asc" }
        }
      }
    })

    if (!charity) {
      return NextResponse.json({ error: "Charity not found" }, { status: 404 })
    }

    return NextResponse.json({ charity })
  } catch (error) {
    console.error("Fetch charity error: ", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
