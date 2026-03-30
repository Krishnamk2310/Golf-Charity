import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SubscriptionPlan } from "@prisma/client"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ subscription })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { plan, mode, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json()

    if (plan !== "MONTHLY" && plan !== "YEARLY") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const now = new Date()
    const currentPeriodEnd = new Date(now)
    if (plan === "MONTHLY") {
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30)
    } else {
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 365)
    }

    if (mode === "mock") {
      const isSuccess = Math.random() > 0.1
      if (!isSuccess) {
        return NextResponse.json({ error: "Payment declined by issuing bank (Simulated Error)" }, { status: 400 })
      }
    } else if (mode === "razorpay") {
      const crypto = await import("crypto")
      const body = razorpay_order_id + "|" + razorpay_payment_id
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body)
        .digest("hex")

      if (expectedSignature !== razorpay_signature) {
        return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
      }
    }

    const existingSub = await prisma.subscription.findFirst({
      where: { userId: session.user.id }
    })

    let subscription
    if (existingSub) {
      subscription = await prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          plan: plan as SubscriptionPlan,
          status: "ACTIVE",
          currentPeriodEnd,
          razorpayCustomerId: razorpay_payment_id || null
        }
      })
    } else {
      subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          plan: plan as SubscriptionPlan,
          status: "ACTIVE",
          currentPeriodEnd,
          razorpayCustomerId: razorpay_payment_id || null
        }
      })
    }

    return NextResponse.json({ success: true, subscription })
  } catch (error) {
    console.error("Subscription Error: ", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
