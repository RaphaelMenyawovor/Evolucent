import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/src/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      // `user` is only present on the initial sign-in event
      if (user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, phoneNumber: true, kycStatus: true },
        })
        token.id = dbUser?.id ?? user.id
        token.phoneNumber = dbUser?.phoneNumber ?? null
        token.kycStatus = dbUser?.kycStatus ?? "UNVERIFIED"
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.phoneNumber = token.phoneNumber as string | null
      session.user.kycStatus = token.kycStatus as string
      return session
    },
  },
})
