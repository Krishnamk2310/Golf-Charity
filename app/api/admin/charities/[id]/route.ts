import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, imageUrl, websiteUrl, isFeatured } = await req.json()

    if (isFeatured) {
      await prisma.charity.updateMany({
        where: { id: { not: params.id }, isFeatured: true },
        data: { isFeatured: false }
      })
    }

    const updated = await prisma.charity.update({
      where: { id: params.id },
      data: { name, description, imageUrl, websiteUrl, isFeatured: !!isFeatured }
    })

    return NextResponse.json({ success: true, charity: updated })
  } catch (error) {
    console.error("Admin update charity error: ", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.charity.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin delete charity error: ", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
