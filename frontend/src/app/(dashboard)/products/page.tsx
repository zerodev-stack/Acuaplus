'use client';

import { useState } from 'react';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';

export default function ProductsPage() {
  const { isSeller, isAdmin } = useAuth();
  const [filters, setFilters] = useState<Record<string, string>>({ page: '1', limit: '12' });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useProducts(filters);
  const { data: catData } = useCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search, page: '1' }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: '1' }));
  };

  const sortOptions = [
    { value: 'newest', label: 'Más recientes' },
    { value: 'price_asc', label: 'Menor precio' },
    { value: 'price_desc', label: 'Mayor precio' },
    { value: 'rating', label: 'Mejor calificados' },
    { value: 'name_asc', label: 'Nombre A-Z' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        {isSeller && (
          <Link href="/products/new" className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo producto
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="input-field pl-9"
            />
          </div>
        </form>

        <Select
          options={sortOptions}
          value={filters.sort || 'newest'}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          className="w-44"
        />

        <Button variant="ghost" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-4 rounded-lg border bg-white p-4">
          <Select
            label="Categoría"
            options={(catData?.data || []).map((c: any) => ({ value: String(c.id), label: c.name }))}
            value={filters.category_id || ''}
            onChange={(e) => handleFilterChange('category_id', e.target.value)}
            placeholder="Todas"
            className="w-48"
          />
          <Input
            label="Precio mínimo"
            type="number"
            value={filters.min_price || ''}
            onChange={(e) => handleFilterChange('min_price', e.target.value)}
            className="w-32"
          />
          <Input
            label="Precio máximo"
            type="number"
            value={filters.max_price || ''}
            onChange={(e) => handleFilterChange('max_price', e.target.value)}
            className="w-32"
          />
          {(isSeller || isAdmin) && (
            <Select
              label="Estado"
              options={[
                { value: 'active', label: 'Activos' },
                { value: 'draft', label: 'Borradores' },
                { value: 'paused', label: 'Pausados' },
              ]}
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              placeholder="Todos"
              className="w-40"
            />
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={(p) => setFilters((prev) => ({ ...prev, page: String(p) }))}
          />
        </>
      ) : (
        <div className="card py-12 text-center">
          <p className="text-gray-500">No se encontraron productos</p>
        </div>
      )}
    </div>
  );
}
