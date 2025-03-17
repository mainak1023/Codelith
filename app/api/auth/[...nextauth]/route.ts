import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { kv } from "@vercel/kv"

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async signIn({ user }) {
      if (!user.email) return false

      try {
        // Check if user exists in our database
        const existingUser = await kv.get(`user:${user.id}`)

        if (!existingUser) {
          // Create new user
          const newUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            createdAt: Date.now(),
          }

          await kv.set(`user:${user.id}`, newUser)
          await kv.set(`user:email:${user.email}`, user.id)
        }

        return true
      } catch (error) {
        console.error("Error during sign in:", error)
        return false
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
})

export { handler as GET, handler as POST }

