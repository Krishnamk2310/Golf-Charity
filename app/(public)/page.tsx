import Link from "next/link"
import { ArrowRight, Heart, Trophy, Star, Zap, TrendingUp, Users, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import HeroSection from "@/components/home/HeroSection"
import HowItWorks from "@/components/home/HowItWorks"
import StatsBar from "@/components/home/StatsBar"
import FaqSection from "@/components/home/FaqSection"
import AnimateOnScroll from "@/components/home/AnimateOnScroll"

async function getPublicData() {
  try {
    const [featuredCharity, charities, activeSubscribers, totalPrizePaid] = await Promise.all([
      prisma.charity.findFirst({ where: { isFeatured: true } }),
      prisma.charity.findMany({ take: 3, orderBy: { createdAt: "desc" } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.drawEntry.aggregate({ _sum: { prizeAmount: true } }),
    ])
    return {
      featuredCharity,
      charities,
      activeSubscribers,
      totalPrizePaid: Number(totalPrizePaid._sum.prizeAmount || 0)
    }
  } catch {
    return { featuredCharity: null, charities: [], activeSubscribers: 0, totalPrizePaid: 0 }
  }
}

export default async function HomePage() {
  const { featuredCharity, charities, activeSubscribers, totalPrizePaid } = await getPublicData()

  const prizeTiers = [
    { matches: 5, pct: "40%", label: "Jackpot", color: "from-yellow-500 to-amber-500", textColor: "text-amber-100", desc: "All 5 scores match. Jackpot rolls over if no winner." },
    { matches: 4, pct: "35%", label: "Major", color: "from-indigo-500 to-violet-600", textColor: "text-indigo-100", desc: "4 of 5 scores match the drawn numbers." },
    { matches: 3, pct: "25%", label: "Starter", color: "from-emerald-500 to-teal-600", textColor: "text-emerald-100", desc: "3 of 5 scores match. Shared equally among all tier winners." },
  ]

  const faqs = [
    { q: "How does the monthly draw work?", a: "Each month, 5 numbers from 1–45 are drawn. Your latest 5 golf scores are compared against the drawn numbers. If 3 or more match, you win a share of the prize pool." },
    { q: "How is charity money used?", a: "30% of each subscription fee goes directly into the prize pool. Each subscriber then allocates a portion of their prize eligibility contribution to their chosen charity partner." },
    { q: "Can I cancel my subscription?", a: "Yes, anytime from your Dashboard → Subscription page. You retain access until the end of your current billing period." },
    { q: "What happens if no one wins the jackpot?", a: "If there are no 5-match winners in a given month, the 5-match pool rolls over and is added to the next month's total prize pool." },
    { q: "How do I claim my prize?", a: "Winners receive a notification. You then upload a screenshot from your golf app showing your scores. Our team reviews and approves within 48 hours." },
    { q: "Is my payment secure?", a: "All transactions are processed through Razorpay, a PCI-DSS compliant payment gateway. We never store your card details." },
  ]

  return (
    <div className="bg-neutral-950 text-white">
      <HeroSection />

      <HowItWorks />

      {/* Featured Charity */}
      {featuredCharity && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-neutral-950 to-rose-950/20">
          <div className="max-w-7xl mx-auto">
            <AnimateOnScroll>
              <div className="flex items-center gap-2 justify-center mb-4">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <p className="text-yellow-400 font-semibold text-sm tracking-widest uppercase">Featured Charity Partner</p>
              </div>
              <div className="bg-gradient-to-r from-rose-950/40 to-neutral-900 border border-rose-900/40 rounded-3xl overflow-hidden shadow-2xl">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="h-72 md:h-auto bg-neutral-800 relative">
                    {featuredCharity.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={featuredCharity.imageUrl} alt={featuredCharity.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Heart className="h-24 w-24 text-rose-800" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-neutral-900 hidden md:block" />
                  </div>
                  <div className="p-10 flex flex-col justify-center">
                    <Badge className="w-fit mb-4 bg-rose-900/50 text-rose-300 border-rose-800">Partner Charity</Badge>
                    <h2 className="text-3xl font-extrabold text-white mb-4">{featuredCharity.name}</h2>
                    <p className="text-neutral-300 leading-relaxed text-lg mb-8">{featuredCharity.description}</p>
                    <Link href={`/charities/${featuredCharity.id}`}>
                      <Button className="w-fit bg-rose-600 hover:bg-rose-500 text-white">
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      )}

      {/* Prize Tiers */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <p className="text-indigo-400 font-semibold tracking-widest uppercase text-sm mb-4">The Prize Engine</p>
              <h2 className="text-4xl font-extrabold">The Math Behind The Payouts</h2>
              <p className="text-neutral-400 mt-4 text-lg max-w-2xl mx-auto">We don't do complex formulas. Match 3, 4, or 5 numbers. Get paid.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {prizeTiers.map((tier, i) => (
                <div key={i} className={`bg-gradient-to-br ${tier.color} rounded-2xl p-8 text-center shadow-xl`}>
                  <div className="text-6xl font-black mb-2">{tier.pct}</div>
                  <div className="text-2xl font-bold mb-1">{tier.matches} Matches — {tier.label}</div>
                  <p className={`${tier.textColor} text-sm mt-3 opacity-90`}>{tier.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
              <p className="text-yellow-300 font-semibold">
                🏆 Jackpot Rollover — If no one matches all 5 numbers, the 40% jackpot rolls over to the next month's draw!
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Live Stats */}
      <StatsBar subscribers={activeSubscribers} prizePaid={totalPrizePaid} />

      {/* Charity Directory Preview */}
      {charities.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-900/50">
          <div className="max-w-7xl mx-auto">
            <AnimateOnScroll>
              <div className="text-center mb-16">
                <p className="text-rose-400 font-semibold tracking-widest uppercase text-sm mb-4">Where The Money Goes</p>
                <h2 className="text-4xl font-extrabold">Our Vetted Partners</h2>
                <p className="text-neutral-400 mt-4 text-lg max-w-2xl mx-auto">10% of every subscription automatically flows to these organizations.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {charities.map(charity => (
                  <Link key={charity.id} href={`/charities/${charity.id}`}>
                    <div className="bg-neutral-800/60 border border-neutral-700 rounded-2xl overflow-hidden hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300 group">
                      <div className="h-40 bg-neutral-700 relative flex items-center justify-center overflow-hidden">
                        {charity.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={charity.imageUrl} alt={charity.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <Heart className="h-12 w-12 text-neutral-500" />
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-white text-lg mb-2 group-hover:text-rose-400 transition-colors">{charity.name}</h3>
                        <p className="text-neutral-400 text-sm line-clamp-2">{charity.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center">
                <Link href="/charities">
                  <Button variant="outline" size="lg" className="border-neutral-600 text-neutral-300 hover:border-rose-500 hover:text-rose-400">
                    View All Charities <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <p className="text-indigo-400 font-semibold tracking-widest uppercase text-sm mb-4">0% Hidden Fees</p>
              <h2 className="text-4xl font-extrabold">Join the Pool</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { name: "Monthly", price: "₹799", period: "/month", features: ["1 draw entry/month", "Charity of your choice", "5 score slots", "Cancel anytime"], cta: "Start Monthly" },
                { name: "Yearly", price: "₹7,999", period: "/year", features: ["12 draw entries/year", "Max charity impact", "5 score slots", "Save ₹1,589 vs monthly"], cta: "Start Yearly", badge: "Save 16%" },
              ].map((plan, i) => (
                <div key={i} className={`rounded-2xl p-8 border ${i === 1 ? 'border-indigo-500/60 bg-indigo-950/30 shadow-xl shadow-indigo-500/10' : 'border-neutral-700 bg-neutral-900'}`}>
                  {plan.badge && <Badge className="mb-4 bg-indigo-500 text-white">{plan.badge}</Badge>}
                  <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-neutral-400">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 mb-8">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-center text-neutral-300 text-sm">
                        <Zap className="w-4 h-4 text-indigo-400 mr-2 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className={`w-full h-12 text-base hover:-translate-y-0.5 active:scale-95 transition-all ${i === 1 ? 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25' : 'bg-neutral-700 hover:bg-neutral-600 hover:shadow-lg hover:shadow-neutral-600/20'}`}>
                    <Link href="/register">
                      {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection faqs={faqs} />

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-6 w-6 text-indigo-400" />
                <span className="text-xl font-bold">Digital Heroes</span>
              </div>
              <p className="text-neutral-400 text-sm">Play golf, win prizes, and change lives. Join the movement.</p>
            </div>
            {[
              { title: "Platform", links: [{ label: "How It Works", href: "/#how-it-works" }, { label: "Charities", href: "/charities" }, { label: "Pricing", href: "/#pricing" }] },
              { title: "Account", links: [{ label: "Sign Up", href: "/register" }, { label: "Login", href: "/login" }, { label: "Dashboard", href: "/dashboard" }] },
              { title: "Legal", links: [{ label: "Privacy Policy", href: "#" }, { label: "Terms of Service", href: "#" }, { label: "Cookie Policy", href: "#" }] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-sm uppercase tracking-wider text-neutral-400 mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(l => (
                    <li key={l.label}><Link href={l.href} className="text-neutral-300 hover:text-white text-sm transition-colors">{l.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-neutral-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-neutral-500 text-sm">© 2026 Digital Heroes. All rights reserved.</p>
            <div className="flex items-center gap-2 text-neutral-500 text-sm">
              <Shield className="h-4 w-4" /> Secured by Razorpay
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
