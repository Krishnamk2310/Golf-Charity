"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Trophy, CreditCard, Heart, History, Gift, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

const navItems = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "My Scores", href: "/dashboard/scores", icon: Trophy },
  { name: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
  { name: "My Charity", href: "/dashboard/charity", icon: Heart },
  { name: "Draw History", href: "/dashboard/draws", icon: History },
  { name: "My Winnings", href: "/dashboard/winnings", icon: Gift },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white dark:bg-neutral-900 border-r flex flex-col hidden md:flex min-h-screen sticky top-0">

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start ${isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}`}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => signOut()}>
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>



      {/* Mobile Nav Scroller */}
      <nav className="md:hidden flex overflow-x-auto p-2 bg-white dark:bg-neutral-900 border-b hide-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href} className="flex-shrink-0 mx-1">
              <Button
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={isActive ? "bg-primary/10 text-primary" : ""}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
