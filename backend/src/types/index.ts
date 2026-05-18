export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'buyer' | 'seller' | 'admin';
  status: 'pending' | 'active' | 'suspended' | 'deleted';
  phone: string | null;
  avatar_url: string | null;
  email_verified_at: Date | null;
  last_login_at: Date | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface SellerProfileRow {
  id: number;
  user_id: number;
  business_name: string;
  nit: string | null;
  description: string | null;
  location: string | null;
  website_url: string | null;
  social_links: Record<string, string> | null;
  rating_avg: number;
  rating_count: number;
  total_sales: number;
  approved_by: number | null;
  approved_at: Date | null;
  created_at: Date;
}

export interface RefreshTokenRow {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  is_revoked: number;
  created_at: Date;
}

export interface CategoryRow {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  is_active: number;
}

export interface ProductRow {
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
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ProductImageRow {
  id: number;
  product_id: number;
  image_url: string | null;
  file_path: string | null;
  alt_text: string | null;
  source: 'url' | 'upload';
  is_primary: number;
  display_order: number;
  created_at: Date;
}

export interface CartRow {
  id: number;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface CartItemRow {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  unit_price_snapshot: number;
  added_at: Date;
}

export interface OrderRow {
  id: number;
  buyer_id: number;
  address_id: number | null;
  card_id: number | null;
  shipping_address: string;
  payment_method: 'card' | 'transfer' | 'cash_on_delivery';
  status: 'pending' | 'confirmed' | 'partially_shipped' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'refunded' | 'failed';
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  discount_code_id: number | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface SellerOrderRow {
  id: number;
  order_id: number;
  seller_id: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tracking_code: string | null;
  estimated_delivery: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItemRow {
  id: number;
  order_id: number;
  seller_order_id: number;
  product_id: number;
  seller_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface SavedCardRow {
  id: number;
  user_id: number;
  sim_token: string;
  last_four: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'diners' | 'other';
  cardholder_name: string;
  exp_month: number;
  exp_year: number;
  is_default: number;
  is_active: number;
  created_at: Date;
}

export interface NotificationRow {
  id: number;
  user_id: number;
  type: 'order_update' | 'new_sale' | 'review' | 'system' | 'seller_approved' | 'payment_approved' | 'payment_failed' | 'shipment_update';
  title: string;
  body: string | null;
  is_read: number;
  reference_id: number | null;
  reference_type: 'orders' | 'seller_orders' | 'products' | 'reviews' | 'seller_reviews' | 'payment_transactions';
  expires_at: Date | null;
  created_at: Date;
}

export interface ProductSpecRow {
  id: number;
  product_id: number;
  spec_key: string;
  spec_value: string;
  spec_type: 'text' | 'number' | 'range';
  display_order: number;
}

export interface ReviewRow {
  id: number;
  product_id: number;
  buyer_id: number;
  order_id: number;
  rating: number;
  comment: string | null;
  is_verified: number;
  created_at: Date;
}
