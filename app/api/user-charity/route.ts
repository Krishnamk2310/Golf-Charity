import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { charityId, contributionPercentage } = await req.json()

    if (!charityId || !contributionPercentage || contributionPercentage < 10 || contributionPercentage > 90) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const selection = await prisma.userCharitySelection.upsert({
      where: { userId: session.user.id },
      update: {
        charityId,
        contributionPercentage
      },
      create: {
        userId: session.user.id,
        charityId,
        contributionPercentage
      }
    })

    return NextResponse.json({ success: true, selection })
  } catch (error) {
    console.error("User charity fetch error: ", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const selection = await prisma.userCharitySelection.findUnique({
      where: { userId: session.user.id },
      include: { charity: true }
    })

    return NextResponse.json({ selection })
  } catch (error) {
    console.error("User charity selection error: ", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
