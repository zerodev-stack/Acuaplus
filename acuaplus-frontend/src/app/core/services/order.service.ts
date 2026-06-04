import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface OrderItems{
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface SellerOrder{
id: number;
order_id: number;
seller_id: number;
  business_name: string;
  subtotal: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  tracking_code: string | null;
  items?: OrderItems [];
 
}

export interface Order { 
  id?: number | undefined;
  buyer_id: number;
  shipping_address: string;
  payment_status: 'unpaid' | 'paid' | 'failed';
  status: string;
  subtotal_amount: number;
  total_amount: number;
  notes: string | null;
  create_at: string;
  seller_orders: SellerOrder [];

}

export interface PaginatedOrders{
  data: Order [];
  total: number;
  limit: number;
  totalPages: number;
}
export interface UpdateStatusInput{
status: 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
tracking_code?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private api: ApiService) { }

 getMyOrders (page = 1, limit = 10):
 Observable<PaginatedOrders>{
  return  this.api.get<PaginatedOrders> 
(`orders/mine? page=${page}&limit=${limit}` )
 }
 
 getOrderById (id: number): Observable<{data: Order}> {
  return this.api.get<{ data: Order}> (`orders/${id}`);
 }

 updateSellerOrderStatus(sellerOrderId: number, 
  input: UpdateStatusInput):Observable <any> {
  return  this.api.patch (`orders/seller-
    orders/ ${sellerOrderId}/status`, input)
 }


  
  
  }

