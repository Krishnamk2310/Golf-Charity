import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Trophy, Heart, CreditCard, Clock, AlertCircle, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

async function getDashboardData(userId: string) {
  const [subscription, scores, drawEntries, charitySelection, pendingWins] = await Promise.all([
    prisma.subscription.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.golfScore.count({ where: { userId } }),
    prisma.drawEntry.count({ where: { userId } }),
    prisma.userCharitySelection.findUnique({ where: { userId }, include: { charity: true } }),
    prisma.winnerVerification.count({ where: { userId, status: "APPROVED", payoutStatus: "PENDING" } }),
  ])
  return { subscription, scores, drawEntries, charitySelection, pendingWins }
}

export default async function DashboardOverview() {
  const session = await auth()
  if (!session?.user?.id) return null

  const { subscription, scores, drawEntries, charitySelection, pendingWins } = await getDashboardData(session.user.id)

  const nextDraw = new Date()
  nextDraw.setDate(1)
  nextDraw.setMonth(nextDraw.getMonth() + 1)
  const daysUntil = Math.ceil((nextDraw.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session.user.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's your impact summary at a glance.</p>
      </div>

      {/* Alerts */}
      <div className="space-y-3">
        {!charitySelection && (
          <Link href="/onboarding">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between gap-4 hover:bg-amber-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  You haven't selected a charity yet. Choose one to direct your contribution.
                </p>
              </div>
              <Button size="sm" variant="outline" className="border-amber-400 text-amber-700 shrink-0">
                Choose Now →
              </Button>
            </div>
          </Link>
        )}
        {pendingWins > 0 && (
          <Link href="/dashboard/winnings">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center justify-between gap-4 hover:bg-emerald-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  You have {pendingWins} approved prize{pendingWins > 1 ? "s" : ""} awaiting payout!
                </p>
              </div>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
                View →
              </Button>
            </div>
          </Link>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Subscription", value: subscription?.plan || "None", icon: CreditCard, sub: subscription?.status || "No plan", color: "text-indigo-500" },
          { label: "Scores Logged", value: `${scores}/5`, icon: Trophy, sub: "Latest 5 used in draw", color: "text-emerald-500" },
          { label: "Draws Entered", value: drawEntries, icon: Clock, sub: "Total draws participated", color: "text-purple-500" },
          { label: "Next Draw In", value: `${daysUntil}d`, icon: Clock, sub: "Keep your scores updated", color: "text-rose-500" },
        ].map((stat, i) => (
          <Card key={i} className="hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Panels */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-500" /> Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscription ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Plan</span>
                  <Badge>{subscription.plan}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Status</span>
                  <Badge variant={subscription.status === "ACTIVE" ? "default" : "destructive"}>{subscription.status}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Renews</span>
                  <span className="text-sm font-medium">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                </div>
                <Link href="/dashboard/subscription">
                  <Button variant="outline" size="sm" className="w-full mt-2">Manage Subscription</Button>
                </Link>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-3">No active subscription</p>
                <Link href="/subscribe"><Button>Subscribe Now</Button></Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" /> Your Charity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {charitySelection ? (
              <div className="space-y-3">
                <p className="font-semibold text-lg">{charitySelection.charity.name}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{charitySelection.charity.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Your contribution</span>
                  <span className="font-bold text-primary">{charitySelection.contributionPercentage}%</span>
                </div>
                <Link href="/dashboard/charity">
                  <Button variant="outline" size="sm" className="w-full mt-2">Manage</Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-3">No charity selected</p>
                <Link href="/onboarding"><Button variant="outline"><Plus className="w-4 h-4 mr-2"/>Choose Charity</Button></Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
