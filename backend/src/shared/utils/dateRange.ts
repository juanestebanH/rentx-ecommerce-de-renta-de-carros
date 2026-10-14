const MS_PER_DAY = 86_400_000;

/** Máximo de días (inclusivos) que abarca un periodo de reportes. */
export const MAX_DIAS_PERIODO = 366;

export interface DateRange {
  desde: string;
  hasta: string;
}

/** Convierte 'YYYY-MM-DD' al instante UTC de esa medianoche. */
export function toUtcDate(fecha: string): Date {
  return new Date(`${fecha}T00:00:00.000Z`);
}

/** Formatea un instante UTC como 'YYYY-MM-DD'. */
export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Suma días (admite negativos) a una fecha 'YYYY-MM-DD'. */
export function addDays(fecha: string, days: number): string {
  return toDateString(new Date(toUtcDate(fecha).getTime() + days * MS_PER_DAY));
}

/**
 * Cantidad de días del rango, contando AMBOS bordes.
 * `diffDaysInclusive('2026-01-01', '2026-01-01') === 1`.
 */
export function diffDaysInclusive(desde: string, hasta: string): number {
  return Math.round((toUtcDate(hasta).getTime() - toUtcDate(desde).getTime()) / MS_PER_DAY) + 1;
}

/**
 * Días del rango `[rentaDesde, rentaHasta]` que caen dentro de `[desde, hasta]`,
 * prorrateando las rentas que cruzan un borde. `0` si no hay solapamiento.
 */
export function overlapDays(
  rentaDesde: string,
  rentaHasta: string,
  desde: string,
  hasta: string
): number {
  const inicio = rentaDesde > desde ? rentaDesde : desde;
  const fin = rentaHasta < hasta ? rentaHasta : hasta;
  if (inicio > fin) return 0;
  return diffDaysInclusive(inicio, fin);
}

/** ¿Se solapan dos rangos inclusivos? (orden lexicográfico = cronológico en YYYY-MM-DD) */
export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  return a.desde <= b.hasta && b.desde <= a.hasta;
}

/**
 * Periodo de igual duración inmediatamente anterior: termina el día previo a
 * `desde` y tiene exactamente los mismos días.
 */
export function previousPeriod({ desde, hasta }: DateRange): DateRange {
  const dias = diffDaysInclusive(desde, hasta);
  const anteriorHasta = addDays(desde, -1);
  return { desde: addDays(anteriorHasta, -(dias - 1)), hasta: anteriorHasta };
}

/** Lunes de la semana de `fecha` (semanas ISO, lunes = 0). */
export function mondayOf(fecha: string): string {
  return addDays(fecha, -((toUtcDate(fecha).getUTCDay() + 6) % 7));
}