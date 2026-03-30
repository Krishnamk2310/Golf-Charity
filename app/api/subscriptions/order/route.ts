import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

const PLAN_AMOUNTS: Record<string, number> = {
  MONTHLY: 79900,
  YEARLY: 799900,
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { plan } = await req.json()
    const amount = PLAN_AMOUNTS[plan]

    if (!amount) return NextResponse.json({ error: "Invalid plan" }, { status: 400 })

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { userId: session.user.id, plan }
    })

    return NextResponse.json({ orderId: order.id, amount, currency: "INR" })
  } catch (error) {
    console.error("Razorpay order error:", error)
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
  }
}
