import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface Product {
  id: number;
  seller_id: number;
  seller_name: string;
  business_name: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  status: string;
  image_url: string | null;
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {

  // Categorías del marketplace de Acuaplus
  readonly categories = [
    { value: '',            label: 'Todas las categorías' },
    { value: 'piscicultura', label: '🐟 Piscicultura' },
    { value: 'camaronicultura', label: '🦐 Camaronicultura' },
    { value: 'bovinos',    label: '🐄 Bovinos' },
    { value: 'porcinos',   label: '🐖 Porcinos' },
    { value: 'avicultura', label: '🐔 Avicultura' },
    { value: 'hortalizas', label: '🥦 Hortalizas' },
    { value: 'frutas',     label: '🍋 Frutas' },
    { value: 'lacteos',    label: '🥛 Lácteos' },
    { value: 'otros',      label: '📦 Otros' },
  ];

  constructor(private api: ApiService) {}

  getProducts(filters: ProductFilters = {}) {
    // Construir query string con los filtros
    const params = new URLSearchParams();
    if (filters.search)   params.set('search',   filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
    params.set('page',  String(filters.page  ?? 1));
    params.set('limit', String(filters.limit ?? 12));

    const query = params.toString();
    return this.api.get<ProductsResponse>(`/products?${query}`);
  }

  getProductById(id: number) {
    return this.api.get<{ data: Product }>(`/products/${id}`);
  }
}