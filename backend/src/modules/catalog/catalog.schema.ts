import { z } from 'zod';

const nombreField = z.string().min(1, 'nombre es requerido');

export const createMarcaSchema = z.object({
  nombre: nombreField,
});

export const updateMarcaSchema = z.object({
  nombre: nombreField,
});

export const createCategoriaSchema = z.object({
  nombre: nombreField,
});

export const updateCategoriaSchema = z.object({
  nombre: nombreField,
});