import { z } from 'zod';
import { diffDaysInclusive, MAX_DIAS_PERIODO } from '../../shared/utils/dateRange.js';

export const ingresosMensualesQuerySchema = z.object({
  meses: z.coerce
    .number()
    .int('meses debe ser un entero')
    .min(1)
    .max(12)
    .optional()
    .default(6),
});

const dateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'debe tener formato YYYY-MM-DD')
  .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()), 'fecha inválida');

const periodoDates = z.object({
  desde: dateField,
  hasta: dateField,
});

type RangoIssue = { path: (string | number)[]; message: string };

/** `desde <= hasta` y rango de 1 a 366 días (ambos bordes incluidos). */
function rangoIssues(desde: string, hasta: string): RangoIssue[] {
  if (desde > hasta) {
    return [{ path: ['desde'], message: 'desde no puede ser posterior a hasta' }];
  }

  const dias = diffDaysInclusive(desde, hasta);
  if (dias > MAX_DIAS_PERIODO) {
    return [{ path: ['hasta'], message: `el rango no puede superar ${MAX_DIAS_PERIODO} días` }];
  }

  return [];
}

const limiteSchema = z.coerce
  .number()
  .int('limite debe ser un entero')
  .min(1, 'limite debe ser >= 1')
  .max(100, 'limite debe ser <= 100');

const agregarRango = <T extends z.ZodType>(schema: T) =>
  schema.superRefine((value, ctx) => {
    const { desde, hasta } = value as { desde: string; hasta: string };
    for (const issue of rangoIssues(desde, hasta)) {
      ctx.addIssue({ code: 'custom', path: issue.path, message: issue.message });
    }
  });

export const resumenPeriodoQuerySchema = agregarRango(periodoDates);

export const ingresosPeriodoQuerySchema = agregarRango(
  periodoDates.extend({
    agrupar: z.enum(['semana', 'mes']).optional().default('semana'),
  })
);

export const rankingVehiculosQuerySchema = agregarRango(
  periodoDates.extend({
    limite: limiteSchema.optional().default(10),
  })
);

export const ingresosCategoriaQuerySchema = agregarRango(periodoDates);