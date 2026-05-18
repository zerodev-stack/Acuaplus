'use client';

import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { Package, ShoppingBag, Users, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isSeller, isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user?.name}
        </h2>
        <p className="mt-1 text-gray-500">
          {isSeller
            ? 'Gestiona tus productos y órdenes recibidas.'
            : isAdmin
            ? 'Administra la plataforma.'
            : 'Explora y compra productos acuícolas.'}
        </p>
      </div>

      {isSeller && <SellerDashboard />}
      {isAdmin && <AdminDashboard />}
      {!isSeller && !isAdmin && <BuyerDashboard />}
    </div>
  );
}

function SellerDashboard() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <Link href="/products" className="card hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Mis productos</p>
            <p className="text-2xl font-bold">Gestionar</p>
          </div>
        </div>
      </Link>

      <Link href="/orders" className="card hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
            <Package className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Órdenes recibidas</p>
            <p className="text-2xl font-bold">Ver</p>
          </div>
        </div>
      </Link>

      <Link href="/products/new" className="card hover:shadow-md transition-shadow border-dashed border-2 border-aqua-200">
        <div className="flex items-center justify-center py-4">
          <p className="font-medium text-aqua-600">+ Publicar nuevo producto</p>
        </div>
      </Link>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Link href="/admin/sellers" className="card hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Vendedores pendientes</p>
            <p className="text-lg font-semibold">Aprobar / Suspender</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

function BuyerDashboard() {
  const { data: productsData } = useProducts({ limit: '4', sort: 'newest' });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/products" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-aqua-100">
              <ShoppingBag className="h-6 w-6 text-aqua-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Productos</p>
              <p className="text-lg font-semibold">Explorar</p>
            </div>
          </div>
        </Link>

        <Link href="/cart" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <ShoppingBag className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Carrito</p>
              <p className="text-lg font-semibold">Ver</p>
            </div>
          </div>
        </Link>

        <Link href="/orders" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Órdenes</p>
              <p className="text-lg font-semibold">Mis compras</p>
            </div>
          </div>
        </Link>

        <Link href="/payments" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pagos</p>
              <p className="text-lg font-semibold">Tarjetas</p>
            </div>
          </div>
        </Link>
      </div>

      {productsData && productsData.data.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">Productos recientes</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productsData.data.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="card hover:shadow-md transition-shadow">
                <div className="aspect-square w-full rounded-lg bg-gray-100 mb-3 flex items-center justify-center text-gray-400">
                  {product.primary_image?.image_url ? (
                    <img src={product.primary_image.image_url} alt={product.name} className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    <ShoppingBag className="h-8 w-8" />
                  )}
                </div>
                <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                <p className="mt-1 text-sm text-gray-500 truncate">{product.seller_name}</p>
                <p className="mt-2 text-lg font-bold text-aqua-600">{formatCurrency(product.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
