'use client';

import { useParams } from 'next/navigation';
import { useProduct } from '@/hooks/useProducts';
import { ProductForm } from '@/components/products/ProductForm';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const productId = parseInt(id, 10);
  const { user } = useAuth();
  const { data, isLoading } = useProduct(productId);

  useEffect(() => {
    if (data?.data && user && data.data.seller_user_id !== user.id) {
      router.push(`/products/${productId}`);
    }
  }, [data, user, productId, router]);

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (!data?.data) {
    return <div className="card py-12 text-center text-gray-500">Producto no encontrado</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar producto</h1>
        <p className="text-sm text-gray-500">{data.data.name}</p>
      </div>
      <ProductForm initialData={data.data} productId={productId} />
    </div>
  );
}
