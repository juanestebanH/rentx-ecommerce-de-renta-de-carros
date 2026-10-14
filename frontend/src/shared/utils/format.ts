import { format, parseISO } from 'date-fns';
import { es as esDateFns } from 'date-fns/locale';
import { ApiError } from '@/shared/lib/apiClient';

const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatCop(value: number): string {
  return cop.format(value);
}

export function formatNumero(value: number): string {
  return value.toLocaleString('es-CO');
}

export function capitalizar(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatRango(fechaInicio: string, fechaFin: string): string {
  const ini = parseISO(fechaInicio);
  const fin = parseISO(fechaFin);
  if (ini.getFullYear() === fin.getFullYear()) {
    return `${format(ini, 'dd MMM', { locale: esDateFns })} – ${format(fin, 'dd MMM yyyy', { locale: esDateFns })}`;
  }
  return `${format(ini, 'dd MMM yyyy', { locale: esDateFns })} – ${format(fin, 'dd MMM yyyy', { locale: esDateFns })}`;
}

export function mensajeError(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
