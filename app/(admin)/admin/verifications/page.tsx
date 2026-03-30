"use client"

import { useState, useEffect } from "react"
import { FileCheck, Eye, CheckCircle, XCircle, DollarSign, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminVerificationsPage() {
  const { toast } = useToast()
  const [verifications, setVerifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("PENDING")
  
  const [selected, setSelected] = useState<any>(null)
  const [notes, setNotes] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchVerifications(activeTab)
  }, [activeTab])

  const fetchVerifications = async (status: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/verifications?status=${status}`)
      const data = await res.json()
      if (res.ok) setVerifications(data.verifications)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: "APPROVED" | "REJECTED") => {
    if (!selected) return
    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/verifications/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNotes: notes })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast({ title: action === "APPROVED" ? "Verification Approved!" : "Verification Rejected" })
      setSelected(null)
      setNotes("")
      fetchVerifications(activeTab)
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setProcessing(false)
    }
  }

  const handlePayout = async (verificationId: string) => {
    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/verifications/${verificationId}/payout`, { method: "PUT" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast({ title: "Payout marked as complete!" })
      fetchVerifications(activeTab)
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setProcessing(false)
    }
  }

  const VerificationTable = () => (
    loading ? (
      <div className="animate-pulse space-y-3 p-6">
        <div className="h-10 bg-slate-200 rounded"></div>
        <div className="h-10 bg-slate-200 rounded"></div>
      </div>
    ) : verifications.length === 0 ? (
      <div className="text-center py-16 text-muted-foreground">No verifications in this category.</div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Draw Month</th>
              <th className="px-4 py-3">Prize</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Payout</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {verifications.map(v => (
              <tr key={v.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium">{v.user.name}</p>
                  <p className="text-xs text-muted-foreground">{v.user.email}</p>
                </td>
                <td className="px-4 py-3 font-medium">{v.drawEntry?.draw?.month}</td>
                <td className="px-4 py-3 font-bold text-primary">₹{Number(v.drawEntry?.prizeAmount || 0).toLocaleString()}</td>
                <td className="px-4 py-3">{new Date(v.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Badge variant={v.payoutStatus === "PAID" ? "default" : "secondary"}>
                    {v.payoutStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setSelected(v)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {v.status === "APPROVED" && v.payoutStatus !== "PAID" && (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handlePayout(v.id)} disabled={processing}>
                        <DollarSign className="w-4 h-4 mr-1" /> Mark Paid
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-xl border-l-4 border-l-amber-500 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold flex items-center"><FileCheck className="w-5 h-5 mr-2 text-amber-500" /> Winner Verification</h1>
          <p className="text-muted-foreground mt-1">Review prize proof submissions and manage payouts.</p>
        </div>
      </div>

      <Card>
        <Tabs defaultValue="PENDING" onValueChange={(v) => setActiveTab(v)}>
          <CardHeader>
            <TabsList className="grid grid-cols-4 w-full max-w-sm">
              <TabsTrigger value="PENDING">Pending</TabsTrigger>
              <TabsTrigger value="APPROVED">Approved</TabsTrigger>
              <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
              <TabsTrigger value="ALL">All</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="p-0">
            <TabsContent value="PENDING"><VerificationTable /></TabsContent>
            <TabsContent value="APPROVED"><VerificationTable /></TabsContent>
            <TabsContent value="REJECTED"><VerificationTable /></TabsContent>
            <TabsContent value="ALL"><VerificationTable /></TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setNotes("") }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Proof — {selected?.user?.name}</DialogTitle>
            <DialogDescription>
              {selected?.drawEntry?.draw?.month} Draw · Prize: ₹{Number(selected?.drawEntry?.prizeAmount || 0).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {selected?.proofUrl ? (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border h-64 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.proofUrl} alt="Proof" className="max-h-full w-auto object-contain" />
              </div>
            ) : (
              <div className="h-40 bg-slate-100 rounded-xl flex items-center justify-center text-muted-foreground">
                <ImageIcon className="w-10 h-10 opacity-50" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Admin Notes (optional)</Label>
              <Input
                placeholder="Add notes for the user..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          {selected?.status === "PENDING" && (
            <DialogFooter className="gap-2 flex-col sm:flex-row mt-4">
              <Button variant="destructive" onClick={() => handleAction("REJECTED")} disabled={processing} className="flex-1">
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 flex-1" onClick={() => handleAction("APPROVED")} disabled={processing}>
                <CheckCircle className="w-4 h-4 mr-2" /> Approve
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
