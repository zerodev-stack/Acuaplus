'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * HomePage - Componente principal de la landing page.
 * Utiliza next-auth para verificar si el usuario ya tiene sesión iniciada.
 * Si es así, lo redirige automáticamente al dashboard.
 */
export default function HomePage() {
  const { data: session, status } = useSession(); // Hook de NextAuth para obtener estado de sesión
  const router = useRouter(); // Hook de Next.js para navegación programática

  useEffect(() => {
    // Si el estado es autenticado, redirigir al área privada
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-aqua-600">AcuaPlus</h1>
          <div className="flex items-center gap-4">
            <Link href="/login" className="btn-secondary">
              Iniciar sesión
            </Link>
            <Link href="/register" className="btn-primary">
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-br from-aqua-50 to-blue-50 py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Plataforma de Comercio Acuícola
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Conectamos productores acuícolas con compradores. Compra y vende productos del mar
              de forma segura y eficiente.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/register?role=buyer" className="btn-primary text-base px-6 py-3">
                Comprar ahora
              </Link>
              <Link href="/register?role=seller" className="btn-secondary text-base px-6 py-3">
                Vender productos
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="card text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-aqua-100">
                  <svg className="h-6 w-6 text-aqua-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Rápido</h3>
                <p className="mt-2 text-sm text-gray-600">Compra y venta de productos acuícolas en tiempo real</p>
              </div>
              <div className="card text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-aqua-100">
                  <svg className="h-6 w-6 text-aqua-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Seguro</h3>
                <p className="mt-2 text-sm text-gray-600">Pagos simulados y trazabilidad de órdenes</p>
              </div>
              <div className="card text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-aqua-100">
                  <svg className="h-6 w-6 text-aqua-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Confiable</h3>
                <p className="mt-2 text-sm text-gray-600">Vendedores verificados y sistema de calificaciones</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} AcuaPlus. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
