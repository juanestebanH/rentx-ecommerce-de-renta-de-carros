export interface Marca {
  nombre: string;
}

export interface Categoria {
  nombre: string;
}

/** Forma común de una entrada de catálogo (marca o categoría). */
export interface CatalogEntry {
  nombre: string;
}

export type CatalogTipo = 'marcas' | 'categorias';
