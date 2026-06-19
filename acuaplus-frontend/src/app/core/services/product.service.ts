import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from './api.service';

export interface Product {
  id: number;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  stock: number;
  minorderqty: number;
  unit?: string;
  weightkg?: number;
  status: 'draft' | 'active' | 'paused' | 'deleted';
  categoryid: number;
  categoryname?: string;
  sellername?: string;
  ratingavg: number;
  ratingcount: number;
  createdat: string;
  images?: ProductImage[];
  specs?: ProductSpec[];
  primaryimage?: ProductImage | null;
}

export interface ProductImage {
  id: number;
  imageurl: string;
  alttext?: string;
  isprimary: number;
}

export interface ProductSpec {
  id?: number;
  speckey: string;
  specvalue: string;
  spectype: 'text' | 'number' | 'range';
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Category {
  id: number;
  name: string;
  children?: Category[];
}

export interface CreateProductPayload {
  categoryid: number;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  stock: number;
  minorderqty: number;
  unit?: string;
  weightkg?: number;
  status?: 'draft' | 'active';
  specs?: ProductSpec[];
  images?: {
    imageurl?: string;
    alttext?: string;
    source: 'url';
    isprimary: boolean;
  }[];
}

export interface ProductFilters {
  search?: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = 'http://localhost:4000/api';

  constructor(
    private api: ApiService,
    private http: HttpClient
  ) {}

  getProducts(filters: ProductFilters = {}) {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.category_id) params.set('categoryid', String(filters.category_id));
    if (filters.min_price !== undefined) params.set('minprice', String(filters.min_price));
    if (filters.max_price !== undefined) params.set('maxprice', String(filters.max_price));

    params.set('page', String(filters.page ?? 1));
    params.set('limit', String(filters.limit ?? 12));

    return this.api.get<ProductsResponse>(`products?${params.toString()}`);
  }

  getProductById(id: number) {
    return this.api.get<{ data: Product }>(`products/${id}`);
  }

  getMyProducts(filters: { status?: string; search?: string; page?: number; limit?: number } = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    params.set('page', String(filters.page ?? 1));
    params.set('limit', String(filters.limit ?? 20));
    return this.api.get<ProductsResponse>(`products/mine?${params.toString()}`);
  }

  getSellerProducts(page = 1, limit = 10, status?: string) {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (status) params.set('status', status);

    return this.api.get<ProductsResponse>(`products/mine?${params.toString()}`);
  }

  getById(id: number) {
    return this.api.get<{ data: Product }>(`products/${id}`);
  }

  create(payload: CreateProductPayload) {
    return this.api.post<{ data: Product }>('products', payload);
  }

  update(id: number, payload: Partial<CreateProductPayload>) {
    return this.api.patch<{ data: Product }>(`products/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<any>(`${this.baseUrl}/products/${id}`, {
      withCredentials: true,
      headers: this.buildAuthHeaders()
    });
  }

  addImageByUrl(productId: number, imageurl: string) {
    return this.api.post<any>(`products/${productId}/images`, { imageurl });
  }

  uploadImage(productId: number, file: File) {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<any>(
      `${this.baseUrl}/products/${productId}/images`,
      formData,
      {
        withCredentials: true,
        headers: this.buildAuthHeaders()
      }
    );
  }

  getCategories() {
    return this.api.get<{ data: Category[] }>('categories');
  }

  private buildAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}