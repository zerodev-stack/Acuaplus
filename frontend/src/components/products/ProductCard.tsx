'use client';

import Link from 'next/link';
import { ShoppingBag, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.primary_image?.image_url || product.images?.[0]?.image_url;

  return (
    <Link href={`/products/${product.id}`} className="card group hover:shadow-md transition-all">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 mb-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-gray-300" />
          </div>
        )}
        {product.status !== 'active' && (
          <span className="absolute left-2 top-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
            {product.status}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-medium text-gray-900 truncate group-hover:text-aqua-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 truncate">{product.seller_name}</p>
        <p className="text-lg font-bold text-aqua-600">{formatCurrency(product.price)}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {product.rating_count > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {product.rating_avg.toFixed(1)} ({product.rating_count})
            </span>
          )}
          <span>Stock: {product.stock}</span>
        </div>
      </div>
    </Link>
  );
}
