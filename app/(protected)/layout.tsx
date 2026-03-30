import Link from "next/link"
import { Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth, signOut } from "@/lib/auth"

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="sticky top-0 z-50 border-b bg-white/70 dark:bg-neutral-950/70 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-neutral-900 dark:text-white">
          <Trophy className="h-6 w-6 text-indigo-500" />
          Digital Heroes
        </Link>
        {session && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500 hidden sm:block">{session.user.email}</span>
            <form action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}>
              <Button variant="outline" size="sm" type="submit">Sign Out</Button>
            </form>
          </div>
        )}
      </header>
      {children}
    </div>
  )
}
