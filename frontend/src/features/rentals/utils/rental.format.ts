import { format, parseISO } from 'date-fns';
import { es as esDateFns } from 'date-fns/locale';
import { ApiError } from '@/shared/lib/apiClient';
import type { RentalEstado } from '../types/rental.types';

export const RENTA_ESTADO_LABELS: Record<RentalEstado, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  en_curso: 'En curso',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

export function formatRentalFechas(value: string): string {
  return format(parseISO(value), 'dd MMM yyyy', { locale: esDateFns });
}

export function formatFechaCorta(value: string): string {
  return format(parseISO(value), 'dd MMM', { locale: esDateFns });
}

export function formatRangoFechas(fechaInicio: string, fechaFin: string): string {
  const ini = parseISO(fechaInicio);
  const fin = parseISO(fechaFin);
  if (ini.getFullYear() === fin.getFullYear()) {
    return `${format(ini, 'dd MMM', { locale: esDateFns })} – ${format(fin, 'dd MMM yyyy', { locale: esDateFns })}`;
  }
  return `${format(ini, 'dd MMM yyyy', { locale: esDateFns })} – ${format(fin, 'dd MMM yyyy', { locale: esDateFns })}`;
}

export function rentalDiasLabel(dias: number): string {
  return `${dias} ${dias === 1 ? 'día' : 'días'}`;
}

/**
 * Cómo se lee un plazo en la fila. El pasado y el futuro necesitan verbos
 * distintos en español: "Inició hace 2 días" pero "Inicia en 3 días".
 */
export function etiquetaPlazo(
  dias: number,
  pasado: string,
  futuro: string,
): string {
  if (dias < 0) {
    const n = Math.abs(dias);
    return `${pasado} hace ${n} ${n === 1 ? 'día' : 'días'}`;
  }
  if (dias === 0) return `${pasado} hoy`;
  if (dias === 1) return `${futuro} mañana`;
  return `${futuro} en ${dias} días`;
}

export { formatCop as formatCurrencyCOP } from '@/shared/utils/format';

export function rentalErrorMensaje(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
