import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { sql } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Namn och lösenord',
      credentials: {
        name: { label: 'Namn', type: 'text' },
        password: { label: 'Lösenord', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.password) return null

        const normalizedName = credentials.name.trim().toLowerCase().replace(/\s+/g, '')
        const [user] = await sql`
          SELECT id, name, password_hash, display_name
          FROM users
          WHERE name = ${normalizedName}
        `

        const row = user as { id: string; name: string; password_hash: string; display_name: string } | undefined
        if (!row || !(await bcrypt.compare(credentials.password, row.password_hash))) {
          return null
        }

        return {
          id: row.id,
          name: row.display_name,
          email: `${row.name}@frontra.internal`,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}
