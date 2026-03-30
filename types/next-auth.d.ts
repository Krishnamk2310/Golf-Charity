import { UserRole, SubscriptionPlan, SubscriptionStatus } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      subscription: { plan: string; status: string } | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: UserRole
    subscription: { plan: string; status: string } | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    subscription: { plan: string; status: string } | null
  }
}
