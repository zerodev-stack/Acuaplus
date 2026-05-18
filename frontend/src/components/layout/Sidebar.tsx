'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Package,
  CreditCard,
  Bell,
  Settings,
  Users,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useState } from 'react';

const buyerLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Productos', icon: ShoppingBag },
  { href: '/cart', label: 'Carrito', icon: ShoppingCart },
  { href: '/orders', label: 'Mis órdenes', icon: Package },
  { href: '/payments', label: 'Mis tarjetas', icon: CreditCard },
  { href: '/notifications', label: 'Notificaciones', icon: Bell },
  { href: '/settings', label: 'Configuración', icon: Settings },
];

const sellerLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Mis productos', icon: ShoppingBag },
  { href: '/orders', label: 'Órdenes recibidas', icon: Package },
  { href: '/notifications', label: 'Notificaciones', icon: Bell },
  { href: '/settings', label: 'Configuración', icon: Settings },
];

const adminLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/sellers', label: 'Vendedores', icon: Users },
  { href: '/notifications', label: 'Notificaciones', icon: Bell },
  { href: '/settings', label: 'Configuración', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const role = user?.role || 'buyer';
  const links = role === 'admin' ? adminLinks : role === 'seller' ? sellerLinks : buyerLinks;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-200',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        {!collapsed && (
          <Link href="/dashboard" className="text-xl font-bold text-aqua-600">
            AcuaPlus
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ChevronLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-aqua-50 text-aqua-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? link.label : undefined}
            >
              <link.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        {!collapsed && user && (
          <div className="mb-2 px-3 text-xs text-gray-500 truncate">
            {user.name}
            <span className="block text-gray-400 capitalize">{user.role}</span>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-red-600',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
