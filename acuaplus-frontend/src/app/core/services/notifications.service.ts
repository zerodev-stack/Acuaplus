import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
 
export interface Notification {
  id: number;
  user_id: number;
  type: 'order_update' | 'payment_approved' | 'payment_failed' | 'review' | 'seller_approved';
  title: string;
  body: string;
  reference_id: number | null;
  reference_type: string | null;
  is_read: number; // 0 = no leída, 1 = leída
  expires_at: string | null;
  created_at: string;
}
 
export interface NotificationsResponse {
  data: Notification[];
  unreadCount: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
 
@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private api: ApiService) {}
 
  getNotifications(page = 1, limit = 20) {
    return this.api.get<NotificationsResponse>(`/notifications?page=${page}&limit=${limit}`);
  }
 
  markAsRead(id: number) {
    return this.api.patch<{ data: { message: string } }>(`/notifications/${id}/read`, {});
  }
}