import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface Review {
  id: number;
  product_id: number;
  buyer_id: number;
  buyer_name: string;
  order_id: number;
  rating: number;
  comment: string | null;
  is_verified: number;
  created_at: string;
}

export interface ReviewsResponse {
  data: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateReviewPayload {
  product_id: number;
  order_id: number;
  rating: number;
  comment?: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  constructor(private api: ApiService) {}

  getProductReviews(productId: number, page = 1, limit = 10) {
    return this.api.get<ReviewsResponse>(
      `reviews/product/${productId}?page=${page}&limit=${limit}`
    );
  }

  createReview(payload: CreateReviewPayload) {
    return this.api.post<{ data: Review }>('reviews', payload);
  }
}