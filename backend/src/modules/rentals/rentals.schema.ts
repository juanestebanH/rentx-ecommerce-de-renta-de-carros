import { z } from 'zod';

const RENTA_ESTADOS = ['pendiente', 'confirmada', 'en_curso', 'finalizada', 'cancelada'] as const;

const dateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'debe tener formato YYYY-MM-DD')
  .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), 'fecha inválida');

export const createRentaSchema = z.object({
  fecha_inicio: dateField,
  fecha_fin: dateField,
  id_carro: z.string().min(1, 'id_carro es requerido'),
});

export const listRentalsQuerySchema = z.object({
  estado: z.enum(RENTA_ESTADOS).optional(),
  id_cliente: z.string().min(1).optional(),
  id_carro: z.string().min(1).optional(),
});

export const updateRentaEstadoSchema = z.object({
  estado: z.enum(RENTA_ESTADOS),
});

export const checkAvailabilityQuerySchema = z.object({
  id_carro: z.string().min(1),
  fecha_inicio: dateField,
  fecha_fin: dateField,
});