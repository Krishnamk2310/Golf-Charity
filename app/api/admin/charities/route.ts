import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const charities = await prisma.charity.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { events: true } }
      }
    })

    return NextResponse.json({ charities })
  } catch (error) {
    console.error("Admin fetch charities error: ", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, imageUrl, websiteUrl, isFeatured } = await req.json()

    if (!name || !description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 })
    }

    if (isFeatured) {
      await prisma.charity.updateMany({
        where: { isFeatured: true },
        data: { isFeatured: false }
      })
    }

    const newCharity = await prisma.charity.create({
      data: { name, description, imageUrl, websiteUrl, isFeatured: !!isFeatured }
    })

    return NextResponse.json({ success: true, charity: newCharity })
  } catch (error) {
    console.error("Admin create charity error: ", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
