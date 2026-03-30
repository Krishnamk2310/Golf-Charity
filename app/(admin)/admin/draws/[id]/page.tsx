import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertTriangle, Trophy, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DrawDetailPage({ params }: { params: { id: string } }) {
  const draw = await prisma.draw.findUnique({
    where: { id: params.id },
    include: {
      entries: {
        where: { matchCount: { gte: 3 } },
        include: { user: true },
        orderBy: { matchCount: 'desc' }
      }
    }
  })

  if (!draw) return notFound()

  const winners5 = draw.entries.filter(e => e.matchCount === 5)
  const winners4 = draw.entries.filter(e => e.matchCount === 4)
  const winners3 = draw.entries.filter(e => e.matchCount === 3)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/draws">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            Draw Detail: {draw.month}
            <Badge variant={draw.status === "PUBLISHED" ? "default" : "secondary"}>
              {draw.status}
            </Badge>
          </h1>
          <p className="text-muted-foreground text-sm">Engine: {draw.drawType}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-indigo-500" /> Drawn Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-6">
              {draw.drawnNumbers.map((num, i) => (
                <div key={i} className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                  {num}
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Total Prize Pool</span>
                <span className="font-bold text-lg">₹{Number(draw.totalPrizePool).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Jackpot Rollover Included</span>
                <span className="font-medium text-yellow-600">
                  {draw.jackpotRollover ? `₹${Number(draw.rolledOverAmount).toLocaleString()}` : "No"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Date Created</span>
                <span className="font-medium">{draw.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-6">
              <h3 className="text-emerald-800 dark:text-emerald-400 font-bold mb-2">5 Matches (Jackpot Tier)</h3>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-black">{winners5.length} Winners</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
                    {winners5.length > 0 ? `₹${Number(winners5[0].prizeAmount).toLocaleString()} each` : "No winners this month"}
                  </p>
                </div>
                {draw.status === "PUBLISHED" && winners5.length === 0 && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Rolled to next month
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="font-bold mb-1">4 Matches</p>
                <p className="text-2xl font-black">{winners4.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {winners4.length > 0 ? `₹${Number(winners4[0].prizeAmount).toLocaleString()} each` : "-"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="font-bold mb-1">3 Matches</p>
                <p className="text-2xl font-black">{winners3.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {winners3.length > 0 ? `₹${Number(winners3[0].prizeAmount).toLocaleString()} each` : "-"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Winning Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {draw.entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No matching tickets found for this draw.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-neutral-50 dark:bg-neutral-900 border-b">
                  <tr>
                    <th className="px-4 py-3">Subscriber</th>
                    <th className="px-4 py-3">Matched</th>
                    <th className="px-4 py-3">Prize</th>
                    <th className="px-4 py-3">User Scores</th>
                  </tr>
                </thead>
                <tbody>
                  {draw.entries.map(entry => (
                    <tr key={entry.id} className="border-b hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                      <td className="px-4 py-3 font-medium">
                        {entry.user.name || "Unknown"}<br/>
                        <span className="text-xs text-muted-foreground">{entry.user.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={entry.matchCount === 5 ? "default" : "secondary"}>
                          {entry.matchCount} Matches
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600">
                        ₹{Number(entry.prizeAmount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {entry.userScores.join(", ")}
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
