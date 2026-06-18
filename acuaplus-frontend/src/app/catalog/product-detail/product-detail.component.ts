import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = true;
  error = false;
  quantity = 1;
  addingToCart = false;
  cartMessage = '';
  cartError = '';
  readonly fallbackImage = 'https://placehold.co/600x500?text=Sin+imagen';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/']); return; }
    this.loadProduct(id);
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.error = false;

    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.product = res.data;
        this.quantity = this.product?.minorderqty ?? 1;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  goBack(): void { this.router.navigate(['/']); }

  addToCart(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { redirect: `/catalog/${this.product?.id}` }
      });
      return;
    }

    if (!this.product || this.product.stock === 0) return;

    const qty = Math.min(this.quantity, this.product.stock);
    this.addingToCart = true;
    this.cartMessage = '';
    this.cartError = '';

    this.cartService.addItem(this.product.id, qty).subscribe({
      next: () => {
        this.addingToCart = false;
        this.cartMessage = `✓ ${this.product?.name} agregado al carrito.`;
      },
      error: () => {
        this.addingToCart = false;
        this.cartError = 'No se pudo agregar el producto al carrito.';
      }
    });
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.fallbackImage;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(price);
  }

  get isLoggedIn(): boolean { return this.authService.isLoggedIn(); }

  get stockBadgeClass(): string {
    if (!this.product) return 'bg-secondary';
    if (this.product.stock === 0) return 'bg-danger';
    if (this.product.stock <= 10) return 'bg-warning text-dark';
    return 'bg-success';
  }
}