import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createVehicle,
  deleteVehicle,
  getVehicles,
  updateVehicle,
  updateVehicleEstado,
  uploadVehiclePhoto,
} from '../api/vehicles.api';
import type { Vehicle, VehicleEstado } from '../types/vehicle.types';

const VEHICLES_KEY = ['vehicles'] as const;

function invalidateVehicles(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: VEHICLES_KEY });
}

export function useAdminVehicles() {
  return useQuery({
    queryKey: ['vehicles', 'admin'],
    queryFn: () => getVehicles({ incluirMantenimiento: true }),
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Vehicle) => createVehicle(input),
    onSettled: () => void invalidateVehicles(queryClient),
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Omit<Vehicle, 'id_carro'> }) =>
      updateVehicle(id, input),
    onSettled: () => void invalidateVehicles(queryClient),
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSettled: () => void invalidateVehicles(queryClient),
  });
}

export function useUpdateVehicleEstado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: VehicleEstado }) =>
      updateVehicleEstado(id, estado),
    onSettled: () => void invalidateVehicles(queryClient),
  });
}

export function useUploadVehiclePhoto() {
  return useMutation({
    mutationFn: (file: File) => uploadVehiclePhoto(file),
  });
}