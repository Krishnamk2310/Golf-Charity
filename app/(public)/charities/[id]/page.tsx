"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Heart, Calendar, Globe, MapPin, ArrowLeft, HeartHandshake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface CharityEvent {
  id: string
  title: string
  description: string
  eventDate: string
}

interface CharityDetail {
  id: string
  name: string
  description: string
  imageUrl: string | null
  websiteUrl: string | null
  isFeatured: boolean
  events: CharityEvent[]
}

export default function CharityProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [charity, setCharity] = useState<CharityDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [donateOpen, setDonateOpen] = useState(false)
  const [donateAmount, setDonateAmount] = useState("50")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchCharity()
  }, [id])

  const fetchCharity = async () => {
    try {
      const res = await fetch(`/api/charities/${id}`)
      const data = await res.json()
      if (res.ok) {
        setCharity(data.charity)
      } else {
        toast({ title: "Error", description: "Charity not found", variant: "destructive" })
        router.push("/charities")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    
    setTimeout(() => {
      setProcessing(false)
      setDonateOpen(false)
      toast({
        title: "Donation Successful!",
        description: `Thank you for contributing ₹${donateAmount} to ${charity?.name}.`,
      })
    }, 2000)
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!charity) return null

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/charities" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to charities
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 overflow-hidden shadow-xl rounded-2xl border"
        >
          {/* Header Image */}
          <div className="relative h-64 sm:h-80 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
            {charity.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={charity.imageUrl} alt={charity.name} className="w-full h-full object-cover" />
            ) : (
              <Heart className="h-24 w-24 text-neutral-400" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
              <div className="flex flex-wrap gap-2 mb-3">
                {charity.isFeatured && (
                  <Badge className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950 px-3 py-1 font-bold text-xs uppercase shadow-sm">
                    Featured Partner
                  </Badge>
                )}
                <Badge variant="secondary" className="px-3 py-1 border-white/20 bg-white/10 backdrop-blur-md">
                  Non-Profit
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-2">
                {charity.name}
              </h1>
              {charity.websiteUrl && (
                <a href={charity.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-neutral-200 hover:text-white transition-colors text-sm font-medium">
                  <Globe className="mr-1.5 h-4 w-4" /> Visit official website
                </a>
              )}
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 p-6 sm:p-10">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <HeartHandshake className="mr-2 text-primary" /> Our Mission
                </h2>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="text-base sm:text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {charity.description}
                  </p>
                </div>
              </section>
              
              <section className="pt-8 border-t">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Calendar className="mr-2 text-primary" /> Upcoming Impact Events
                </h2>
                
                {charity.events.length === 0 ? (
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-8 text-center border dashed">
                    <p className="text-muted-foreground italic">No events scheduled at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {charity.events.map(event => (
                      <div key={event.id} className="bg-card shadow-sm border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-5 flex flex-col sm:flex-row gap-4 justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                            <p className="text-muted-foreground text-sm line-clamp-2 sm:line-clamp-none">
                              {event.description}
                            </p>
                          </div>
                          <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-center min-w-[120px] font-medium text-sm flex-shrink-0">
                            {new Date(event.eventDate).toLocaleDateString(undefined, {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
            
            {/* Sidebar CTA */}
            <div className="md:col-span-1">
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sticky top-24">
                <h3 className="font-bold text-xl mb-2 text-primary">Support this charity directly</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  While your subscription already helps support {charity.name}, you can always make an additional one-time direct donation.
                </p>
                <Button 
                  size="lg" 
                  className="w-full text-lg h-14 bg-primary text-primary-foreground hover:bg-primary/90" 
                  onClick={() => setDonateOpen(true)}
                >
                  <Heart className="mr-2 h-5 w-5 fill-current" /> Donate Now
                </Button>
                <div className="mt-4 text-xs text-center text-muted-foreground">
                  100% of direct donations go securely to the foundation.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Dialog open={donateOpen} onOpenChange={setDonateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Support {charity.name}</DialogTitle>
            <DialogDescription>
              Demo mode — Payments are simulated. Make a one-time impact today.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDonate} className="space-y-6 pt-4">
            <div className="space-y-3">
              <Label htmlFor="amount" className="text-base">Donation Amount (₹)</Label>
              <div className="flex items-center space-x-2">
                <Button type="button" variant="outline" className={donateAmount === "50" ? "border-primary text-primary bg-primary/5" : ""} onClick={() => setDonateAmount("50")}>₹50</Button>
                <Button type="button" variant="outline" className={donateAmount === "100" ? "border-primary text-primary bg-primary/5" : ""} onClick={() => setDonateAmount("100")}>₹100</Button>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                  <Input 
                    id="amount" 
                    type="number" 
                    required 
                    min="1"
                    className="pl-8"
                    value={donateAmount} 
                    onChange={(e) => setDonateAmount(e.target.value)} 
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2 pb-2 border-t pt-6">
              <Button type="button" variant="ghost" onClick={() => setDonateOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={processing} className="w-full sm:w-auto text-base py-6">
                {processing ? "Simulating Payment..." : `Donate ₹${donateAmount}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
