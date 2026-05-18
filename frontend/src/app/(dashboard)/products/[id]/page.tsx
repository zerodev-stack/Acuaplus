'use client';

import { useParams, useRouter } from 'next/navigation';
import { useProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useAddCartItem } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Star, ShoppingCart, Pencil, Trash2, Package } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const productId = parseInt(id, 10);
  const { user, isSeller } = useAuth();
  const { data, isLoading } = useProduct(productId);
  const deleteProduct = useDeleteProduct();
  const addItem = useAddCartItem();
  const [quantity, setQuantity] = useState(1);
  const [showDelete, setShowDelete] = useState(false);
  const [adding, setAdding] = useState(false);

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  const product = data?.data;
  if (!product) {
    return <div className="card py-12 text-center text-gray-500">Producto no encontrado</div>;
  }

  const isOwner = isSeller && product.seller_user_id === user?.id;

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addItem.mutateAsync({ product_id: productId, quantity });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    await deleteProduct.mutateAsync(productId);
    router.push('/products');
  };

  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
  const otherImages = product.images?.filter((img) => img.id !== primaryImage?.id) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/products" className="hover:text-aqua-600">Productos</Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
            {primaryImage?.image_url ? (
              <img src={primaryImage.image_url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                <Package className="h-20 w-20" />
              </div>
            )}
          </div>
          {otherImages.length > 0 && (
            <div className="flex gap-3 overflow-x-auto">
              {otherImages.map((img) => (
                <div key={img.id} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {img.image_url && <img src={img.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                <p className="mt-1 text-sm text-gray-500">por {product.seller_name}</p>
              </div>
              <Badge variant={product.status === 'active' ? 'success' : 'warning'}>
                {product.status}
              </Badge>
            </div>

            {product.rating_count > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= Math.round(product.rating_avg) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.rating_avg.toFixed(1)} ({product.rating_count} reseñas)
                </span>
              </div>
            )}
          </div>

          <p className="text-3xl font-bold text-aqua-600">{formatCurrency(product.price)}</p>

          <div className="flex items-center gap-4">
            <Badge>Stock: {product.stock} {product.unit || 'unid'}</Badge>
            {product.min_order_qty > 1 && (
              <span className="text-xs text-gray-500">Mín: {product.min_order_qty} {product.unit || 'unid'}</span>
            )}
          </div>

          {product.description && (
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          )}

          {product.specs && product.specs.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Especificaciones</h3>
              <div className="grid grid-cols-2 gap-2">
                {product.specs.map((spec) => (
                  <div key={spec.id} className="text-sm">
                    <span className="text-gray-500">{spec.spec_key}:</span>{' '}
                    <span className="font-medium">{spec.spec_value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.weight_kg && (
            <p className="text-sm text-gray-500">Peso: {product.weight_kg} kg</p>
          )}

          {!isOwner && product.status === 'active' && product.stock > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-lg border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <Button onClick={handleAddToCart} isLoading={adding}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Agregar al carrito
              </Button>
            </div>
          )}

          {isOwner && (
            <div className="flex gap-3">
              <Link href={`/products/${product.id}/edit`}>
                <Button variant="secondary">
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </Link>
              <Button variant="danger" onClick={() => setShowDelete(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </div>
          )}

          <p className="text-xs text-gray-400">Creado: {formatDate(product.created_at)}</p>
        </div>
      </div>

      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Eliminar producto">
        <p className="text-gray-600">¿Estás seguro de eliminar este producto?</p>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}
