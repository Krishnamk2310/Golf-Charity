"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { BarChart as BarIcon, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AdminReportsPage() {
  const [data, setData] = useState<any>({
    subscriberGrowth: [],
    prizeDistribution: [],
    totalStats: { totalUsers: 0, activeSubscribers: 0, totalPrizePaid: 0 },
    charityData: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/reports")
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [])

  const exportCSV = (rows: any[], filename: string) => {
    if (!rows.length) return
    const keys = Object.keys(rows[0])
    const csv = [keys.join(","), ...rows.map(r => keys.map(k => r[k]).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-xl border-l-4 border-l-violet-500 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold flex items-center"><BarIcon className="w-5 h-5 mr-2 text-violet-500" /> Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Platform-wide performance and impact metrics.</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: data.totalStats.totalUsers },
          { label: "Active Subscribers", value: data.totalStats.activeSubscribers },
          { label: "Total Prize Money Distributed", value: `₹${data.totalStats.totalPrizePaid.toLocaleString()}` },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <p className="text-3xl font-black">{s.value}</p>
              <p className="text-muted-foreground text-sm mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscriber Growth Chart */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Monthly Subscriber Growth</CardTitle>
            <CardDescription>New active subscriptions created per month</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => exportCSV(data.subscriberGrowth, "subscriber_growth.csv")}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </CardHeader>
        <CardContent>
          {data.subscriberGrowth.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">No subscriber data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.subscriberGrowth} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1" }} name="New Subscribers" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Prize Pool Distribution */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Prize Pool per Draw</CardTitle>
            <CardDescription>Total prize pool distributed each published draw</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => exportCSV(data.prizeDistribution, "prize_distribution.csv")}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </CardHeader>
        <CardContent>
          {data.prizeDistribution.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">No published draws yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.prizeDistribution} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, "Prize Pool"]} />
                <Bar dataKey="pool" fill="#6366f1" radius={[4, 4, 0, 0]} name="Prize Pool (₹)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Charity Contributions */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Charity Support Breakdown</CardTitle>
            <CardDescription>Number of subscribers supporting each charity</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => exportCSV(data.charityData, "charity_contributions.csv")}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </CardHeader>
        <CardContent>
          {data.charityData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">No charity selection data yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3">Charity</th>
                    <th className="px-4 py-3">Supporters</th>
                    <th className="px-4 py-3">Avg. Contribution %</th>
                  </tr>
                </thead>
                <tbody>
                  {data.charityData.map((c: any) => (
                    <tr key={c.charityId} className="border-b">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3">{c.supporters} subscribers</td>
                      <td className="px-4 py-3">{c.avgContribution}%</td>
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
