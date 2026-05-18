'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminSellersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['pending-sellers'],
    queryFn: async () => {
      const { data } = await api.get('/users/pending-sellers');
      return data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.patch(`/users/${userId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-sellers'] });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.patch(`/users/${userId}/suspend`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-sellers'] });
    },
  });

  const sellers = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Vendedores pendientes</h1>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : sellers.length === 0 ? (
        <div className="card py-12 text-center text-gray-500">
          No hay vendedores pendientes de aprobación
        </div>
      ) : (
        <div className="space-y-4">
          {sellers.map((seller: any) => (
            <div key={seller.id} className="card">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">{seller.name}</h3>
                  <p className="text-sm text-gray-500">{seller.email}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500">Negocio:</span>
                    <span className="font-medium">{seller.business_name}</span>
                    {seller.nit && (
                      <>
                        <span className="text-gray-500">NIT:</span>
                        <span>{seller.nit}</span>
                      </>
                    )}
                  </div>
                  {seller.description && (
                    <p className="text-sm text-gray-600">{seller.description}</p>
                  )}
                  {seller.location && (
                    <p className="text-sm text-gray-500">{seller.location}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Solicitó: {formatDate(seller.requested_at || seller.created_at)}
                  </p>
                </div>
                <Badge variant="warning">Pendiente</Badge>
              </div>

              <div className="mt-4 flex gap-3">
                <Button
                  onClick={() => approveMutation.mutate(seller.id)}
                  isLoading={approveMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aprobar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => suspendMutation.mutate(seller.id)}
                  isLoading={suspendMutation.isPending}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Rechazar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
