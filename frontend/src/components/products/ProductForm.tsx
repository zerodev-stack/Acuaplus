'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCategories, useCreateProduct } from '@/hooks/useProducts';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface ProductFormProps {
  initialData?: any;
  productId?: number;
}

export function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const { data: catData } = useCategories();
  const createProduct = useCreateProduct();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    stock: initialData?.stock || '',
    category_id: initialData?.category_id || '',
    sku: initialData?.sku || '',
    unit: initialData?.unit || '',
    weight_kg: initialData?.weight_kg || '',
    min_order_qty: initialData?.min_order_qty || 1,
    status: initialData?.status || 'draft',
  });

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(String(form.stock), 10),
        category_id: parseInt(String(form.category_id), 10),
        min_order_qty: parseInt(String(form.min_order_qty), 10),
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
      };

      await createProduct.mutateAsync(payload);
      router.push('/products');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = catData?.data || [];

  const flattenCategories = (cats: any[], prefix = ''): { value: string; label: string }[] => {
    const result: { value: string; label: string }[] = [];
    for (const cat of cats) {
      result.push({ value: String(cat.id), label: `${prefix}${cat.name}` });
      if (cat.children?.length) {
        result.push(...flattenCategories(cat.children, `${prefix}${cat.name} / `));
      }
    }
    return result;
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <Input
        id="name"
        label="Nombre del producto"
        value={form.name}
        onChange={(e) => updateField('name', e.target.value)}
        required
      />

      <div>
        <label htmlFor="description" className="label">Descripción</label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={4}
          className="input-field resize-y"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="price"
          label="Precio"
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          onChange={(e) => updateField('price', e.target.value)}
          required
        />
        <Input
          id="stock"
          label="Stock"
          type="number"
          min="0"
          value={form.stock}
          onChange={(e) => updateField('stock', e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          id="category_id"
          label="Categoría"
          options={flattenCategories(categories)}
          value={form.category_id}
          onChange={(e) => updateField('category_id', e.target.value)}
          placeholder="Seleccionar categoría"
          required
        />
        <Input
          id="unit"
          label="Unidad (kg, lb, unid)"
          value={form.unit}
          onChange={(e) => updateField('unit', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="sku"
          label="SKU (opcional)"
          value={form.sku}
          onChange={(e) => updateField('sku', e.target.value)}
        />
        <Input
          id="weight_kg"
          label="Peso kg (opcional)"
          type="number"
          step="0.001"
          min="0"
          value={form.weight_kg}
          onChange={(e) => updateField('weight_kg', e.target.value)}
        />
      </div>

      <Input
        id="min_order_qty"
        label="Cantidad mínima de pedido"
        type="number"
        min="1"
        value={form.min_order_qty}
        onChange={(e) => updateField('min_order_qty', e.target.value)}
      />

      <Select
        id="status"
        label="Estado"
        options={[
          { value: 'draft', label: 'Borrador' },
          { value: 'active', label: 'Activo' },
        ]}
        value={form.status}
        onChange={(e) => updateField('status', e.target.value)}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {productId ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  );
}
