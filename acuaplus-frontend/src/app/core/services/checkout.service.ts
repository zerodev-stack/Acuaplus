import { Injectable } from '@angular/core';
import {ApiService} from "./api.service";


export interface Order {
  id: number;
  buyer_id: number;
  address_id: number;
  shipping_address: string;
  payment_method: string;
  payment_status: string;
  status: string;
  subtotal_amount: number;
  total_amount: number;
  notes: string | null;
  created_at: string;
  seller_orders: any [];
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(private apiService: ApiService) { }

createOrder(data: {
  address_id: number;
  payment_method: 'card' | 'transfer' | 'cash_on_delivery';
  card_id?: number;
  notes?: string;
}) {
  return this.apiService.post<{data: Order}>('orders', data);
}
getOrderById(id: number) {
  return this.apiService.get<{data: Order}>(`orders/${id}`);
}
}
