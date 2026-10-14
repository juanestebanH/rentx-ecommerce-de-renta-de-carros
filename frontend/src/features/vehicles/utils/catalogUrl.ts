import type { CatalogDates, VehicleFilters } from '../types/vehicle.types';

const CATALOG_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function initialCatalogDatesFromUrl(
  searchParams: URLSearchParams,
): CatalogDates {
  const dates: CatalogDates = {};
  const fechaInicio = searchParams.get('fecha_inicio');
  const fechaFin = searchParams.get('fecha_fin');
  if (fechaInicio && CATALOG_DATE_RE.test(fechaInicio)) {
    dates.fecha_inicio = fechaInicio;
  }
  if (fechaFin && CATALOG_DATE_RE.test(fechaFin)) {
    dates.fecha_fin = fechaFin;
  }
  return dates;
}

export function initialCatalogFiltersFromUrl(
  searchParams: URLSearchParams,
): VehicleFilters {
  const categoria = searchParams.get('id_categoria');
  if (!categoria || !categoria.trim()) return {};
  return { id_categoria: categoria };
}

export function buildCatalogHref(dates: CatalogDates): string {
  const { fecha_inicio, fecha_fin } = dates;
  if (!fecha_inicio || !fecha_fin) return '/catalogo';
  const params = new URLSearchParams({ fecha_inicio, fecha_fin });
  return `/catalogo?${params.toString()}`;
}