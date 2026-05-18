import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { SavedCard } from '@/types';

export function useCards() {
  return useQuery<{ data: SavedCard[] }>({
    queryKey: ['cards'],
    queryFn: async () => {
      const { data } = await api.get('/payments/cards');
      return data;
    },
  });
}

export function useSaveCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      pan: string;
      cvv: string;
      cardholder_name: string;
      exp_month: number;
      exp_year: number;
      is_default?: boolean;
    }) => {
      const { data } = await api.post('/payments/cards', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useProcessPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { order_id: number; card_id: number }) => {
      const { data } = await api.post('/payments/process', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
