import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Cormorant_Garamond } from "next/font/google"
import "./globals.css"
import SessionProvider from "@/components/SessionProvider"
import Navbar from "@/components/Navbar"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Regulated",
  description: "Your personal growth platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${cormorant.variable} font-sans antialiased`}>
        <SessionProvider>
          <Navbar />
          <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
        </SessionProvider>
      </body>
    </html>
  )
}
