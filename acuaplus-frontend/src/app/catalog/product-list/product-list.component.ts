import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import {AuthService} from "../../core/services/auth.service";

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
  cartMessage: string = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService, private authService: AuthService
  ) {}

  ngOnInit(): void {
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
    if (product.stock === 0) return;

    this.addingToCart[product.id] = true;
    this.cartMessage = '';

    this.cartService.addItem(product.id, 1).subscribe({
      next: () => {
        this.addingToCart[product.id] = false;
        this.cartMessage = `${product.name} fue agregado al carrito.`;
      },
      error: () => {
        this.addingToCart[product.id] = false;
        this.cartMessage = `No se pudo agregar ${product.name} al carrito.`;
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }
  goToCart(): void {
    window.location.href = '/cart';
  }
  logout(): void {
    this.authService.logout();
  }
}