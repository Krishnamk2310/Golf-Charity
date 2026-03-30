import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Cleanup
  await prisma.winnerVerification.deleteMany({})
  await prisma.drawEntry.deleteMany({})
  await prisma.draw.deleteMany({})
  await prisma.userCharitySelection.deleteMany({})
  await prisma.golfScore.deleteMany({})
  await prisma.subscription.deleteMany({})
  await prisma.charityEvent.deleteMany({})
  await prisma.charity.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.prizePoolConfig.deleteMany({})

  // Seed Prize Pool Config
  await prisma.prizePoolConfig.create({
    data: { id: 1, fiveMatchPct: 40, fourMatchPct: 35, threeMatchPct: 25, subscriptionPoolPct: 30 }
  })
  console.log("✅ Prize pool config created")

  // Seed Charities
  const charity1 = await prisma.charity.create({
    data: {
      name: "Green Futures Foundation",
      description: "Dedicated to combating climate change through community-led environmental restoration projects. We plant trees, restore wetlands, and educate communities on sustainable living practices across India.",
      imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80",
      websiteUrl: "https://greenfutures.example.com",
      isFeatured: true,
      events: {
        create: [
          { title: "Annual Tree Plantation Drive", description: "Join thousands of volunteers to plant native trees across urban forests.", eventDate: new Date("2026-04-22") },
          { title: "Sustainability Summit 2026", description: "International leaders gather to outline environmental action plans.", eventDate: new Date("2026-06-05") }
        ]
      }
    }
  })

  const charity2 = await prisma.charity.create({
    data: {
      name: "Kids Can Golf",
      description: "Empowering underprivileged youth through golf coaching, scholarships, and mentorship programs. We believe every child deserves a chance to discover their potential through sport.",
      imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80",
      websiteUrl: "https://kidscangolf.example.com",
      isFeatured: false,
      events: {
        create: [
          { title: "Junior Golf Championship", description: "Annual tournament showcasing our youth talent from 15 cities.", eventDate: new Date("2026-05-15") }
        ]
      }
    }
  })

  const charity3 = await prisma.charity.create({
    data: {
      name: "Veterans on the Fairway",
      description: "Using golf as a therapeutic tool for military veterans recovering from PTSD, physical injuries, and the challenges of reintegrating into civilian life. Golf heals minds and bodies.",
      imageUrl: "https://images.unsplash.com/photo-1484482340112-e1e2682b4856?w=800&q=80",
      websiteUrl: "https://veteransgolf.example.com",
      isFeatured: false,
    }
  })
  console.log("✅ Charities created")

  // Seed Admin User
  const adminHash = await bcrypt.hash("Admin@123456", 12)
  await prisma.user.create({
    data: {
      email: "admin@golfcharity.com",
      name: "Admin User",
      passwordHash: adminHash,
      role: "ADMIN",
    }
  })
  console.log("✅ Admin user created")

  // Seed Test Subscriber
  const testHash = await bcrypt.hash("Test@123456", 12)
  const testUser = await prisma.user.create({
    data: {
      email: "test@golfcharity.com",
      name: "Test Player",
      passwordHash: testHash,
      role: "SUBSCRIBER",
      subscriptions: {
        create: {
          plan: "MONTHLY",
          status: "ACTIVE",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }
    }
  })
  console.log("✅ Test subscriber created")

  // Seed Scores for Test User
  const scoreData = [
    { score: 42, daysAgo: 55 },
    { score: 38, daysAgo: 45 },
    { score: 35, daysAgo: 30 },
    { score: 40, daysAgo: 15 },
    { score: 29, daysAgo: 5 },
  ]
  for (const s of scoreData) {
    const d = new Date()
    d.setDate(d.getDate() - s.daysAgo)
    await prisma.golfScore.create({
      data: { userId: testUser.id, score: s.score, playedAt: d }
    })
  }
  console.log("✅ Golf scores created")

  // Seed Charity Selection for Test User
  await prisma.userCharitySelection.create({
    data: {
      userId: testUser.id,
      charityId: charity1.id,
      contributionPercentage: 10
    }
  })

  // Seed a Published Draw (last month)
  const draw = await prisma.draw.create({
    data: {
      month: "2026-02",
      drawnNumbers: [29, 35, 38, 12, 7],
      drawType: "RANDOM",
      status: "PUBLISHED",
      jackpotRollover: false,
      rolledOverAmount: 0,
      totalPrizePool: 299.70,
    }
  })

  // Create draw entry for test user (3 matches: 29, 35, 38)
  const drawEntry = await prisma.drawEntry.create({
    data: {
      drawId: draw.id,
      userId: testUser.id,
      userScores: [42, 38, 35, 40, 29],
      matchedNumbers: [38, 35, 29],
      matchCount: 3,
      prizeAmount: 74.925 // 25% of 299.70
    }
  })

  console.log("✅ Published draw created with test user entry")
  console.log("\n🎉 Seeding complete!")
  console.log("\n📋 Test Credentials:")
  console.log("   Admin: admin@golfcharity.com / Admin@123456")
  console.log("   User:  test@golfcharity.com / Test@123456")
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
