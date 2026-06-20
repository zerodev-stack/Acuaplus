import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  unit_price_snapshot: string;
  added_at: string;
  name: string;
  price: string;
  stock: number;
  image_url: string | null;
  product_name: string;
  product_price: number;
  product_image: string | null;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  total_amount: number;
  items: CartItem[];
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemCountSubject = new BehaviorSubject<number>(0);
  itemCount$ = this.itemCountSubject.asObservable();

  constructor(private apiService: ApiService) {}

  get itemCount(): number {
    return this.itemCountSubject.value;
  }

  getCart(): Observable<{ data: Cart }> {
    return this.apiService.get<{ data: Cart }>('/cart').pipe(
      tap((res) => {
        const count = res.data?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
        this.itemCountSubject.next(count);
      })
    );
  }

  addItem(productId: number, quantity: number): Observable<any> {
    return this.apiService.post('/cart/items', { product_id: productId, quantity }).pipe(
      tap((res: any) => {
        const count = res.data?.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) ?? 0;
        this.itemCountSubject.next(count);
      })
    );
  }

  updateItem(itemId: number, quantity: number): Observable<any> {
    return this.apiService.patch(`/cart/items/${itemId}`, { quantity }).pipe(
      tap((res: any) => {
        const count = res.data?.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) ?? 0;
        this.itemCountSubject.next(count);
      })
    );
  }

  removeItem(itemId: number): Observable<any> {
    return this.apiService.delete(`/cart/items/${itemId}`).pipe(
      tap((res: any) => {
        const count = res.data?.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) ?? 0;
        this.itemCountSubject.next(count);
      })
    );
  }
}