import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { User, Mail, Calendar, CreditCard, Trophy, Heart, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DeleteUserButton } from "./DeleteUserButton"

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      golfScores: {
        orderBy: { playedAt: 'desc' }
      },
      charitySelection: {
        include: { charity: true }
      },
      drawEntries: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { draw: true }
      },
      winnerVerifications: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!user) return notFound()

  const activeSub = user.subscriptions.find(s => s.status === "ACTIVE")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            User Profile
            <Badge variant={user.role === "ADMIN" ? "destructive" : "secondary"}>
              {user.role}
            </Badge>
          </h1>
          <p className="text-muted-foreground text-sm">Manage user data and history</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 border-t-4 border-t-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-indigo-500" /> Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold">{user.name || "No name provided"}</p>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-muted-foreground">Joined</span>
                <span className="font-medium">{user.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-muted-foreground">Internal ID</span>
                <span className="font-mono text-xs">{user.id.slice(-8)}</span>
              </div>
            </div>
            
            <div className="pt-4 mt-4 text-center">
              <DeleteUserButton userId={user.id} />
            </div>
          </CardContent>
        </Card>

        {/* Financial & Charity */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-500" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeSub ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold">{activeSub.plan}</span>
                      <Badge className="bg-emerald-500 hover:bg-emerald-600">ACTIVE</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Renews: {new Date(activeSub.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    <Badge variant="secondary">INACTIVE</Badge>
                    <p className="text-sm text-muted-foreground mt-2">User does not have an active platform subscription.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  Charitable Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.charitySelection ? (
                  <div>
                    <p className="font-bold text-lg line-clamp-1">{user.charitySelection.charity.name}</p>
                    <p className="text-sm text-muted-foreground mt-1 text-primary font-medium">
                      Contributing {user.charitySelection.contributionPercentage}% 
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">No charity selected yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" /> Recent Golf Scores</CardTitle>
            </CardHeader>
            <CardContent>
              {user.golfScores.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No scores logged.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-slate-50 dark:bg-slate-900 border-b">
                      <tr>
                        <th className="px-4 py-2">Score (Stableford)</th>
                        <th className="px-4 py-2">Date Played</th>
                        <th className="px-4 py-2 inline-flex items-center">System Logged</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.golfScores.map(score => (
                        <tr key={score.id} className="border-b">
                          <td className="px-4 py-2 font-bold text-primary">{score.score}</td>
                          <td className="px-4 py-2">{new Date(score.playedAt).toLocaleDateString()}</td>
                          <td className="px-4 py-2 text-muted-foreground text-xs">{score.createdAt.toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-muted-foreground text-center mt-3">Showing latest scores tracking towards the draw.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Draw Participation History</CardTitle>
        </CardHeader>
        <CardContent>
           {user.drawEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">User has not participated in any published draws yet.</p>
           ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-slate-50 dark:bg-slate-900 border-b">
                    <tr>
                      <th className="px-4 py-3">Draw Month</th>
                      <th className="px-4 py-3">Engine</th>
                      <th className="px-4 py-3">Matching Numbers</th>
                      <th className="px-4 py-3">Matches</th>
                      <th className="px-4 py-3">Prize Won</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.drawEntries.map(entry => (
                      <tr key={entry.id} className="border-b">
                        <td className="px-4 py-3 font-medium">{entry.draw.month}</td>
                        <td className="px-4 py-3"><Badge variant="outline">{entry.draw.drawType}</Badge></td>
                        <td className="px-4 py-3 font-mono">{entry.userScores.join(", ")}</td>
                        <td className="px-4 py-3 font-bold text-indigo-600">{entry.matchCount}</td>
                        <td className="px-4 py-3">
                          {Number(entry.prizeAmount) > 0 ? (
                            <span className="text-emerald-600 font-bold">₹{Number(entry.prizeAmount).toLocaleString()}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           )}
        </CardContent>
      </Card>
      
    </div>
  )
}
