'use client';

import { useState } from 'react';
import { useCards, useSaveCard } from '@/hooks/usePayments';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { CreditCard, Plus, Trash2 } from 'lucide-react';

export default function PaymentsPage() {
  const { isBuyer } = useAuth();
  const { data, isLoading } = useCards();
  const saveCard = useSaveCard();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    pan: '',
    cvv: '',
    cardholder_name: '',
    exp_month: '',
    exp_year: '',
    is_default: false,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const cards = data?.data || [];

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await saveCard.mutateAsync({
        pan: form.pan,
        cvv: form.cvv,
        cardholder_name: form.cardholder_name,
        exp_month: parseInt(form.exp_month, 10),
        exp_year: parseInt(form.exp_year, 10),
        is_default: form.is_default,
      });
      setShowAdd(false);
      setForm({ pan: '', cvv: '', cardholder_name: '', exp_month: '', exp_year: '', is_default: false });
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Error al guardar tarjeta');
    } finally {
      setSaving(false);
    }
  };

  const brandColors: Record<string, string> = {
    visa: 'bg-blue-100 text-blue-700',
    mastercard: 'bg-orange-100 text-orange-700',
    amex: 'bg-purple-100 text-purple-700',
    diners: 'bg-green-100 text-green-700',
    other: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis tarjetas</h1>
        {isBuyer && (
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar tarjeta
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : cards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.id} className="card space-y-3">
              <div className="flex items-center justify-between">
                <CreditCard className="h-6 w-6 text-gray-400" />
                {card.is_default ? (
                  <span className="text-xs font-medium text-aqua-600">Principal</span>
                ) : null}
              </div>
              <p className="text-lg font-mono">**** {card.last_four}</p>
              <div className="flex items-center justify-between text-sm">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${brandColors[card.brand] || brandColors.other}`}>
                  {card.brand.toUpperCase()}
                </span>
                <span className="text-gray-500">{card.cardholder_name}</span>
              </div>
              <p className="text-xs text-gray-400">Exp: {String(card.exp_month).padStart(2, '0')}/{card.exp_year}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card py-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">No tienes tarjetas guardadas</p>
          {isBuyer && (
            <Button onClick={() => setShowAdd(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Agregar tarjeta
            </Button>
          )}
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Agregar tarjeta">
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <Input
            id="pan"
            label="Número de tarjeta"
            value={form.pan}
            onChange={(e) => updateField('pan', e.target.value)}
            placeholder="4111111111111111"
            required
            maxLength={19}
          />

          <Input
            id="cardholder_name"
            label="Nombre del titular"
            value={form.cardholder_name}
            onChange={(e) => updateField('cardholder_name', e.target.value)}
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              id="exp_month"
              label="Mes"
              value={form.exp_month}
              onChange={(e) => updateField('exp_month', e.target.value)}
              placeholder="MM"
              required
              maxLength={2}
            />
            <Input
              id="exp_year"
              label="Año"
              value={form.exp_year}
              onChange={(e) => updateField('exp_year', e.target.value)}
              placeholder="AAAA"
              required
              maxLength={4}
            />
            <Input
              id="cvv"
              label="CVV"
              type="password"
              value={form.cvv}
              onChange={(e) => updateField('cvv', e.target.value)}
              placeholder="123"
              required
              maxLength={4}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => updateField('is_default', e.target.checked)}
              className="text-aqua-600 focus:ring-aqua-500 rounded"
            />
            <span className="text-sm text-gray-700">Establecer como tarjeta principal</span>
          </label>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Cancelar</Button>
            <Button type="submit" isLoading={saving}>Guardar tarjeta</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
