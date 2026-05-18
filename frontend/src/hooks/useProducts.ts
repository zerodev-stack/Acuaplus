import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Product, PaginatedResponse, Category } from '@/types';

export function useProducts(filters?: Record<string, string>) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters || {});
      const { data } = await api.get(`/products?${params}`);
      return data;
    },
  });
}

export function useProduct(id: number) {
  return useQuery<{ data: Product }>({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery<{ data: Category[] }>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data;
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: FormData | Record<string, unknown>) => {
      const isFormData = product instanceof FormData;
      const { data } = await api.post('/products', product, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Record<string, unknown>) => {
      const { data } = await api.patch(`/products/${id}`, product);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
