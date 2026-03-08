import type { Metadata, Viewport } from "next"
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
  description: "A personal growth platform for the woman who has everything — and still wants more.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Regulated",
  },
}

export const viewport: Viewport = {
  themeColor: "#1c1917",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
