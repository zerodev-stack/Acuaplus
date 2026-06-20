import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, Order } from '../../core/services/order.service';
import { Location } from '@angular/common';
@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
     public location: Location 

  ) {}

  ngOnInit(): void {
    const id = parseInt(this.route.snapshot.paramMap.get('id')!, 10);
    if (isNaN(id)) { this.router.navigate(['/orders']); return; }

    this.orderService.getOrderById(id).subscribe({
      next: (res) => { this.order = res.data; this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(price);
  }

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

  paymentLabel(status: string): string {
    return status === 'paid' ? 'Pagado' : status === 'failed' ? 'Fallido' : 'Pendiente de pago';
  }

  paymentClass(status: string): string {
    return status === 'paid' ? 'text-success' : status === 'failed' ? 'text-danger' : 'text-warning';
  }
}