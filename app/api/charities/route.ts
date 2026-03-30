import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const featured = searchParams.get("featured")
    const search = searchParams.get("search")

    const where: any = {}
    if (featured === "true") {
      where.isFeatured = true
    }
    if (search) {
      where.name = { contains: search, mode: "insensitive" }
    }

    const charities = await prisma.charity.findMany({
      where,
      orderBy: { name: "asc" }
    })

    return NextResponse.json({ charities })
  } catch (error) {
    console.error("Charity fetch error: ", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
