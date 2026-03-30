"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit2, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"

interface Score {
  id: string
  score: number
  playedAt: string
}

export default function ScoresPage() {
  const { toast } = useToast()
  
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [newScore, setNewScore] = useState("")
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0])
  
  const [editingScore, setEditingScore] = useState<Score | null>(null)
  const [editScoreValue, setEditScoreValue] = useState("")
  const [editDateValue, setEditDateValue] = useState("")

  useEffect(() => {
    fetchScores()
  }, [])

  const fetchScores = async () => {
    try {
      const res = await fetch("/api/scores")
      const data = await res.json()
      if (res.ok) setScores(data.scores)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: newScore, playedAt: newDate })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      toast({ title: "Score added" })
      setNewScore("")
      fetchScores()
    } catch (err: any) {
      toast({ title: "Error adding score", description: err.message, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingScore) return
    setSubmitting(true)
    
    try {
      const res = await fetch(`/api/scores/${editingScore.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: editScoreValue, playedAt: editDateValue })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      toast({ title: "Score updated" })
      setEditingScore(null)
      fetchScores()
    } catch (err: any) {
      toast({ title: "Error updating", description: err.message, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this score?")) return
    
    try {
      const res = await fetch(`/api/scores/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      
      setScores(prev => prev.filter(s => s.id !== id))
      toast({ title: "Score removed" })
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Scores</h1>
        <p className="text-muted-foreground mt-2">Manage your recent golf scores. Your latest 5 scores will be used for the monthly draw.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 border-b pb-6 md:pb-0 md:border-b-0">
          <Card>
            <CardHeader>
              <CardTitle>Add Score</CardTitle>
              <CardDescription>Enter your Stableford score (1-45).</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label>Score (Stableford points)</Label>
                  <Input 
                    type="number" min="1" max="45" required 
                    value={newScore} onChange={e => setNewScore(e.target.value)}
                    placeholder="E.g. 36"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date Played</Label>
                  <Input 
                    type="date" required max={new Date().toISOString().split("T")[0]}
                    value={newDate} onChange={e => setNewDate(e.target.value)}
                  />
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md border border-blue-200 dark:border-blue-900 flex gap-2 text-sm text-blue-800 dark:text-blue-300">
                  <Info className="w-5 h-5 flex-shrink-0" />
                  <span>Adding a 6th score will automatically replace your oldest logged score.</span>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  <Plus className="w-4 h-4 mr-2" /> Add Score
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-xl" />)}
            </div>
          ) : scores.length === 0 ? (
            <Card className="h-64 flex flex-col items-center justify-center text-center border-dashed">
              <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
              <CardTitle>No scores logged</CardTitle>
              <CardDescription className="max-w-xs mt-2">
                Add your first score to start building your profile for the next draw.
              </CardDescription>
            </Card>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {scores.map((score, idx) => (
                  <motion.div
                    key={score.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 gap-4">
                        <div className="flex items-center gap-6 text-center sm:text-left">
                          <div className="bg-primary/10 text-primary w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl">
                            {score.score}
                          </div>
                          <div>
                            <p className="font-semibold text-lg hover:underline cursor-default">Stableford Points</p>
                            <p className="text-muted-foreground text-sm">Played on {new Date(score.playedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => {
                            setEditingScore(score)
                            setEditScoreValue(String(score.score))
                            setEditDateValue(score.playedAt.split("T")[0])
                          }}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(score.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              {scores.length === 5 && (
                <p className="text-center text-sm text-muted-foreground pt-4">You have reached the maximum of 5 scores. New scores will replace the oldest.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!editingScore} onOpenChange={() => setEditingScore(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Score</DialogTitle>
            <DialogDescription>Modify your logged score.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Score (Stableford points)</Label>
              <Input 
                type="number" min="1" max="45" required 
                value={editScoreValue} onChange={e => setEditScoreValue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date Played</Label>
              <Input 
                type="date" required max={new Date().toISOString().split("T")[0]}
                value={editDateValue} onChange={e => setEditDateValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingScore(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={submitting}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Trophy(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
