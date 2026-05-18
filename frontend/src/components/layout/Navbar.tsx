'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface NavbarProps {
  title?: string;
}

export function Navbar({ title }: NavbarProps) {
  const { data: notifData } = useNotifications();
  const { user } = useAuth();

  const unreadCount = notifData?.unreadCount ?? 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-8">
      <h1 className="text-lg font-semibold text-gray-900">{title || 'Dashboard'}</h1>

      <div className="flex items-center gap-4">
        <Link
          href="/notifications"
          className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs capitalize text-gray-500">{user?.role}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-aqua-100 text-sm font-medium text-aqua-700">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
