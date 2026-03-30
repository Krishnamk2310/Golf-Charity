"use client"

import { motion } from "framer-motion"
import { CreditCard, PenLine, Trophy } from "lucide-react"

const STEPS = [
  { step: "01", icon: CreditCard, title: "Grab a Subscription", desc: "No complex tiers. Monthly or Yearly, standard rate. Straight away, we siphon off 10% to whatever charity you chose natively during onboarding.", delay: 0 },
  { step: "02", icon: PenLine, title: "Just Play Golf", desc: "Whenever you wrap up 18 holes, quickly log your Stableford score (1–45). We cap it at your 5 most recent scores to keep the math lean and mean.", delay: 0.15 },
  { step: "03", icon: Trophy, title: "Let the Algorithm Go To Work", desc: "On the 1st of the month, our backend simulates a 5-number draw. If your scores hit 3, 4, or 5 matches, you claim your prize logic automatically.", delay: 0.3 },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-950 border-t border-neutral-900 border-b border-indigo-900/20 relative overflow-hidden">
      
      {/* Abstract structural grid line */}
      <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-indigo-900/30 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-8 items-start">
        
        {/* Left Hook */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="lg:w-1/3 lg:sticky lg:top-32"
        >
          <div className="flex items-center gap-2 mb-6">
             <div className="h-[1px] w-8 bg-indigo-500" />
             <p className="text-indigo-400 font-mono text-xs uppercase tracking-[0.2em]">0% Friction</p>
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold text-white tracking-tight mb-6">
            There’s no catch, <br/><span className="text-neutral-500 italic">just basic math.</span>
          </h2>
          <p className="text-neutral-400 text-lg leading-relaxed mb-8">
            We stripped out all the corporate BS. You subscribe, you golf, you get entered into a prize pool. That’s literally the entire business logic loop.
          </p>
        </motion.div>

        {/* Right Flow */}
        <div className="lg:w-2/3 grid gap-8 w-full relative">
          
          <div className="hidden lg:block absolute left-[3.25rem] top-8 bottom-8 w-px bg-neutral-800" />

          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: step.delay }}
              className="relative bg-neutral-900/20 border border-neutral-800/80 rounded-2xl p-8 hover:bg-neutral-900/50 hover:border-indigo-500/30 transition-all duration-500 group"
            >
              <div className="flex flex-col sm:flex-row gap-6">
                
                {/* Visual Anchor */}
                <div className="relative shrink-0 w-14 h-14 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center group-hover:border-indigo-500 group-hover:bg-indigo-500/10 transition-colors z-10">
                  <step.icon className="h-6 w-6 text-neutral-500 group-hover:text-indigo-400 transition-colors" />
                </div>
                
                {/* Explainer */}
                <div className="pt-2">
                  <div className="flex items-center gap-3 mb-3">
                     <span className="text-indigo-500 font-mono font-bold text-sm bg-indigo-500/10 px-2 py-0.5 rounded">{step.step}</span>
                     <h3 className="text-xl font-medium text-white">{step.title}</h3>
                  </div>
                  <p className="text-neutral-400 leading-relaxed max-w-xl text-base">{step.desc}</p>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
