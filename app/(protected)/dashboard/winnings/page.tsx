"use client"

import { useState, useEffect, useRef } from "react"
import { Gift, Upload, CheckCircle, Clock, XCircle, Trophy } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  PENDING: { label: "Pending Review", icon: Clock, color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  APPROVED: { label: "Approved", icon: CheckCircle, color: "bg-green-100 text-green-800 border-green-300" },
  REJECTED: { label: "Rejected", icon: XCircle, color: "bg-red-100 text-red-800 border-red-300" },
}

export default function WinningsPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [verifications, setVerifications] = useState<any[]>([])
  const [drawEntries, setDrawEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [uploadModal, setUploadModal] = useState<{ open: boolean; entryId: string | null }>({ open: false, entryId: null })
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [verRes, drawRes] = await Promise.all([
        fetch("/api/winners/verify"),
        fetch("/api/draws")
      ])
      const [verData, drawData] = await Promise.all([verRes.json(), drawRes.json()])
      if (verRes.ok) setVerifications(verData.verifications)
      if (drawRes.ok) setDrawEntries(drawData.entries)
    } finally {
      setLoading(false)
    }
  }

  const totalWon = verifications
    .filter(v => v.status !== "REJECTED")
    .reduce((sum, v) => sum + Number(v.drawEntry?.prizeAmount || 0), 0)

  const claimableEntries = drawEntries.filter(e =>
    e.matchCount >= 3 &&
    !verifications.find(v => v.drawEntry?.id === e.id)
  )

  const handleUpload = async () => {
    if (!selectedFile || !uploadModal.entryId) return
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      const uploadData = await uploadRes.json()

      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed")

      const verifyRes = await fetch("/api/winners/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drawEntryId: uploadModal.entryId, proofUrl: uploadData.url })
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) throw new Error(verifyData.error)

      toast({ title: "Proof submitted!", description: "We'll review your submission and notify you." })
      setUploadModal({ open: false, entryId: null })
      setSelectedFile(null)
      fetchData()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) setSelectedFile(file)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Winnings</h1>
        <p className="text-muted-foreground mt-1">Track your prizes and submit verification proofs.</p>
      </div>

      {/* Total Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center shadow-xl shadow-indigo-500/20"
      >
        <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-2">Lifetime Winnings</p>
        <p className="text-5xl font-black">₹{totalWon.toLocaleString()}</p>
      </motion.div>

      {/* Claimable Prizes */}
      {claimableEntries.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-500" /> Prizes Ready to Claim
          </h2>
          <div className="space-y-3">
            {claimableEntries.map(entry => (
              <Card key={entry.id} className="border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20">
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-lg">{entry.draw.month} Draw — {entry.matchCount} Matches!</p>
                    <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      Prize: ₹{Number(entry.prizeAmount).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Upload proof of your golf scores to claim</p>
                  </div>
                  <Button
                    onClick={() => setUploadModal({ open: true, entryId: entry.id })}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                  >
                    <Upload className="w-4 h-4 mr-2" /> Claim Prize
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Verification History */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" /> Verification History
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-xl"/>)}
          </div>
        ) : verifications.length === 0 ? (
          <Card className="h-48 flex flex-col items-center justify-center text-center border-dashed">
            <Trophy className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
            <CardTitle className="text-base">No verified winnings yet</CardTitle>
            <CardDescription>Win a draw and claim your prize above.</CardDescription>
          </Card>
        ) : (
          <div className="space-y-4">
            {verifications.map((v, idx) => {
              const statusCfg = STATUS_CONFIG[v.status]
              const StatusIcon = statusCfg.icon
              return (
                <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card>
                    <CardContent className="p-5 grid sm:grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="font-semibold">{v.drawEntry?.draw?.month} Draw</p>
                        <p className="text-sm text-muted-foreground">{new Date(v.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">₹{Number(v.drawEntry?.prizeAmount || 0).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Prize Amount</p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.color}`}>
                          <StatusIcon className="w-3 h-3" /> {statusCfg.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <Badge variant={v.payoutStatus === "PAID" ? "default" : "secondary"}>
                          {v.payoutStatus === "PAID" ? "Paid Out" : "Awaiting Payout"}
                        </Badge>
                        {v.status === "REJECTED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 w-full"
                            onClick={() => setUploadModal({ open: true, entryId: v.drawEntry?.id })}
                          >
                            Resubmit Proof
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Dialog open={uploadModal.open} onOpenChange={(open) => {
        setUploadModal({ open, entryId: null })
        if (!open) setSelectedFile(null)
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Score Proof</DialogTitle>
            <DialogDescription>
              Upload a screenshot from your golf app showing your scores. PNG or JPG, max 5MB.
            </DialogDescription>
          </DialogHeader>

          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors mt-4 ${dragOver ? "border-primary bg-primary/5" : "border-neutral-300 dark:border-neutral-700"}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            {selectedFile ? (
              <div>
                <p className="font-semibold text-primary">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <>
                <p className="font-medium">Drop file here or click to browse</p>
                <p className="text-sm text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
              </>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setUploadModal({ open: false, entryId: null })}>Cancel</Button>
            <Button disabled={!selectedFile || uploading} onClick={handleUpload}>
              {uploading ? "Uploading..." : "Submit Proof"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
