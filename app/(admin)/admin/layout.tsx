"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, Users, Trophy, Heart, FileCheck, BarChart, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

const navItems = [
  { name: "Overview", href: "/admin", icon: Shield },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Draw Management", href: "/admin/draws", icon: Trophy },
  { name: "Charity Management", href: "/admin/charities", icon: Heart },
  { name: "Winner Verification", href: "/admin/verifications", icon: FileCheck },
  { name: "Reports", href: "/admin/reports", icon: BarChart },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col hidden md:flex min-h-screen sticky top-0">
        <div className="p-6 border-b border-slate-800">
          <Link href="/admin" className="text-xl font-bold flex items-center gap-2 text-white">
            <Shield className="h-6 w-6 text-indigo-400" />
            Admin Panel
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start hover:text-white hover:bg-slate-800 ${isActive ? "bg-slate-800 text-white font-semibold border-l-2 border-indigo-400 rounded-l-none" : ""}`}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30" onClick={() => signOut()}>
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Nav Top Bar */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-10 text-white">
        <Link href="/admin" className="text-xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-indigo-400" />
          Admin Panel
        </Link>
        <Button variant="ghost" size="icon" onClick={() => signOut()} className="text-red-400 hover:bg-red-950/30">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
