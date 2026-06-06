import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService, Order } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-order-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.css']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  error = false;
  currentPage = 1;
  totalPages = 1;
  total = 0;

  constructor(
    private orderService: OrderService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirigir sellers a su vista
    if (this.authService.currentUser?.role === 'seller') {
      this.router.navigate(['/orders/seller']);
      return;
    }
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = false;
    this.orderService.getMyOrders(this.currentPage).subscribe({
      next: (res) => {
        this.orders = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadOrders();
  }

  viewDetail(id: number): void {
    this.router.navigate(['/orders', id]);
  }

  // Helpers de UI
  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente', confirmed: 'Confirmada',
      shipped: 'Enviada', delivered: 'Entregada', cancelled: 'Cancelada'
    };
    return labels[status] ?? status;
  }

  statusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-warning text-dark', confirmed: 'bg-info text-dark',
      shipped: 'bg-primary', delivered: 'bg-success', cancelled: 'bg-danger'
    };
    return classes[status] ?? 'bg-secondary';
  }

  paymentClass(status: string): string {
    return status === 'paid' ? 'text-success' : status === 'failed' ? 'text-danger' : 'text-warning';
  }

  paymentLabel(status: string): string {
    return status === 'paid' ? 'Pagado' : status === 'failed' ? 'Fallido' : 'Pendiente';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(price);
  }
  logout(): void {
    this.authService.logout();
  }
}