import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../../core/services/product.service'

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
@Input() product!: Product;
@Output() addToCart = new EventEmitter<Product>();

readonly fallbackImage = 'https://placehold.co/400x300?text=Sin+imagen';

onImageError(event: Event) {
  (event.target as HTMLImageElement).src = this.fallbackImage;
}

formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {style: 'currency', currency: 'COP', maximumFractionDigits: 0}).format(price);
}
onAddToCart() {
  this.addToCart.emit(this.product);
 }
}
