import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Order, PaginatedResponse } from '@/types';

export function useOrders(filters?: Record<string, string>) {
  return useQuery<PaginatedResponse<Order>>({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters || {});
      const { data } = await api.get(`/orders/mine?${params}`);
      return data;
    },
  });
}

export function useOrder(id: number) {
  return useQuery<{ data: Order }>({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { address_id: number; payment_method: string; card_id?: number }) => {
      const { data } = await api.post('/orders', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useSellerOrders(filters?: Record<string, string>) {
  return useQuery<PaginatedResponse<Order>>({
    queryKey: ['seller-orders', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters || {});
      const { data } = await api.get(`/orders/seller?${params}`);
      return data;
    },
  });
}

export function useUpdateSellerOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: { id: number; status: string; tracking_code?: string }) => {
      const { data } = await api.patch(`/orders/seller-orders/${id}/status`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
