import type { NextAuthConfig } from "next-auth"
import type { UserRole, SubscriptionStatus, SubscriptionPlan } from "@prisma/client"

export const authConfig = {
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role as UserRole
        token.subscription = (user as any).subscription
      }
      if (trigger === "update" && session) {
        token.subscription = session.subscription
        token.role = session.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        if (session.user) {
          session.user.id = token.id as string
          session.user.role = token.role as UserRole
          session.user.subscription = token.subscription as { plan: SubscriptionPlan, status: SubscriptionStatus } | null
        }
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig
