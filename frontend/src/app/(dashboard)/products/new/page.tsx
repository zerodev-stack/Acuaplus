'use client';

import { ProductForm } from '@/components/products/ProductForm';

export default function NewProductPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo producto</h1>
        <p className="text-sm text-gray-500">Completa los campos para publicar un nuevo producto</p>
      </div>
      <ProductForm />
    </div>
  );
}
