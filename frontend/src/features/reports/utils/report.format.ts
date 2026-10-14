import { format, parseISO } from 'date-fns';
import { es as esDateFns } from 'date-fns/locale';
import { capitalizar } from '@/shared/utils/format';

export function formatMes(mes: string, mesActual?: string): string {
  const date = parseISO(`${mes}-01`);
  const nombre = capitalizar(format(date, 'MMM', { locale: esDateFns }));
  const cruzaAnio =
    mesActual !== undefined && mes.slice(0, 4) !== mesActual.slice(0, 4);
  return cruzaAnio ? `${nombre} ${date.getFullYear()}` : nombre;
}

export function formatEjeCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `$${(value / 1_000_000).toLocaleString('es-CO', {
      maximumFractionDigits: 1,
    })}M`;
  }
  if (abs >= 1_000) {
    return `$${Math.round(value / 1_000)}k`;
  }
  return `$${value}`;
}
