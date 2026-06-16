import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService, Product } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  error = false;
  selectedCategoryId: number | null = null;

  currentPage = 1;
  totalPages = 1;
  total = 0;
  readonly limit = 12;

  addingToCart: { [id: number]: boolean } = {};
  cartMessage = '';
  cartError = '';

  user: User | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser;
    this.loadProducts();
  }

  onCategorySelected(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.currentPage = 1;
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = false;

    this.productService.getProducts({
      category_id: this.selectedCategoryId ?? undefined,
      page: this.currentPage,
      limit: this.limit
    }).subscribe({
      next: (res) => {
        this.products = res.data;
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

  onAddToCart(product: Product): void {
    // Si no está logueado, redirigir al login
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { redirect: '/catalog' }
      });
      return;
    }

    if (product.stock === 0) return;

    this.addingToCart[product.id] = true;
    this.cartMessage = '';
    this.cartError = '';

    this.cartService.addItem(product.id, 1).subscribe({
      next: () => {
        this.addingToCart[product.id] = false;
        this.cartMessage = `✓ ${product.name} agregado al carrito.`;
        setTimeout(() => (this.cartMessage = ''), 3000);
      },
      error: () => {
        this.addingToCart[product.id] = false;
        this.cartError = `No se pudo agregar ${product.name} al carrito.`;
        setTimeout(() => (this.cartError = ''), 3000);
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get cartItemCount(): number {
    return this.cartService.itemCount;
  }

  logout(): void {
    this.authService.logout();
  }
}