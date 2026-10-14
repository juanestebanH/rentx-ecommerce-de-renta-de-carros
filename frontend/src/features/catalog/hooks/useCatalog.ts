import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCategoria,
  createMarca,
  deleteCategoria,
  deleteMarca,
  getCategorias,
  getMarcas,
  updateCategoria,
  updateMarca,
} from '../api/catalog.api';

const CATALOG_KEY = ['catalog'] as const;

function invalidateCatalog(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
}

export function useMarcas() {
  return useQuery({
    queryKey: [...CATALOG_KEY, 'marcas'],
    queryFn: getMarcas,
  });
}

export function useCategorias() {
  return useQuery({
    queryKey: [...CATALOG_KEY, 'categorias'],
    queryFn: getCategorias,
  });
}

export function useCreateMarca() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nombre: string) => createMarca(nombre),
    onSettled: () => invalidateCatalog(queryClient),
  });
}

export function useUpdateMarca() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      nombreActual,
      nombre,
    }: {
      nombreActual: string;
      nombre: string;
    }) => updateMarca(nombreActual, nombre),
    onSettled: () => invalidateCatalog(queryClient),
  });
}

export function useDeleteMarca() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nombre: string) => deleteMarca(nombre),
    onSettled: () => invalidateCatalog(queryClient),
  });
}

export function useCreateCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nombre: string) => createCategoria(nombre),
    onSettled: () => invalidateCatalog(queryClient),
  });
}

export function useUpdateCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      nombreActual,
      nombre,
    }: {
      nombreActual: string;
      nombre: string;
    }) => updateCategoria(nombreActual, nombre),
    onSettled: () => invalidateCatalog(queryClient),
  });
}

export function useDeleteCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nombre: string) => deleteCategoria(nombre),
    onSettled: () => invalidateCatalog(queryClient),
  });
}
