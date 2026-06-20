import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface Product {
  id: number;
  name: string;
  description?: string;
  sku?: string | null;
  price: number;
  stock: number;
  minorderqty: number;
  unit?: string | null;
  weightkg?: number | null;
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
  imageurl: string | null;
  alttext?: string | null;
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
  constructor(
    private api: ApiService,
  ) {}

  private toAbsoluteImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = this.api.getBaseUrl();
  if (url.startsWith('/')) return `${baseUrl.replace('/api', '')}${url}`;
  return `${baseUrl.replace('/api', '')}/${url}`;
}
private mapImage(image: any): ProductImage {
  return {
    id: Number(image.id),
    imageurl: this.toAbsoluteImageUrl(image.image_url),
    alttext: image.alt_text ?? null,
    isprimary: Number(image.is_primary ?? 0),
  };
}

  private mapSpec(spec: any): ProductSpec {
    return {
      id: spec.id ? Number(spec.id) : undefined,
      speckey: spec.spec_key,
      specvalue: spec.spec_value,
      spectype: spec.spec_type,
    };
  }

  private mapProduct(product: any): Product {
    return {
      id: Number(product.id),
      name: product.name,
      description: product.description ?? undefined,
      sku: product.sku ?? null,
      price: Number(product.price),
      stock: Number(product.stock),
      minorderqty: Number(product.min_order_qty ?? 1),
      unit: product.unit ?? null,
      weightkg: product.weight_kg != null ? Number(product.weight_kg) : null,
      status: product.status,
      categoryid: Number(product.category_id),
      categoryname: product.category_name ?? undefined,
      sellername: product.seller_name ?? undefined,
      ratingavg: Number(product.rating_avg ?? 0),
      ratingcount: Number(product.rating_count ?? 0),
      createdat: product.created_at,
      primaryimage: product.primary_image ? this.mapImage(product.primary_image) : null,
      images: Array.isArray(product.images) ? product.images.map((img: any) => this.mapImage(img)) : [],
      specs: Array.isArray(product.specs) ? product.specs.map((spec: any) => this.mapSpec(spec)) : [],
    };
  }

  getProducts(filters: ProductFilters = {}) {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.category_id) params.set('category_id', String(filters.category_id));
    if (filters.min_price !== undefined) params.set('min_price', String(filters.min_price));
    if (filters.max_price !== undefined) params.set('max_price', String(filters.max_price));

    params.set('page', String(filters.page ?? 1));
    params.set('limit', String(filters.limit ?? 12));

    return this.api.get<any>(`products?${params.toString()}`).pipe(
      map((res) => ({
        ...res,
        data: Array.isArray(res.data) ? res.data.map((p: any) => this.mapProduct(p)) : [],
      }))
    );
  }

  getProductById(id: number) {
    return this.api.get<{ data: any }>(`products/${id}`).pipe(
      map((res) => ({
        data: this.mapProduct(res.data),
      }))
    );
  }

  getMyProducts(filters: { status?: string; search?: string; page?: number; limit?: number } = {}) {
    const params = new URLSearchParams();

    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    params.set('page', String(filters.page ?? 1));
    params.set('limit', String(filters.limit ?? 20));

    return this.api.get<any>(`products/mine?${params.toString()}`).pipe(
      map((res) => ({
        ...res,
        data: Array.isArray(res.data) ? res.data.map((p: any) => this.mapProduct(p)) : [],
      }))
    );
  }

  getSellerProducts(page = 1, limit = 10, status?: string) {
    const params = new URLSearchParams();

    params.set('page', String(page));
    params.set('limit', String(limit));
    if (status) params.set('status', status);

    return this.api.get<any>(`products/mine?${params.toString()}`).pipe(
      map((res) => ({
        ...res,
        data: Array.isArray(res.data) ? res.data.map((p: any) => this.mapProduct(p)) : [],
      }))
    );
  }

  getById(id: number) {
    return this.getProductById(id);
  }

  create(payload: CreateProductPayload) {
    const body = {
      categoryid: payload.categoryid,
      name: payload.name,
      description: payload.description,
      sku: payload.sku,
      price: payload.price,
      stock: payload.stock,
      min_order_qty: payload.minorderqty,
      unit: payload.unit,
      weight_kg: payload.weightkg,
      status: payload.status,
      specs: payload.specs?.map((spec) => ({
        spec_key: spec.speckey,
        spec_value: spec.specvalue,
        spec_type: spec.spectype,
      })),
      images: payload.images?.map((img) => ({
        image_url: img.imageurl,
        alt_text: img.alttext,
        source: img.source,
        is_primary: img.isprimary,
      })),
    };

    return this.api.post<{ data: any }>('products', body).pipe(
      map((res) => ({
        data: this.mapProduct(res.data),
      }))
    );
  }

  update(id: number, payload: Partial<CreateProductPayload>) {
    const body: any = {};

    if (payload.categoryid !== undefined) body.category_id = payload.categoryid;
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.description !== undefined) body.description = payload.description;
    if (payload.sku !== undefined) body.sku = payload.sku;
    if (payload.price !== undefined) body.price = payload.price;
    if (payload.stock !== undefined) body.stock = payload.stock;
    if (payload.minorderqty !== undefined) body.min_order_qty = payload.minorderqty;
    if (payload.unit !== undefined) body.unit = payload.unit;
    if (payload.weightkg !== undefined) body.weight_kg = payload.weightkg;
    if (payload.status !== undefined) body.status = payload.status;

    if (payload.specs) {
      body.specs = payload.specs.map((spec) => ({
        spec_key: spec.speckey,
        spec_value: spec.specvalue,
        spec_type: spec.spectype,
      }));
    }

    if (payload.images) {
      body.images = payload.images.map((img) => ({
        image_url: img.imageurl,
        alt_text: img.alttext,
        source: img.source,
        is_primary: img.isprimary,
      }));
    }

    return this.api.patch<{ data: any }>(`products/${id}`, body).pipe(
      map((res) => ({
        data: this.mapProduct(res.data),
      }))
    );
  }

  delete(id: number) {
    return this.api.delete<any>(`products/${id}`);
  }

  addImageByUrl(productId: number, imageUrl: string) {
    return this.api.post<any>(`products/${productId}/images`, { imageUrl });
  }

  uploadImage(productId: number, file: File) {
    const formData = new FormData();
    formData.append('image', file);

    return this.api.post<any>(`products/${productId}/images`, formData);
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
