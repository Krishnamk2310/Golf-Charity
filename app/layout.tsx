import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import Providers from "@/components/Providers"

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
})

export const metadata: Metadata = {
  title: "Digital Heroes — Golf, Prizes & Charity",
  description: "Subscribe, log your golf scores, enter monthly prize draws, and support life-changing charities — all in one platform.",
  keywords: ["golf", "charity", "prize draw", "subscription", "stableford"],
  openGraph: {
    title: "Digital Heroes — Golf, Prizes & Charity",
    description: "Where Golf Meets Generosity. Win prizes and fund dreams.",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
