import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface SavedCard {
  id: number;
  sim_token: string;
  last_four: string;
  brand: string;
  cardholder_name: string;
  exp_month: number;
  exp_year: number;
  is_default: number;
}

export interface PaymentResult {
  transaction_id: string;
  status: 'approved' | 'declined' | 'timeout' | 'insufficient_funds';
  getaway_response: any;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private apiService: ApiService) {}
  getCards() {
    return this.apiService.get<{ data: SavedCard[] }>('payment/cards');
  }
  savedCard(data: {
    pan: string;
    cvv: string;
    cardholder_name: string;
    exp_month: number;
    exp_year: number;
    is_default: boolean;
  }) {
    return this.apiService.post<{ data: SavedCard }>('payment/cards', data);
  }

  processPayment(order_id: number, card_id: number) {
    return this.apiService.post<{ data: PaymentResult }>('payment/process', {
      order_id,
      card_id,
    });
  }
}
