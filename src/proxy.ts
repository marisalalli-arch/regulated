import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  matcher: [
    "/coach/:path*",
    "/goals/:path*",
    "/habits/:path*",
    "/journal/:path*",
    "/profile/:path*",
  ],
}
