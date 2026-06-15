import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService, Product } from '../../core/services/product.service';

@Component({
  selector: 'app-seller-product-list',
  templateUrl: './seller-product-list.component.html',
  styleUrls: ['./seller-product-list.component.css'],
})
export class SellerProductListComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  error = '';
  page = 1;
  limit = 10;
  total = 0;
  totalPages = 0;
  filterStatus = '';

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    const params: Record<string, string> = {
      page: String(this.page),
      limit: String(this.limit),
    };
    if (this.filterStatus) params['status'] = this.filterStatus;

    this.productService.getSellerProducts(this.page, this.limit, this.filterStatus || undefined).subscribe({
      next: (res) => {
        this.products = res.data ?? [];
        this.total = res.total ?? 0;
        this.totalPages = res.totalPages ?? 0;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar los productos.';
        this.loading = false;
      },
    });
  }

  onFilterChange(status: string): void {
    this.filterStatus = status;
    this.page = 1;
    this.loadProducts();
  }

  goToPage(p: number): void {
    this.page = p;
    this.loadProducts();
  }

  editProduct(id: number): void {
    this.router.navigate(['/seller/products', id, 'edit']);
  }

  deleteProduct(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    this.productService.delete(id).subscribe({
      next: () => this.loadProducts(),
      error: () => alert('Error al eliminar el producto.'),
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }).format(price);
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      active: 'success', draft: 'secondary', paused: 'warning', deleted: 'danger',
    };
    return `badge bg-${map[status] ?? 'secondary'}`;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      active: 'Activo', draft: 'Borrador', paused: 'Pausado', deleted: 'Eliminado',
    };
    return map[status] ?? status;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}