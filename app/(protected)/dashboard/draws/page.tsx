"use client"

import { useState, useEffect } from "react"
import { History, Trophy, Search, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function DrawHistoryPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "won">("all")

  useEffect(() => {
    fetchDraws()
  }, [])

  const fetchDraws = async () => {
    try {
      const res = await fetch("/api/draws")
      const data = await res.json()
      if (res.ok) {
        setEntries(data.entries)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredEntries = filter === "won" ? entries.filter(e => e.matchCount >= 3) : entries

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Draw History</h1>
          <p className="text-muted-foreground mt-2">View past draws and your match results.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            All Entries
          </Button>
          <Button variant={filter === "won" ? "default" : "outline"} onClick={() => setFilter("won")}>
            Trophy Winners
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-xl" />)}
        </div>
      ) : filteredEntries.length === 0 ? (
        <Card className="h-64 flex flex-col items-center justify-center text-center border-dashed">
          {filter === "won" ? (
            <>
              <Trophy className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <CardTitle>No Wins Yet</CardTitle>
              <p className="text-muted-foreground mt-2">Keep submitting your scores and playing!</p>
            </>
          ) : (
            <>
              <History className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <CardTitle>No Draw History</CardTitle>
              <p className="text-muted-foreground mt-2">You haven't participated in any published draws yet.</p>
            </>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredEntries.map((entry, idx) => {
            const isWinner = entry.matchCount >= 3
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`overflow-hidden border-2 ${isWinner ? 'border-primary/50 shadow-md shadow-primary/5' : ''}`}>
                  <CardHeader className={`${isWinner ? 'bg-primary/5' : 'bg-muted/30'} flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4`}>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {entry.draw.month} Draw
                        {isWinner && <Badge className="bg-green-500 hover:bg-green-600 ml-2">Winner</Badge>}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Drawn on {new Date(entry.draw.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {isWinner && (
                      <div className="mt-4 sm:mt-0 text-right">
                        <div className="text-2xl font-bold text-primary flex items-center gap-1"><Trophy className="w-5 h-5"/> ₹{Number(entry.prizeAmount).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Prize Amount</p>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pt-6 grid sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-semibold mb-3 flex items-center"><Search className="w-4 h-4 mr-2" /> Official Drawn Numbers</p>
                      <div className="flex flex-wrap gap-2">
                         {entry.draw.drawnNumbers.map((num: number, i: number) => (
                           <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm ${entry.matchedNumbers.includes(num) ? 'bg-primary text-primary-foreground' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
                             {num}
                           </div>
                         ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-3 flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Your Eligible Scores</p>
                      <div className="flex flex-wrap gap-2">
                        {entry.userScores.map((num: number, i: number) => {
                          const isMatched = entry.matchedNumbers.includes(num);
                          return (
                            <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${isMatched ? 'border-primary text-primary' : 'border-neutral-200 text-muted-foreground'}`}>
                              {num}
                            </div>
                          )
                        })}
                      </div>
                      <p className="text-sm mt-3">
                        <span className="font-semibold">{entry.matchCount}</span> matches found. 
                        {!isWinner && " Need at least 3 to win."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
