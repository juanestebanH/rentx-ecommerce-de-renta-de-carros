import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getClientRentals,
  getClients,
  updateClienteEstado,
} from '../api/clients.api';
import type { ClienteEstado } from '../types/clients.types';

const CLIENTS_QUERY_KEY = ['clients'] as const;

export function useClients(estado?: ClienteEstado) {
  return useQuery({
    queryKey: [...CLIENTS_QUERY_KEY, estado ?? 'todos'],
    queryFn: () => getClients(estado),
    placeholderData: keepPreviousData,
  });
}

interface UpdateEstadoInput {
  id: string;
  estado: ClienteEstado;
}

export function useUpdateClienteEstado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estado }: UpdateEstadoInput) =>
      updateClienteEstado(id, estado),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
    },
  });
}

export function useClientRentalHistory(id: string) {
  return useQuery({
    queryKey: ['clients', id, 'rentals'],
    queryFn: () => getClientRentals(id),
    enabled: Boolean(id),
  });
}