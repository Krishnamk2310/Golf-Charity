"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Check, AlertCircle, Zap, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

declare global {
  interface Window {
    Razorpay: any
  }
}

const PLANS = [
  {
    id: "MONTHLY" as const,
    name: "Monthly",
    price: "₹799",
    period: "/month",
    amount: 79900,
    description: "Flexible commitment, cancel anytime",
    icon: Zap,
    features: [
      "1 draw entry per month",
      "Support your chosen charity",
      "Log up to 5 scores",
      "Cancel anytime",
    ],
    highlight: false,
  },
  {
    id: "YEARLY" as const,
    name: "Yearly",
    price: "₹7,999",
    period: "/year",
    amount: 799900,
    description: "Maximum impact, save 16%",
    icon: Crown,
    features: [
      "12 draw entries per year",
      "Highest charity impact",
      "Early result notifications",
      "Priority verification queue",
    ],
    highlight: true,
    badge: "Save 16%",
  },
]

export default function SubscribePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, update } = useSession()

  const [loading, setLoading] = useState<string | null>(null)
  const paymentMode = process.env.NEXT_PUBLIC_PAYMENT_MODE || "mock"

  const handleSubscribe = async (plan: "MONTHLY" | "YEARLY") => {
    setLoading(plan)

    try {
      if (paymentMode === "razorpay") {
        const orderRes = await fetch("/api/subscriptions/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        })
        const orderData = await orderRes.json()
        if (!orderRes.ok) throw new Error(orderData.error)

        await loadRazorpay()

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Digital Heroes",
          description: `${plan} Subscription`,
          order_id: orderData.orderId,
          handler: async (response: any) => {
            const verifyRes = await fetch("/api/subscriptions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                plan,
                mode: "razorpay",
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            const verifyData = await verifyRes.json()
            if (!verifyRes.ok) throw new Error(verifyData.error)

            await update({ subscription: { status: "ACTIVE", plan } })
            toast({ title: "Subscription activated! 🎉", description: "Welcome to Digital Heroes." })
            router.push("/onboarding")
          },
          prefill: {
            email: session?.user?.email || "",
            name: session?.user?.name || "",
          },
          theme: { color: "#6366f1" },
          modal: {
            ondismiss: () => setLoading(null),
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
        setLoading(null)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const res = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, mode: "mock" }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        await update({ subscription: { status: "ACTIVE", plan } })
        toast({ title: "Subscription activated! 🎉" })
        router.push("/onboarding")
      }
    } catch (error: any) {
      toast({ title: "Payment Failed", description: error.message, variant: "destructive" })
      setLoading(null)
    }
  }

  const loadRazorpay = () =>
    new Promise<void>((resolve, reject) => {
      if (window.Razorpay) return resolve()
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Razorpay SDK failed to load"))
      document.body.appendChild(script)
    })

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-indigo-950/20 to-neutral-950 py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {paymentMode === "mock" && (
        <div className="w-full max-w-4xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 p-4 mb-8 flex items-center justify-center rounded-xl">
          <AlertCircle className="w-5 h-5 mr-3" />
          <span className="font-medium">Demo Mode — Payments are fully simulated. No real charges will be made.</span>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
        <p className="text-indigo-400 font-semibold tracking-widest uppercase text-sm mb-4">Choose Your Plan</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Play, Win, and Give Back
        </h1>
        <p className="mt-4 text-xl text-neutral-400 max-w-2xl mx-auto">
          Your subscription funds prize pools and channels real money to the charities you care about.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {PLANS.map((plan, i) => {
          const Icon = plan.icon
          const isLoading = loading === plan.id
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
            >
              <Card
                className={`h-full flex flex-col relative overflow-hidden transition-all duration-300 ${
                  plan.highlight
                    ? "border-indigo-500/60 shadow-2xl shadow-indigo-500/20 bg-gradient-to-b from-indigo-950/50 to-neutral-900"
                    : "border-neutral-700/50 bg-neutral-900 hover:border-neutral-600"
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-4 right-4 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${plan.highlight ? "bg-indigo-500/20" : "bg-neutral-800"}`}>
                      <Icon className={`h-5 w-5 ${plan.highlight ? "text-indigo-400" : "text-neutral-400"}`} />
                    </div>
                    <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-neutral-400 text-base">{plan.period}</span>
                  </div>
                  <CardDescription className="text-neutral-400 mt-1">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-grow pt-4">
                  <ul className="space-y-3">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-center text-sm text-neutral-300">
                        <Check className="w-4 h-4 text-emerald-400 mr-3 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4 border-t border-neutral-800">
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={!!loading}
                    className={`w-full h-12 text-base font-semibold transition-all ${
                      plan.highlight
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                        : "bg-neutral-700 hover:bg-neutral-600 text-white"
                    }`}
                  >
                    {isLoading ? "Processing..." : `Get ${plan.name}`}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <p className="mt-10 text-neutral-500 text-sm text-center">
        Powered by Razorpay. Cancel anytime from your dashboard.
      </p>
    </div>
  )
}
