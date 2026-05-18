'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return {
    user: session?.user ?? null,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isAdmin: session?.user?.role === 'admin',
    isSeller: session?.user?.role === 'seller',
    isBuyer: session?.user?.role === 'buyer',
    login: async (email: string, password: string) => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.ok) {
        router.push('/dashboard');
      }
      return result;
    },
    logout: async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        });
      } catch {}
      await signOut({ callbackUrl: '/' });
    },
    register: async (data: Record<string, unknown>) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Error al registrarse');
      }
      return res.json();
    },
  };
}
