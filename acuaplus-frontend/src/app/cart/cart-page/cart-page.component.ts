import { Component, OnInit } from '@angular/core';
import { Cart, CartItem, CartService } from '../../core/services/cart.service';



@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.css']
})
export class CartPageComponent implements OnInit {
  cart: Cart | null = null;
  loading = true;
  error = false;
  updatingItem: { [id: number]: boolean } = {};

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.error = false;

    this.cartService.getCart().subscribe({
      next: (res) => {
        this.cart = res.data;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  // Convierte el string "25000.00" a número y multiplica por cantidad
  getSubtotal(item: CartItem): number {
    return parseFloat(item.price) * item.quantity;
  }

  // Suma todos los subtotales
  getTotal(): number {
    if (!this.cart) return 0;
    return this.cart.items.reduce((acc, item) => acc + this.getSubtotal(item), 0);
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) return;
    this.updatingItem[item.id] = true;

    this.cartService.updateItem(item.id, newQuantity).subscribe({
      next: () => {
        this.updatingItem[item.id] = false;
        this.loadCart();
      },
      error: () => {
        this.updatingItem[item.id] = false;
      }
    });
  }

  removeItem(itemId: number): void {
    this.updatingItem[itemId] = true;

    this.cartService.removeItem(itemId).subscribe({
      next: () => {
        this.updatingItem[itemId] = false;
        this.loadCart();
      },
      error: () => {
        this.updatingItem[itemId] = false;
      }
    });
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }
}