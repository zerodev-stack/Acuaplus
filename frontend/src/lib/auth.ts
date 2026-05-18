import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
      status: string;
    };
  }

  interface User {
    id: string;
    accessToken: string;
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
      status: string;
      avatar_url: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
      status: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            },
            { withCredentials: true }
          );

          return {
            id: String(data.data.user.id),
            accessToken: data.data.accessToken,
            user: data.data.user,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.user = user.user;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user = token.user;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
