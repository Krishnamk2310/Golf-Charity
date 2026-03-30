"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Heart, Star, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Charity {
  id: string
  name: string
  description: string
  imageUrl: string | null
  isFeatured: boolean
}

export default function CharitiesDirectory() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)

  useEffect(() => {
    fetchCharities()
  }, [])

  const fetchCharities = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/charities")
      const data = await res.json()
      if (res.ok) setCharities(data.charities)
    } finally {
      setLoading(false)
    }
  }

  const filteredCharities = charities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFeatured = showFeaturedOnly ? c.isFeatured : true
    return matchesSearch && matchesFeatured
  })

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-5xl"
          >
            Partner Charities
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto"
          >
            Discover the incredible organizations your subscription supports. 
            Toggle featured to see our charity of the month.
          </motion.p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 bg-white dark:bg-neutral-900 p-4 rounded-2xl shadow-sm border">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name or mission..." 
              className="pl-10 text-base"
            />
          </div>
          
          <Button 
            variant={showFeaturedOnly ? "default" : "outline"} 
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            className="w-full md:w-auto"
          >
            <Star className={`h-4 w-4 mr-2 ${showFeaturedOnly ? "fill-white" : ""}`} /> 
            {showFeaturedOnly ? "Showing Featured" : "Show Featured Only"}
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : filteredCharities.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-2xl border">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No charities found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria.</p>
            <Button variant="link" onClick={() => { setSearchTerm(""); setShowFeaturedOnly(false); }}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCharities.map((charity, i) => (
              <motion.div
                key={charity.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/charities/${charity.id}`} className="block h-full group">
                  <div className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/50 h-full flex flex-col relative">
                    {charity.isFeatured && (
                      <div className="absolute top-4 left-4 z-10 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center">
                        <Star className="h-3 w-3 mr-1 fill-yellow-900" /> Featured
                      </div>
                    )}
                    
                    <div className="h-48 bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden flex items-center justify-center">
                      {charity.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                          src={charity.imageUrl} 
                          alt={charity.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      ) : (
                        <Heart className="h-16 w-16 text-neutral-300 dark:text-neutral-700" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-white font-medium flex items-center">
                          View details <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">{charity.name}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                        {charity.description}
                      </p>
                      
                      <div className="pt-4 border-t flex justify-between items-center mt-auto">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Learn More</span>
                        <ArrowRight className="h-4 w-4 text-primary transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
