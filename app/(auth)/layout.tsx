import Link from "next/link"
import { Trophy } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit font-bold text-xl text-neutral-900 dark:text-white">
          <Trophy className="h-6 w-6 text-indigo-500" />
          Digital Heroes
        </Link>
      </header>
      {children}
    </div>
  )
}
