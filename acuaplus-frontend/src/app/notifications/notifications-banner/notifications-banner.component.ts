import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../../core/services/notifications.service';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.css']
})
export class NotificationsListComponent implements OnInit {
  notifications: Notification[] = [];
  unreadCount = 0;
  total = 0;
  page = 1;
  totalPages = 1;
  loading = false;
  error = '';

  // Íconos por tipo de notificación
  readonly typeIcons: Record<string, string> = {
    order_update:     'bi-box-seam',
    payment_approved: 'bi-check-circle',
    payment_failed:   'bi-x-circle',
    review:           'bi-star',
    seller_approved:  'bi-person-check',
  };

  readonly typeColors: Record<string, string> = {
    order_update:     'text-primary',
    payment_approved: 'text-success',
    payment_failed:   'text-danger',
    review:           'text-warning',
    seller_approved:  'text-success',
  };

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.error = '';
    this.notificationService.getNotifications(this.page).subscribe({
      next: (res) => {
        this.notifications = res.data;
        this.unreadCount = res.unreadCount;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las notificaciones.';
        this.loading = false;
      }
    });
  }

  markAsRead(notification: Notification): void {
    if (notification.is_read) return;
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.is_read = 1;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    });
  }

  markAllRead(): void {
    const unread = this.notifications.filter(n => !n.is_read);
    unread.forEach(n => this.markAsRead(n));
  }

  changePage(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.page = newPage;
    this.loadNotifications();
  }

  getIcon(type: string): string {
    return this.typeIcons[type] ?? 'bi-bell';
  }

  getColor(type: string): string {
    return this.typeColors[type] ?? 'text-secondary';
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}