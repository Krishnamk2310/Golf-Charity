import { auth } from "@/lib/auth"
import { PublicNav } from "@/components/home/PublicNav"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <div>
      <PublicNav session={session} />
      <div className="pt-16">{children}</div>
    </div>
  )
}
