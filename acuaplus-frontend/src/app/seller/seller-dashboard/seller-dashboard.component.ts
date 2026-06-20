import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-seller-dashboard',
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.css'],
})
export class SellerDashboardComponent implements OnInit {
  user: User | null = null;
  stats = { products: 0, orders: 0, pendingOrders: 0, revenue: 0 };
  loading = true;
  recentOrders: any[] = [];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser;
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;

    this.apiService.get<any>('products?limit=1').subscribe({
      next: (res) => (this.stats.products = res.total ?? 0),
    });

    this.apiService.get<any>('orders/seller?limit=5').subscribe({
      next: (res) => {
        this.stats.orders = res.total ?? 0;
        this.recentOrders = res.data?.slice(0, 5) ?? [];
        this.stats.pendingOrders =
          res.data?.filter((o: any) => o.status === 'pending').length ?? 0;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  logout(): void {
    this.authService.logout();
  }

  get firstName(): string {
    return this.user?.name?.split(' ')[0] ?? '';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      shipped: 'Enviada',
      delivered: 'Entregada',
      cancelled: 'Cancelada',
    };
    return labels[status] ?? status;
  }

  statusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'warning',
      confirmed: 'primary',
      shipped: 'info',
      delivered: 'success',
      cancelled: 'danger',
    };
    return `badge bg-${classes[status] ?? 'secondary'}`;
  }
}