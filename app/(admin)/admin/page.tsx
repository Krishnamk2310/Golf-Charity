import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Users, CreditCard, Trophy, Heart, FileCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function getAdminStats() {
  const [totalUsers, activeSubscribers, pendingVerifications, totalCharities, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.winnerVerification.count({ where: { status: "PENDING" } }),
    prisma.charity.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { subscriptions: { take: 1, orderBy: { createdAt: "desc" } } }
    })
  ])

  const config = await prisma.prizePoolConfig.findUnique({ where: { id: 1 } })
  const subPoolPct = config?.subscriptionPoolPct || 30
  const monthlyPool = activeSubscribers * 799 * (subPoolPct / 100)

  return { totalUsers, activeSubscribers, pendingVerifications, totalCharities, monthlyPool, recentUsers }
}

export default async function AdminOverview() {
  const { totalUsers, activeSubscribers, pendingVerifications, totalCharities, monthlyPool, recentUsers } = await getAdminStats()

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { label: "Active Subscribers", value: activeSubscribers, icon: CreditCard, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
    { label: "Est. Prize Pool", value: `₹${monthlyPool.toLocaleString()}`, icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
    { label: "Pending Verifications", value: pendingVerifications, icon: FileCheck, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
  ]

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border-l-4 border-l-indigo-500 shadow-sm">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and quick actions.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className={`p-5 ${stat.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{stat.label}</span>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-black">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" /> Recent Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
                    {user.subscriptions[0] && (
                      <span className="text-xs font-semibold text-indigo-500">{user.subscriptions[0].status}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full mt-4" size="sm">View All Users</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { href: "/admin/draws", label: "Run this Month's Draw", icon: Trophy, color: "border-indigo-200 hover:bg-indigo-50" },
              { href: "/admin/verifications", label: `Review ${pendingVerifications} Pending Verifications`, icon: FileCheck, color: "border-amber-200 hover:bg-amber-50" },
              { href: "/admin/charities", label: "Manage Charities", icon: Heart, color: "border-rose-200 hover:bg-rose-50" },
              { href: "/admin/reports", label: "View Reports & Analytics", icon: CreditCard, color: "border-slate-200 hover:bg-slate-50" },
            ].map((action, i) => (
              <Link key={i} href={action.href}>
                <Button variant="outline" className={`w-full justify-start h-12 ${action.color} transition-colors`}>
                  <action.icon className="h-4 w-4 mr-3" />
                  {action.label}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
