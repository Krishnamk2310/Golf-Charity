"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, PlayCircle, Trophy, Flag, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex text-left items-center pt-24 pb-12 px-4 sm:px-6 lg:px-12 overflow-hidden">
      {/* Asymmetric atmospheric glow */}
      <div className="absolute inset-0 bg-neutral-950">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-5%] w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* Subtle grain overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Copy Column */}
        <div className="lg:col-span-7 flex flex-col items-start pr-0 md:pr-12">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6 text-emerald-400 font-mono text-sm tracking-tight border border-emerald-900/30 bg-emerald-950/20 px-3 py-1.5 rounded-md"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Public Beta 2.0 Live
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-[5rem] font-medium tracking-tight leading-[1.05] mb-8 text-neutral-100"
          >
            Stop wasting <br className="hidden md:block" />
            <span className="text-white font-bold italic pr-2">your best</span>
            Sunday rounds.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4 mb-10 text-[1.15rem] leading-relaxed text-neutral-400 max-w-xl"
          >
            <p>
              Most amateur golfers finish 18 holes, log their scores, and never think about them again. We built Digital Heroes to actually do something with that data.
            </p>
            <p>
              Every month, your Stableford scores act as actual tickets in our verified prize draw engine. Win cash payouts, while we seamlessly funnel 10% of your membership directly to charities you actually care about.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Button asChild size="lg" className="h-14 px-8 w-full sm:w-auto text-base bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/40 active:scale-95 border-0">
              <Link href="/register">
                Create your player profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="ghost" className="h-14 px-8 w-full sm:w-auto text-base text-neutral-300 hover:text-white hover:bg-neutral-800 transition-all duration-300 active:scale-95">
              <Link href="/#pricing">
                <PlayCircle className="mr-2 h-5 w-5 opacity-70" />
                See pricing
              </Link>
            </Button>
          </motion.div>

        </div>

        {/* Right Visual / Social Proof Column - Breaks Symmetry */}
        <div className="lg:col-span-5 hidden lg:flex flex-col gap-6 w-full pl-8">
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-500 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <Trophy className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Jackpot Engine</h3>
                <p className="text-sm text-neutral-500">Hits every 30 days automatically</p>
              </div>
            </div>
            
            <div className="flex justify-between items-end border-t border-neutral-800/50 pt-6">
               <div>
                 <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">5-Match Win Pool</p>
                 <p className="text-3xl font-mono text-white">40% <span className="text-sm text-neutral-500 font-sans tracking-normal">+ Rollover</span></p>
               </div>
               <div className="bg-emerald-950/40 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-900/50">
                 Verified
               </div>
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, x: 30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8, delay: 0.5 }}
             className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800 rounded-3xl p-6 ml-8 hover:-translate-y-2 transition-transform duration-500"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <ShieldCheck className="h-4 w-4 text-rose-400" />
              </div>
              <p className="text-sm text-neutral-300 leading-snug">
                "Honestly, the UI feels like a modern SaaS, not that clunky tournament software we used to use."
                <br/><span className="text-xs text-neutral-500 block mt-2">— Private Beta Tester</span>
              </p>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
