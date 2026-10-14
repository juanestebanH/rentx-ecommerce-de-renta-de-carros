import { z } from 'zod';

export const listClientsQuerySchema = z.object({
  estado: z.enum(['activo', 'inactivo']).optional(),
});

export const updateClienteEstadoSchema = z.object({
  estado: z.enum(['activo', 'inactivo']),
});