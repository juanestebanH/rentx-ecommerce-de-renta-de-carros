import { apiClient } from '@/shared/lib/apiClient';
import type { Categoria, Marca } from '../types/catalog.types';

const BASE = '/api/catalog';

export function getMarcas(): Promise<Marca[]> {
  return apiClient.get<Marca[]>(`${BASE}/marcas`);
}

export function createMarca(nombre: string): Promise<Marca> {
  return apiClient.post<Marca>(`${BASE}/marcas`, { nombre });
}

export function updateMarca(nombreActual: string, nombre: string): Promise<Marca> {
  return apiClient.put<Marca>(
    `${BASE}/marcas/${encodeURIComponent(nombreActual)}`,
    { nombre },
  );
}

export function deleteMarca(nombre: string): Promise<void> {
  return apiClient.delete<void>(`${BASE}/marcas/${encodeURIComponent(nombre)}`);
}

export function getCategorias(): Promise<Categoria[]> {
  return apiClient.get<Categoria[]>(`${BASE}/categorias`);
}

export function createCategoria(nombre: string): Promise<Categoria> {
  return apiClient.post<Categoria>(`${BASE}/categorias`, { nombre });
}

export function updateCategoria(
  nombreActual: string,
  nombre: string,
): Promise<Categoria> {
  return apiClient.put<Categoria>(
    `${BASE}/categorias/${encodeURIComponent(nombreActual)}`,
    { nombre },
  );
}

export function deleteCategoria(nombre: string): Promise<void> {
  return apiClient.delete<void>(
    `${BASE}/categorias/${encodeURIComponent(nombre)}`,
  );
}
