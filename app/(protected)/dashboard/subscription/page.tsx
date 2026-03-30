"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { CreditCard, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export default function SubscriptionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, update } = useSession()

  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetch("/api/subscriptions")
      .then(r => r.json())
      .then(d => { if (d.subscription) setSubscription(d.subscription) })
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const res = await fetch("/api/subscriptions/cancel", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      await update()
      toast({ title: "Subscription cancelled", description: "Your access continues until the period end date." })
      setCancelOpen(false)
      setSubscription((prev: any) => prev ? { ...prev, status: "CANCELLED" } : null)
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse space-y-6 max-w-2xl mx-auto">
      <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
      <div className="h-64 bg-neutral-200 rounded-xl"></div>
    </div>
  }

  const isActive = subscription?.status === "ACTIVE"
  const renewalDate = subscription ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : null

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Subscription</h1>
        <p className="text-muted-foreground mt-1">Manage your plan and billing details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-500" /> Plan Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscription ? (
            <>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xl">{subscription.plan}</span>
                    <Badge>{subscription.plan === "MONTHLY" ? "₹799/mo" : "₹7,999/yr"}</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge variant={isActive ? "default" : subscription.status === "CANCELLED" ? "secondary" : "destructive"} className="text-sm py-1 px-3">
                    {isActive ? <CheckCircle className="w-3 h-3 mr-1.5 inline" /> : <AlertTriangle className="w-3 h-3 mr-1.5 inline" />}
                    {subscription.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {subscription.status === "CANCELLED" ? "Access Until" : "Next Renewal"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{renewalDate}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                  <span className="font-medium">{new Date(subscription.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                {subscription.plan === "MONTHLY" && isActive && (
                  <Button variant="outline" onClick={() => router.push("/subscribe")} className="flex-1">
                    Upgrade to Yearly (Save 16%)
                  </Button>
                )}
                {isActive && (
                  <Button variant="destructive" onClick={() => setCancelOpen(true)} className="flex-1">
                    Cancel Subscription
                  </Button>
                )}
                {!isActive && (
                  <Button onClick={() => router.push("/subscribe")} className="flex-1">
                    Reactivate Subscription
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-bold text-lg mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground text-sm mb-6">Subscribe to enter monthly draws and support charities.</p>
              <Button onClick={() => router.push("/subscribe")}>Choose a Plan</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle /> Cancel Subscription?
            </DialogTitle>
            <DialogDescription>
              Your access and draw eligibility will continue until <strong>{renewalDate}</strong>. After that, you'll no longer be entered in draws. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>Keep My Plan</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? "Cancelling..." : "Yes, Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
