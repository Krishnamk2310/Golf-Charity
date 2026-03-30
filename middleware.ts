import NextAuth from "next-auth"
import { authConfig } from "./lib/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const user = req.auth?.user
  
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/register"
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard")
  const isAdminRoute = nextUrl.pathname.startsWith("/admin")
  const isSubscribeRoute = nextUrl.pathname.startsWith("/subscribe")

  if (isApiAuthRoute) return null

  if (isAuthRoute) {
    if (isLoggedIn) {
      if (user?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", nextUrl))
      }
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
    return null
  }

  if (!isLoggedIn && (isDashboardRoute || isAdminRoute || isSubscribeRoute)) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  if (isAdminRoute) {
    if (user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
    return null
  }

  if (isDashboardRoute) {
    if (!user?.subscription || user.subscription.status !== "ACTIVE") {
      return NextResponse.redirect(new URL("/subscribe", nextUrl))
    }
    return null
  }

  return null
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
