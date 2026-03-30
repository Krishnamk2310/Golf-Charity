"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"

export default function DashboardCharityPage() {
  const { toast } = useToast()
  const [selection, setSelection] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [contribution, setContribution] = useState<number[]>([10])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/user-charity")
      .then(r => r.json())
      .then(d => {
        if (d.selection) {
          setSelection(d.selection)
          setContribution([d.selection.contributionPercentage])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!selection) return
    setSaving(true)
    try {
      const res = await fetch("/api/user-charity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ charityId: selection.charityId, contributionPercentage: contribution[0] })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: "Preferences saved!" })
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="animate-pulse h-64 bg-neutral-200 dark:bg-neutral-800 rounded-xl max-w-2xl mx-auto" />

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Charity</h1>
        <p className="text-muted-foreground mt-1">Manage your chosen partner charity and contribution percentage.</p>
      </div>

      {selection ? (
        <>
          <Card className="border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                <Heart className="h-5 w-5 fill-current" /> Your Partner Charity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="h-20 w-20 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                  {selection.charity.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selection.charity.imageUrl} alt={selection.charity.name} className="h-full w-full object-cover rounded-xl" />
                  ) : (
                    <Heart className="h-8 w-8 text-rose-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl">{selection.charity.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{selection.charity.description}</p>
                  {selection.charity.websiteUrl && (
                    <a href={selection.charity.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-primary hover:underline mt-2">
                      Visit website <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-rose-200 dark:border-rose-900/50">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold">Charity Contribution</label>
                  <span className="text-2xl font-black text-primary">{contribution[0]}%</span>
                </div>
                <Slider
                  value={contribution}
                  onValueChange={setContribution}
                  min={10} max={90} step={5}
                  className="my-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {contribution[0]}% of your eligible prize contributions go directly to {selection.charity.name}.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Link href="/charities">
                  <Button variant="outline">Change Charity</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="h-64 flex flex-col items-center justify-center text-center border-dashed">
          <Heart className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <CardTitle>No charity selected</CardTitle>
          <CardDescription className="mt-2 max-w-xs">
            Choose a charity partner to direct your contribution and make real impact.
          </CardDescription>
          <Link href="/onboarding" className="mt-6">
            <Button>Choose a Charity</Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
