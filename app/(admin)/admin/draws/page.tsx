"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Eye, Play, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminDrawsPage() {
  const { toast } = useToast()
  
  const [draws, setDraws] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [simOpen, setSimOpen] = useState(false)
  const [simMonth, setSimMonth] = useState("")
  const [simType, setSimType] = useState<"RANDOM" | "ALGORITHMIC">("RANDOM")
  const [runningSim, setRunningSim] = useState(false)
  
  const [simResult, setSimResult] = useState<any>(null)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    fetchDraws()
    
    const d = new Date()
    setSimMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }, [])

  const fetchDraws = async () => {
    try {
      const res = await fetch("/api/admin/draws")
      const data = await res.json()
      if (res.ok) setDraws(data.draws)
    } finally {
      setLoading(false)
    }
  }

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault()
    setRunningSim(true)
    
    try {
      const res = await fetch("/api/admin/draws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: simMonth, drawType: simType })
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      setSimResult(data.result)
      fetchDraws()
    } catch (err: any) {
      toast({ title: "Simulation Error", description: err.message, variant: "destructive" })
    } finally {
      setRunningSim(false)
    }
  }

  const handlePublish = async () => {
    if (!simResult) return
    setPublishing(true)
    
    try {
      const res = await fetch(`/api/admin/draws/${simResult.draw.id}/publish`, {
        method: "POST"
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)
      
      toast({ title: "Draw Published successfully!" })
      setSimOpen(false)
      setSimResult(null)
      fetchDraws()
    } catch (err: any) {
      toast({ title: "Publish Error", description: err.message, variant: "destructive" })
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-xl border-l-4 border-l-indigo-500 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Draw Management</h1>
          <p className="text-muted-foreground">Schedule simulations and publish monthly draws.</p>
        </div>
        <Button onClick={() => setSimOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Play className="w-4 h-4 mr-2" /> Run Simulation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historical Draws</CardTitle>
          <CardDescription>A list of all simulated and published draws in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-slate-200 rounded"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          ) : draws.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No draws found. Run your first simulation above!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3">Month</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Numbers</th>
                    <th className="px-4 py-3">Prize Pool</th>
                    <th className="px-4 py-3">Rollover</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {draws.map(draw => (
                    <tr key={draw.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{draw.month}</td>
                      <td className="px-4 py-3">{draw.drawType}</td>
                      <td className="px-4 py-3">
                        <Badge variant={draw.status === "PUBLISHED" ? "default" : "secondary"}>
                          {draw.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {draw.drawnNumbers.map((n: number, i: number) => (
                            <span key={i} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center text-xs font-bold">{n}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">₹{Number(draw.totalPrizePool).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        {draw.jackpotRollover ? (
                          <span className="text-yellow-600 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> ₹{Number(draw.rolledOverAmount).toLocaleString()}</span>
                        ) : "No"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/draws/${draw.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" /> Detail
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={simOpen} onOpenChange={simOpen => {
        setSimOpen(simOpen)
        if (!simOpen) setSimResult(null)
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{simResult ? "Simulation Results Preview" : "Run New Simulation"}</DialogTitle>
            <DialogDescription>
              {simResult 
                ? "Review the generated numbers and prize allocations before publishing to all users." 
                : "A simulation runs the matching engine but keeps results private until explicitly published."}
            </DialogDescription>
          </DialogHeader>

          {!simResult ? (
            <form onSubmit={handleSimulate} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Month (YYYY-MM)</Label>
                  <Input required value={simMonth} onChange={e => setSimMonth(e.target.value)} placeholder="2026-03" />
                </div>
                <div className="space-y-2">
                  <Label>Draw Engine Mode</Label>
                  <Select value={simType} onValueChange={(val: any) => setSimType(val)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RANDOM">RANDOM (Equal Probability)</SelectItem>
                      <SelectItem value="ALGORITHMIC">ALGORITHMIC (Frequency Weighted)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setSimOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={runningSim}>
                  {runningSim ? "Calculating..." : "Generate Simulation"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-6 pt-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg flex justify-between items-center border">
                <div>
                  <h3 className="font-bold">Drawn Numbers</h3>
                  <p className="text-sm text-muted-foreground">{simResult.draw.drawType} engine evaluation</p>
                </div>
                <div className="flex gap-2">
                  {simResult.draw.drawnNumbers.map((n: number, i: number) => (
                    <div key={i} className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                      {n}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-emerald-800 font-bold mb-1">5 Matches (Jackpot)</p>
                    <p className="text-2xl font-black">{simResult.aggregate.count5} Winners</p>
                    <p className="text-sm text-emerald-600">₹{simResult.aggregate.prize5.toLocaleString()} each</p>
                    {simResult.draw.jackpotRollover && <p className="text-xs text-yellow-600 font-bold mt-1">Rolls over to next month</p>}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="font-bold mb-1">4 Matches</p>
                    <p className="text-2xl font-black">{simResult.aggregate.count4} Winners</p>
                    <p className="text-sm text-muted-foreground">₹{simResult.aggregate.prize4.toLocaleString()} each</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="font-bold mb-1">3 Matches</p>
                    <p className="text-2xl font-black">{simResult.aggregate.count3} Winners</p>
                    <p className="text-sm text-muted-foreground">₹{simResult.aggregate.prize3.toLocaleString()} each</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-between items-center border-t pt-4">
                <div>
                  <p className="text-sm font-semibold">Total Pool: ₹{Number(simResult.draw.totalPrizePool).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Includes rolled-over accumulated amounts if any.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setSimResult(null); fetchDraws(); }}>Save & Close</Button>
                  <Button onClick={handlePublish} disabled={publishing} className="bg-indigo-600 hover:bg-indigo-700">
                    {publishing ? "Publishing..." : <><CheckCircle className="w-4 h-4 mr-2" /> Publish Draw Now</>}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
