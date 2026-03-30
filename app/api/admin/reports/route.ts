import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subs = await prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, plan: true }
    })

    const monthMap: Record<string, number> = {}
    subs.forEach(sub => {
      const key = sub.createdAt.toISOString().slice(0, 7)
      monthMap[key] = (monthMap[key] || 0) + 1
    })
    const subscriberGrowth = Object.entries(monthMap).map(([month, count]) => ({ month, count }))

    const draws = await prisma.draw.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "asc" },
      select: { month: true, totalPrizePool: true }
    })
    const prizeDistribution = draws.map(d => ({ month: d.month, pool: Number(d.totalPrizePool) }))

    const totalPrizePaid = await prisma.drawEntry.aggregate({
      _sum: { prizeAmount: true }
    })

    const totalUsers = await prisma.user.count()
    const activeSubscribers = await prisma.subscription.count({ where: { status: "ACTIVE" } })

    const charityContributions = await prisma.userCharitySelection.groupBy({
      by: ["charityId"],
      _sum: { contributionPercentage: true },
      _count: { userId: true }
    })

    const charities = await prisma.charity.findMany({ select: { id: true, name: true } })
    const charityData = charityContributions.map(c => ({
      charityId: c.charityId,
      name: charities.find(ch => ch.id === c.charityId)?.name || "Unknown",
      supporters: c._count.userId,
      avgContribution: Math.round((c._sum.contributionPercentage || 0) / c._count.userId)
    }))

    return NextResponse.json({
      subscriberGrowth,
      prizeDistribution,
      totalStats: {
        totalUsers,
        activeSubscribers,
        totalPrizePaid: Number(totalPrizePaid._sum.prizeAmount || 0)
      },
      charityData
    })
  } catch (error) {
    console.error("Reports error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
