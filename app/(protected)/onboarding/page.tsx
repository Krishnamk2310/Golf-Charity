"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, Search, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"

interface Charity {
  id: string
  name: string
  description: string
  imageUrl: string | null
  isFeatured: boolean
}

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null)
  const [contribution, setContribution] = useState<number[]>([10])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCharities()
  }, [])

  const fetchCharities = async () => {
    try {
      const res = await fetch("/api/charities")
      const data = await res.json()
      if (res.ok) setCharities(data.charities)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredCharities = charities.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSave = async () => {
    if (!selectedCharity) return

    setSaving(true)
    try {
      const res = await fetch("/api/user-charity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          charityId: selectedCharity, 
          contributionPercentage: contribution[0] 
        })
      })

      if (!res.ok) throw new Error("Failed to save selection")
      
      toast({
        title: "All set!",
        description: "Your impact preferences have been saved.",
      })
      router.push("/dashboard")
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center mb-10"
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
          Direct Your Impact
        </h1>
        <p className="mt-4 text-xl text-neutral-600 dark:text-neutral-400">
          Choose where your subscription contribution goes.
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-neutral-900 p-6 rounded-xl border shadow-sm">
          <div className="w-full sm:w-1/2 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search charities..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full sm:w-1/2">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Contribution Amount</span>
              <span className="text-sm font-bold text-primary">{contribution}% of prize pool</span>
            </div>
            <Slider 
              value={contribution}
              onValueChange={setContribution}
              max={90}
              min={10}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">Adjust what percentage of your eligible fees go to charity (Min 10%).</p>
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : filteredCharities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No charities found.</div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredCharities.map(charity => {
              const isSelected = selectedCharity === charity.id
              return (
                <motion.div
                  whileHover={{ y: -5 }}
                  key={charity.id}
                  onClick={() => setSelectedCharity(charity.id)}
                  className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                    isSelected ? "border-primary shadow-lg shadow-primary/10" : "border-transparent bg-white dark:bg-neutral-900 shadow-sm"
                  }`}
                >
                  <div className="h-32 bg-neutral-100 dark:bg-neutral-800 relative flex items-center justify-center">
                    {charity.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={charity.imageUrl} alt={charity.name} className="w-full h-full object-cover" />
                    ) : (
                      <Heart className="h-10 w-10 text-neutral-300" />
                    )}
                    {charity.isFeatured && (
                      <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                        Featured
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Check className="h-12 w-12 text-primary bg-white rounded-full p-2 shadow-lg" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg leading-tight mb-2">{charity.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-3">{charity.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        <div className="flex justify-between items-center bg-white dark:bg-neutral-900 p-6 rounded-xl border shadow-sm sticky bottom-6">
          <div className="text-sm">
            {selectedCharity ? (
              <p>Selected: <span className="font-bold">{charities.find(c => c.id === selectedCharity)?.name}</span> with a <span className="font-bold text-primary">{contribution}%</span> contribution.</p>
            ) : (
              <p className="text-muted-foreground">Please select a charity to continue.</p>
            )}
          </div>
          <Button 
            disabled={!selectedCharity || saving} 
            onClick={handleSave}
            size="lg"
            className="px-8"
          >
            {saving ? "Saving..." : "Start Journey →"}
          </Button>
        </div>
      </div>
    </div>
  )
}
