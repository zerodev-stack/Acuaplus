'use client';

import { useParams } from 'next/navigation';
import { useOrder, useUpdateSellerOrder } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, getOrderStatusColor, getPaymentStatusColor } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id, 10);
  const { isSeller, user } = useAuth();
  const { data, isLoading } = useOrder(orderId);
  const updateSellerOrder = useUpdateSellerOrder();
  const [updating, setUpdating] = useState<number | null>(null);

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  const order = data?.data;
  if (!order) {
    return <div className="card py-12 text-center text-gray-500">Orden no encontrada</div>;
  }

  const handleStatusUpdate = async (sellerOrderId: number, status: string) => {
    setUpdating(sellerOrderId);
    try {
      await updateSellerOrder.mutateAsync({ id: sellerOrderId, status });
    } finally {
      setUpdating(null);
    }
  };

  const getNextStatuses = (currentStatus: string) => {
    const transitions: Record<string, { status: string; label: string; variant: 'primary' | 'danger' | 'secondary' }[]> = {
      pending: [
        { status: 'confirmed', label: 'Confirmar', variant: 'primary' },
        { status: 'cancelled', label: 'Cancelar', variant: 'danger' },
      ],
      confirmed: [
        { status: 'shipped', label: 'Marcar como enviado', variant: 'primary' },
        { status: 'cancelled', label: 'Cancelar', variant: 'danger' },
      ],
      shipped: [
        { status: 'delivered', label: 'Marcar como entregado', variant: 'primary' },
      ],
    };
    return transitions[currentStatus] || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/orders" className="hover:text-aqua-600">Órdenes</Link>
        <span>/</span>
        <span className="text-gray-900">Orden #{order.id}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="font-semibold mb-4">Detalle de la orden</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Estado:</span>{' '}
                <Badge className={getOrderStatusColor(order.status)}>{order.status}</Badge>
              </div>
              <div>
                <span className="text-gray-500">Pago:</span>{' '}
                <Badge className={getPaymentStatusColor(order.payment_status)}>{order.payment_status}</Badge>
              </div>
              <div>
                <span className="text-gray-500">Método de pago:</span>{' '}
                <span className="font-medium">{order.payment_method}</span>
              </div>
              <div>
                <span className="text-gray-500">Fecha:</span>{' '}
                <span className="font-medium">{formatDate(order.created_at)}</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-gray-500 text-sm">Dirección de envío:</span>
              <p className="mt-1 text-sm">{order.shipping_address}</p>
            </div>
            {order.notes && (
              <div className="mt-4">
                <span className="text-gray-500 text-sm">Notas:</span>
                <p className="mt-1 text-sm">{order.notes}</p>
              </div>
            )}
          </div>

          {order.seller_orders?.map((so) => (
            <div key={so.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">{so.business_name}</h3>
                  <p className="text-xs text-gray-500">Seller Order #{so.id}</p>
                </div>
                <Badge className={getOrderStatusColor(so.status)}>{so.status}</Badge>
              </div>

              {so.tracking_code && (
                <p className="text-sm mb-3">
                  <span className="text-gray-500">Código de seguimiento:</span>{' '}
                  <span className="font-mono">{so.tracking_code}</span>
                </p>
              )}

              <p className="text-lg font-bold text-aqua-600">{formatCurrency(so.subtotal)}</p>

              {isSeller && so.seller_user_id === user?.id && (
                <div className="mt-4 flex gap-2">
                  {getNextStatuses(so.status).map((action) => (
                    <Button
                      key={action.status}
                      variant={action.variant as any}
                      size="sm"
                      onClick={() => handleStatusUpdate(so.id, action.status)}
                      isLoading={updating === so.id}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="card h-fit space-y-4">
          <h2 className="font-semibold">Resumen</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatCurrency(order.subtotal_amount)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-aqua-600">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
