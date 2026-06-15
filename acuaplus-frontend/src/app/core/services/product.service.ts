import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { SellerRoutingModule } from 'src/app/seller/seller-routing.module';

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
  status?: 'draft'|'active';
  specs?: ProductSpec[];
  images?: { imageurl: string; alttext?: string; source: 'url'; isprimary: boolean} [];
}
export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
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

  constructor(private api: ApiService) {}

  getProducts(filters: ProductFilters = {}) {
    const params = new URLSearchParams();
    if (filters.category_id) params.set('category_id', String(filters.category_id));
    params.set('page',  String(filters.page  ?? 1));
    params.set('limit', String(filters.limit ?? 12));

    const query = params.toString();
    return this.api.get<ProductsResponse>(`products?${query}`);
  }

  getProductById(id: number) {
    return this.api.get<{ data: Product }>(`products/${id}`);
  }

  getMyProducts(params: Record<string, string> = {}) {
    const query = new URLSearchParams({...params, sellerid: 'me'}).toString();
    return this.api.get<any>(`products?${query}`);
  }

  getSellerProducts(page = 1, limit = 10, status?: string) {
    let path = `products?limit=${limit}&page=${page}`;
    if (status) path += `&status=${status}`;
    return this.api.get<any>(path);
  }

  getById(id: number) {
    return this.api.get<any>(`products/${id}`);
  }

  create(payload: CreateProductPayload) {
    return this.api.post<any>('products', payload);
  }

  update(id: number, payload: Partial<CreateProductPayload>){
    return this.api.patch<any>(`products/${id}`, payload);
  }

  delete(id: number) {
    return this.api.patch<any>(`products/${id}`, {status: 'deleted'});
  }

  addImageByUrl(productId: number, imageurl: string){
    return this.api.post<any>(`products/${productId}/images`, {imageurl});
  }

  getCategories() {
    return this.api.get<any>('categories');
  }
}