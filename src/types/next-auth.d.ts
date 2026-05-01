import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    name?: string | null
    email?: string | null
    avatar?: string | null
  }

  interface Session {
    user: {
      id: string
      avatar?: string | null
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    name?: string | null
    email?: string | null
    avatar?: string | null
  }
}
