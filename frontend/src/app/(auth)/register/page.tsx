'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RegisterPage() {
  const { register, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'buyer';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: defaultRole,
    phone: '',
    business_name: '',
    nit: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(form);
      await login(form.email, form.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-aqua-600">AcuaPlus</h1>
          <p className="mt-2 text-gray-600">Crea tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Input
            id="name"
            label="Nombre completo"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />

          <Input
            id="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            required
          />

          <Input
            id="password"
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            required
            minLength={6}
          />

          <Input
            id="phone"
            label="Teléfono (opcional)"
            type="tel"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />

          <div>
            <label className="label">Tipo de cuenta</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  checked={form.role === 'buyer'}
                  onChange={(e) => updateField('role', e.target.value)}
                  className="text-aqua-600 focus:ring-aqua-500"
                />
                <span className="text-sm">Comprador</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="seller"
                  checked={form.role === 'seller'}
                  onChange={(e) => updateField('role', e.target.value)}
                  className="text-aqua-600 focus:ring-aqua-500"
                />
                <span className="text-sm">Vendedor</span>
              </label>
            </div>
          </div>

          {form.role === 'seller' && (
            <>
              <Input
                id="business_name"
                label="Nombre del negocio"
                value={form.business_name}
                onChange={(e) => updateField('business_name', e.target.value)}
                required
              />
              <Input
                id="nit"
                label="NIT (opcional)"
                value={form.nit}
                onChange={(e) => updateField('nit', e.target.value)}
              />
              <p className="text-xs text-yellow-600">
                Los vendedores requieren aprobación del administrador antes de publicar productos.
              </p>
            </>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Crear cuenta
          </Button>

          <p className="text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-medium text-aqua-600 hover:text-aqua-700">
              Iniciar sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
