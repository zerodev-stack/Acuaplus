'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { update } = useSession();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: (user as any)?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.patch('/users/me', form);
      setMessage('Perfil actualizado exitosamente');
      await update();
    } catch {
      setMessage('Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Configuración</h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="font-semibold">Mi perfil</h2>

        {message && (
          <div className={`rounded-lg p-3 text-sm ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <Input
          id="name"
          label="Nombre"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />

        <Input
          id="phone"
          label="Teléfono"
          value={form.phone}
          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
        />

        <div>
          <label className="label">Email</label>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        <div>
          <label className="label">Rol</label>
          <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" isLoading={saving}>Guardar cambios</Button>
        </div>
      </form>
    </div>
  );
}
