"use client"

import Link from "next/link"
import { Trophy, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function PublicNav({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/70 backdrop-blur-xl border-b border-neutral-800 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl active:scale-95 transition-transform">
            <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 300 }}>
              <Trophy className="h-6 w-6 text-indigo-400" />
            </motion.div>
            Digital Heroes
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
            <Link href="/charities" className="hover:text-indigo-400 transition-all hover:-translate-y-0.5 relative group">
              Charities
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/#how-it-works" className="hover:text-indigo-400 transition-all hover:-translate-y-0.5 relative group">
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/#pricing" className="hover:text-indigo-400 transition-all hover:-translate-y-0.5 relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            {session ? (
              <Link href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"}>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all">
                  {session.user.role === "ADMIN" ? "Admin Panel" : "Dashboard"}
                </Button>
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-neutral-300 hover:text-white hover:bg-neutral-800 active:scale-95 transition-all">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-indigo-600 border border-indigo-500 hover:bg-indigo-500 hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] active:scale-95 transition-all duration-300">Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-neutral-800 active:scale-90 transition-all">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-neutral-900 border-neutral-800 text-white shadow-2xl">
                  <DropdownMenuItem asChild className="focus:bg-neutral-800 focus:text-indigo-400 cursor-pointer">
                    <Link href="/charities">Charities</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-neutral-800 focus:text-indigo-400 cursor-pointer">
                    <Link href="/#how-it-works">How It Works</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-neutral-800 focus:text-indigo-400 cursor-pointer">
                    <Link href="/#pricing">Pricing</Link>
                  </DropdownMenuItem>
                  {!session && (
                    <>
                      <div className="h-px bg-neutral-800 my-1" />
                      <DropdownMenuItem asChild className="focus:bg-neutral-800 cursor-pointer">
                        <Link href="/login">Login</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="focus:bg-indigo-600 focus:text-white cursor-pointer font-bold text-indigo-400">
                        <Link href="/register">Get Started</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
