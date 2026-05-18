'use client';

import { useNotifications, useMarkNotificationRead } from '@/hooks/useNotifications';
import { Spinner } from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';
import { Bell, CheckCheck } from 'lucide-react';

const typeIcons: Record<string, string> = {
  order_update: '📦',
  new_sale: '💰',
  review: '⭐',
  system: '🔔',
  seller_approved: '✅',
  payment_approved: '💳',
  payment_failed: '❌',
  shipment_update: '🚚',
};

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  const notifications = data?.data || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notificaciones</h1>
        {unreadCount > 0 && (
          <span className="rounded-full bg-aqua-100 px-3 py-1 text-xs font-medium text-aqua-700">
            {unreadCount} sin leer
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card py-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">No tienes notificaciones</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`card flex items-start gap-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                !notif.is_read ? 'border-l-4 border-l-aqua-500 bg-aqua-50/30' : ''
              }`}
              onClick={() => {
                if (!notif.is_read) {
                  markRead.mutate(notif.id);
                }
              }}
            >
              <span className="text-xl">{typeIcons[notif.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className={`text-sm ${!notif.is_read ? 'font-semibold' : 'font-medium'}`}>
                    {notif.title}
                  </h3>
                  {!notif.is_read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markRead.mutate(notif.id);
                      }}
                      className="text-aqua-600 hover:text-aqua-700"
                      title="Marcar como leída"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {notif.body && (
                  <p className={`mt-1 text-sm ${notif.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                    {notif.body}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">{formatDate(notif.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
