import { z } from 'zod';

export const createPagoSchema = z.object({
  id_renta: z.string().min(1, 'id_renta es requerido'),
  metodo_pago: z.enum(['tarjeta', 'efectivo', 'transferencia']),
  total_pago: z.number().int('total_pago debe ser un entero').gt(0, 'total_pago debe ser positivo'),
});

export const updatePagoEstadoSchema = z.object({
  estado: z.enum(['pendiente', 'completado', 'fallido', 'reembolsado']),
});