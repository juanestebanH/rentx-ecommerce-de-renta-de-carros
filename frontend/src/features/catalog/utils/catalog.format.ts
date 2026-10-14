import { ApiError } from '@/shared/lib/apiClient';
import type { CatalogTipo } from '../types/catalog.types';

interface CatalogLabel {
  singular: string;
  plural: string;
  /** Con artículo definido: "la marca", "la categoría". */
  singularConArticulo: string;
  /** Título capitalizado en plural: "Marcas", "Categorías". */
  tituloPlural: string;
}

export const CATALOG_LABELS: Record<CatalogTipo, CatalogLabel> = {
  marcas: {
    singular: 'marca',
    plural: 'marcas',
    singularConArticulo: 'la marca',
    tituloPlural: 'Marcas',
  },
  categorias: {
    singular: 'categoría',
    plural: 'categorías',
    singularConArticulo: 'la categoría',
    tituloPlural: 'Categorías',
  },
};

export function catalogErrorMensaje(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
