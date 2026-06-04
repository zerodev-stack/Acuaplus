import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService, SellerOrder } from '../../core/services/order.service';

@Component({
  selector: 'app-seller-orders',
  templateUrl: './seller-orders.component.html',
  styleUrls: ['./seller-orders.component.css']
})
export class SellerOrdersComponent implements OnInit {
  orders: SellerOrder[] = [];
  loading = true;
  error = false;
  currentPage = 1;
  totalPages = 1;
  total = 0;
  selectedStatus = '';

  // Para el modal de actualización de estado
  updatingId: number | null = null;
  updateForm: FormGroup;
  updateLoading = false;
  updateError = '';
  updateSuccess = '';

  readonly statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  readonly nextStatus: Record<string, { value: string; label: string }[]> = {
    pending: [
      { value: 'confirmed', label: 'Confirmar' },
      { value: 'cancelled', label: 'Cancelar' }
    ],
    confirmed: [
      { value: 'shipped', label: 'Marcar como enviado' },
      { value: 'cancelled', label: 'Cancelar' }
    ],
    shipped: [{ value: 'delivered', label: 'Marcar como entregado' }],
    delivered: [],
    cancelled: []
  };

  constructor(
    private orderService: OrderService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.updateForm = this.fb.group({
      status: [''],
      tracking_code: ['']
    });
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = false;
    this.orderService.getSellerOrders(
      this.currentPage, 10, this.selectedStatus || undefined
    ).subscribe({
      next: (res) => {
        this.orders = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadOrders();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadOrders();
  }

  openUpdate(order: SellerOrder): void {
    this.updatingId = order.id;
    this.updateError = '';
    this.updateSuccess = '';
    this.updateForm.reset({ status: '', tracking_code: '' });
  }

  closeUpdate(): void {
    this.updatingId = null;
  }

  submitUpdate(): void {
    const { status, tracking_code } = this.updateForm.value;
    if (!status) return;
    this.updateLoading = true;
    this.updateError = '';
    const input: any = { status };
    if (tracking_code) input.tracking_code = tracking_code;

    this.orderService.updateSellerOrderStatus(this.updatingId!, input).subscribe({
      next: () => {
        this.updateSuccess = 'Estado actualizado correctamente';
        this.updateLoading = false;
        setTimeout(() => {
          this.updatingId = null;
          this.loadOrders();
        }, 1000);
      },
      error: (err) => {
        this.updateError = err.error?.error?.message ?? 'Error al actualizar';
        this.updateLoading = false;
      }
    });
  }

  getNextOptions(status: string) {
    return this.nextStatus[status] ?? [];
  }

  viewDetail(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
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

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(price);
  }
}