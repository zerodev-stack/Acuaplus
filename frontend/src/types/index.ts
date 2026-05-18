export interface User {
  id: number;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  status: 'pending' | 'active' | 'suspended' | 'deleted';
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  business_name?: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  children: Category[];
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string | null;
  file_path: string | null;
  alt_text: string | null;
  source: 'url' | 'upload';
  is_primary: number;
  display_order: number;
}

export interface ProductSpec {
  id: number;
  product_id: number;
  spec_key: string;
  spec_value: string;
  spec_type: 'text' | 'number' | 'range';
  display_order: number;
}

export interface Product {
  id: number;
  seller_id: number;
  category_id: number;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  stock: number;
  stock_version: number;
  min_order_qty: number;
  unit: string | null;
  weight_kg: number | null;
  rating_avg: number;
  rating_count: number;
  status: 'draft' | 'active' | 'paused' | 'deleted';
  category_name?: string;
  seller_name?: string;
  seller_user_id?: number;
  primary_image?: ProductImage | null;
  images?: ProductImage[];
  specs?: ProductSpec[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  unit_price_snapshot: number;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  added_at: string;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: number;
  buyer_id: number;
  address_id: number | null;
  shipping_address: string;
  payment_method: string;
  status: string;
  payment_status: string;
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  notes: string | null;
  seller_orders: SellerOrder[];
  created_at: string;
  updated_at: string;
}

export interface SellerOrder {
  id: number;
  order_id: number;
  seller_id: number;
  status: string;
  subtotal: number;
  tracking_code: string | null;
  estimated_delivery: string | null;
  business_name?: string;
  seller_user_id?: number;
  created_at: string;
}

export interface SavedCard {
  id: number;
  sim_token: string;
  last_four: string;
  brand: string;
  cardholder_name: string;
  exp_month: number;
  exp_year: number;
  is_default: number;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body: string | null;
  is_read: number;
  reference_id: number | null;
  reference_type: string;
  created_at: string;
}

export interface Review {
  id: number;
  product_id: number;
  buyer_id: number;
  order_id: number;
  rating: number;
  comment: string | null;
  is_verified: number;
  buyer_name?: string;
  created_at: string;
}
