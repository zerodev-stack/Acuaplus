import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {ApiService} from "./api.service";

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


@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(private apiService: ApiService) { }

  getCart(): Observable<{ data: Cart}> {
    return this.apiService.get<{data: Cart}>('/cart');
  }
  addItem(productId: number, quantity: number): Observable<any>{
    return this.apiService.post('/cart/items', {product_id: productId, quantity});
  }
  updateItem(itemId: number, quantity: number): Observable<any>{
    return this.apiService.patch(`/cart/items/${itemId}`, {quantity});
  }
  removeItem(itemId: number): Observable<any>{
    return this.apiService.delete(`/cart/items/${itemId}`);
  }
}
