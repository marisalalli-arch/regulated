import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const protectedPaths = ["/coach", "/goals", "/habits", "/journal"]
      const isProtected = protectedPaths.some((p) =>
        nextUrl.pathname.startsWith(p)
      )
      if (isProtected) return isLoggedIn
      return true
    },
  },
  providers: [],
}
