"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Users, Trophy, Gift } from "lucide-react"

function AnimatedCounter({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const step = target / 60
    let current = 0
    const interval = setInterval(() => {
      current += step
      if (current >= target) {
        setCount(target)
        clearInterval(interval)
      } else {
        setCount(Math.floor(current))
      }
    }, 16)
    return () => clearInterval(interval)
  }, [inView, target])

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

export default function StatsBar({ subscribers, prizePaid }: { subscribers: number; prizePaid: number }) {
  const stats = [
    { icon: Users, label: "Active Subscribers", value: subscribers, prefix: "", suffix: "+" },
    { icon: Trophy, label: "Total Prize Pool Distributed", value: prizePaid, prefix: "₹", suffix: "" },
    { icon: Gift, label: "Charities Supported", value: 3, prefix: "", suffix: " Partners" },
  ]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-indigo-600/10 border-y border-indigo-500/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-indigo-500/20">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center py-6 md:py-0"
            >
              <div className="flex justify-center mb-3">
                <stat.icon className="h-8 w-8 text-indigo-400" />
              </div>
              <div className="text-4xl font-black text-white">
                <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <p className="text-neutral-400 text-sm mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
