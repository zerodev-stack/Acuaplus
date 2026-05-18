'use client';

import { useCart, useUpdateCartItem, useRemoveCartItem } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Trash2, ArrowLeft, Plus, Minus } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { isBuyer } = useAuth();
  const { data, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  const cart = data?.data;
  const items = cart?.items || [];

  const total = items.reduce((sum, item) => sum + item.unit_price_snapshot * item.quantity, 0);

  const handleQuantity = async (itemId: number, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      await removeItem.mutateAsync(itemId);
    } else {
      await updateItem.mutateAsync({ id: itemId, quantity: newQty });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Carrito de compras</h1>

      {items.length === 0 ? (
        <div className="card py-12 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">Tu carrito está vacío</p>
          <Link href="/products" className="btn-primary mt-4 inline-flex">
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product_id}`} className="font-medium text-gray-900 hover:text-aqua-600 truncate block">
                    {item.name}
                  </Link>
                  <p className="text-sm text-gray-500">{formatCurrency(item.unit_price_snapshot)} c/u</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantity(item.id, item.quantity, -1)}
                    className="rounded-lg border p-1.5 text-gray-600 hover:bg-gray-100"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantity(item.id, item.quantity, 1)}
                    disabled={item.quantity >= item.stock}
                    className="rounded-lg border p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <p className="w-24 text-right font-medium">
                  {formatCurrency(item.unit_price_snapshot * item.quantity)}
                </p>

                <button
                  onClick={() => removeItem.mutateAsync(item.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="card h-fit space-y-4">
            <h2 className="font-semibold">Resumen</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Items</span>
                <span>{items.length}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-aqua-600">{formatCurrency(total)}</span>
              </div>
            </div>

            {isBuyer && items.length > 0 && (
              <Link href="/checkout" className="btn-primary w-full justify-center">
                Proceder al pago
              </Link>
            )}

            <Link href="/products" className="btn-secondary w-full justify-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Seguir comprando
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
