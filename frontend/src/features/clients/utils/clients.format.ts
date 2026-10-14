import { format, isBefore, parseISO, differenceInCalendarDays } from 'date-fns';
import { es as esDateFns } from 'date-fns/locale';
import { ApiError } from '@/shared/lib/apiClient';

export const LICENCIA_PRONTOS_DIAS = 30;

export type LicenciaVigencia = 'vigente' | 'pronto' | 'vencida' | 'sin_vencimiento';

export function licenciaEstado(
  fechaVencimiento: string | null,
  hoy: Date = new Date(),
): LicenciaVigencia {
  if (!fechaVencimiento) return 'sin_vencimiento';

  const vence = parseISO(fechaVencimiento);
  if (isBefore(vence, hoy)) return 'vencida';
  if (differenceInCalendarDays(vence, hoy) < LICENCIA_PRONTOS_DIAS) {
    return 'pronto';
  }
  return 'vigente';
}

export function formatFechaLicencia(fecha: string | null): string {
  if (!fecha) return 'Sin fecha de vencimiento';
  return format(parseISO(fecha), 'dd MMM yyyy', { locale: esDateFns });
}

export function clienteErrorMensaje(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}