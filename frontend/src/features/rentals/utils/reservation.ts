import { differenceInCalendarDays, parseISO } from 'date-fns';

export interface ReservarParams {
  id_carro: string;
  fecha_inicio: string;
  fecha_fin: string;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseReservarParams(
  searchParams: URLSearchParams,
): ReservarParams | null {
  const id_carro = searchParams.get('id_carro');
  const fecha_inicio = searchParams.get('fecha_inicio');
  const fecha_fin = searchParams.get('fecha_fin');
  if (!id_carro || !fecha_inicio || !fecha_fin) return null;
  if (!DATE_RE.test(fecha_inicio) || !DATE_RE.test(fecha_fin)) return null;
  return { id_carro, fecha_inicio, fecha_fin };
}

export function reservarDays(fecha_inicio: string, fecha_fin: string): number | null {
  if (fecha_inicio > fecha_fin) return null;
  return (
    differenceInCalendarDays(parseISO(fecha_fin), parseISO(fecha_inicio)) + 1
  );
}

export type RangeProblem = 'pasado' | 'minimo';

export function reservarRangeProblem(params: ReservarParams): RangeProblem | null {
  if (params.fecha_inicio < toDateString(new Date())) return 'pasado';
  const days = reservarDays(params.fecha_inicio, params.fecha_fin);
  if (days === null || days < 2) return 'minimo';
  return null;
}

export function buildDetalleHref(params: ReservarParams): string {
  const query = new URLSearchParams({
    fecha_inicio: params.fecha_inicio,
    fecha_fin: params.fecha_fin,
  });
  return `/carros/${encodeURIComponent(params.id_carro)}?${query.toString()}`;
}