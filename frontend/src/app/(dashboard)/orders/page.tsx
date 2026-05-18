'use client';

import { useState } from 'react';
import { useOrders, useSellerOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDateShort, getOrderStatusColor } from '@/lib/utils';
import { Package } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const { isSeller } = useAuth();
  const [page, setPage] = useState(1);

  if (isSeller) {
    return <SellerOrdersView page={page} onPageChange={setPage} />;
  }

  return <BuyerOrdersView page={page} onPageChange={setPage} />;
}

function BuyerOrdersView({ page, onPageChange }: { page: number; onPageChange: (p: number) => void }) {
  const { data, isLoading } = useOrders({ page: String(page), limit: '10' });

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mis órdenes</h1>

      {data && data.data.length > 0 ? (
        <>
          <div className="space-y-4">
            {data.data.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="card block hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Orden #{order.id}</p>
                    <p className="text-sm text-gray-500">{formatDateShort(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getOrderStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <p className="font-bold text-aqua-600">{formatCurrency(order.total_amount)}</p>
                  </div>
                </div>
                {order.seller_orders && order.seller_orders.length > 0 && (
                  <div className="mt-3 border-t pt-3 text-xs text-gray-500">
                    {order.seller_orders.map((so) => (
                      <span key={so.id} className="mr-3">{so.business_name} - {so.status}</span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={onPageChange} />
        </>
      ) : (
        <div className="card py-12 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">No tienes órdenes aún</p>
          <Link href="/products" className="btn-primary mt-4 inline-flex">Explorar productos</Link>
        </div>
      )}
    </div>
  );
}

function SellerOrdersView({ page, onPageChange }: { page: number; onPageChange: (p: number) => void }) {
  const [statusFilter, setStatusFilter] = useState('');
  const params: Record<string, string> = { page: String(page), limit: '10' };
  if (statusFilter) params.status = statusFilter;
  const { data, isLoading } = useSellerOrders(params);

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Órdenes recibidas</h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); onPageChange(1); }}
          className="input-field w-44"
        >
          <option value="">Todas</option>
          <option value="pending">Pendientes</option>
          <option value="confirmed">Confirmadas</option>
          <option value="shipped">Enviadas</option>
          <option value="delivered">Entregadas</option>
          <option value="cancelled">Canceladas</option>
        </select>
      </div>

      {data && data.data.length > 0 ? (
        <>
          <div className="space-y-4">
            {data.data.map((so: any) => (
              <div key={so.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Seller Order #{so.id}</p>
                    <p className="text-sm text-gray-500">Orden #{so.order_id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getOrderStatusColor(so.status)}>{so.status}</Badge>
                    <p className="font-bold">{formatCurrency(so.subtotal)}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link href={`/orders/${so.order_id}`} className="text-sm text-aqua-600 hover:underline">Ver detalle</Link>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={onPageChange} />
        </>
      ) : (
        <div className="card py-12 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">No tienes órdenes recibidas</p>
        </div>
      )}
    </div>
  );
}
