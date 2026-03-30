import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcryptjs from "bcryptjs"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { subscriptions: true }
        })

        if (!user || !(await bcryptjs.compare(credentials.password as string, user.passwordHash))) {
          throw new Error("Invalid credentials")
        }

        const activeSub = user.subscriptions.find(s => s.status === "ACTIVE")

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscription: activeSub ? { plan: activeSub.plan as string, status: activeSub.status as string } : null
        }
      }
    })
  ],
})
