export interface Marca {
  nombre: string;
}

export interface Categoria {
  nombre: string;
}

export interface CreateCatalogEntryInput {
  nombre: string;
}

export type UpdateCatalogEntryInput = CreateCatalogEntryInput;