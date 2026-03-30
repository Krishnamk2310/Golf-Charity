import { prisma } from "./prisma"
import { DrawType } from "@prisma/client"

const SUBSCRIPTION_FEE = 799

function generateRandomUnique(count: number, min: number, max: number): number[] {
  const nums = new Set<number>()
  while (nums.size < count) {
    nums.add(Math.floor(Math.random() * (max - min + 1)) + min)
  }
  return Array.from(nums)
}

function weightedRandom(items: number[], weights: number[]): number {
  let sum = 0
  const cumWeights = weights.map(w => sum += w)
  const rand = Math.random() * sum
  return items[cumWeights.findIndex(cw => cw >= rand)]
}

export async function simulateDraw(month: string, type: DrawType) {
  // 1: Fetch config and previous rollover
  let config = await prisma.prizePoolConfig.findUnique({ where: { id: 1 } })
  if (!config) {
    config = await prisma.prizePoolConfig.create({
      data: { fiveMatchPct: 40, fourMatchPct: 35, threeMatchPct: 25, subscriptionPoolPct: 30 }
    })
  }

  const prevDraw = await prisma.draw.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" }
  })
  const rolledOverAmount = prevDraw && prevDraw.jackpotRollover ? Number(prevDraw.rolledOverAmount) : 0

  // 2: Collect Data
  const activeSubs = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: {
        include: {
          golfScores: {
            orderBy: { playedAt: "desc" },
            take: 5
          }
        }
      }
    }
  })

  const eligibleUsers = activeSubs
    .filter(sub => sub.user.golfScores.length >= 3)
    .map(sub => ({
      userId: sub.userId,
      scores: sub.user.golfScores.map(gs => gs.score)
    }))

  // 3: Generate Drawn Numbers
  let drawnNumbers: number[] = []
  if (type === "RANDOM") {
    drawnNumbers = generateRandomUnique(5, 1, 45)
  } else {
    // ALGORITHMIC: inversely proportional to frequency
    const freqMap: Record<number, number> = {}
    for (let i = 1; i <= 45; i++) freqMap[i] = 0
    eligibleUsers.forEach(u => u.scores.forEach(s => freqMap[s]++))

    // Max frequency for inversion
    const maxFreq = Math.max(...Object.values(freqMap))
    
    let pool = Array.from({ length: 45 }, (_, i) => i + 1)
    
    // Pick 5 unique
    while (drawnNumbers.length < 5) {
      const weights = pool.map(n => {
        const freq = freqMap[n]
        return freq === 0 ? maxFreq + 1 : maxFreq - freq + 1 // Add 1 to avoid 0 weight
      })
      const num = weightedRandom(pool, weights)
      drawnNumbers.push(num)
      pool = pool.filter(n => n !== num)
    }
  }

  // 4: Match Users
  const matchedUsers = eligibleUsers.map(u => {
    const matchedNumbers = u.scores.filter(s => drawnNumbers.includes(s))
    return {
      userId: u.userId,
      userScores: u.scores,
      matchedNumbers: matchedNumbers,
      matchCount: matchedNumbers.length
    }
  }).filter(u => u.matchCount >= 3)

  const count5 = matchedUsers.filter(u => u.matchCount === 5).length
  const count4 = matchedUsers.filter(u => u.matchCount === 4).length
  const count3 = matchedUsers.filter(u => u.matchCount === 3).length

  // 5: Calculate Prizes
  const totalSubPool = activeSubs.length * SUBSCRIPTION_FEE * (config.subscriptionPoolPct / 100)
  const totalPrizePool = totalSubPool + rolledOverAmount

  const fiveMatchPool = totalPrizePool * (config.fiveMatchPct / 100)
  const fourMatchPool = totalPrizePool * (config.fourMatchPct / 100)
  const threeMatchPool = totalPrizePool * (config.threeMatchPct / 100)

  const prize5 = count5 > 0 ? fiveMatchPool / count5 : 0
  const prize4 = count4 > 0 ? fourMatchPool / count4 : 0
  const prize3 = count3 > 0 ? threeMatchPool / count3 : 0

  const hasRollover = count5 === 0
  const rolloverAmt = hasRollover ? fiveMatchPool : 0

  matchedUsers.forEach(mu => {
    if (mu.matchCount === 5) mu["prizeAmount"] = prize5
    else if (mu.matchCount === 4) mu["prizeAmount"] = prize4
    else if (mu.matchCount === 3) mu["prizeAmount"] = prize3
  })

  // 6: Store Results (SIMULATION)
  const draw = await prisma.draw.create({
    data: {
      month,
      drawType: type,
      status: "SIMULATION",
      drawnNumbers,
      totalPrizePool,
      jackpotRollover: hasRollover,
      rolledOverAmount: rolloverAmt,
      entries: {
        create: matchedUsers.map(mu => ({
          userId: mu.userId,
          userScores: mu.userScores,
          matchedNumbers: mu.matchedNumbers,
          matchCount: mu.matchCount,
          prizeAmount: (mu as any).prizeAmount
        }))
      }
    },
    include: { entries: true }
  })

  return { draw, aggregate: { count5, count4, count3, prize5, prize4, prize3, totalSubPool, rolledOverAmount } }
}
