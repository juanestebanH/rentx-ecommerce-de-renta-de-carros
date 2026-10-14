import { useQuery } from '@tanstack/react-query';
import {
  getDashboard,
  getEstadoFlota,
  getIngresosCategoria,
  getIngresosMensuales,
  getIngresosPeriodo,
  getRentasRecientes,
  getRankingVehiculos,
  getResumenPeriodo,
} from '../api/reports.api';
import type { AgruparPor } from '../types/reports.types';

const RANKING_LIMITE = 10;

export function useDashboardReport() {
  return useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: getDashboard,
  });
}

export function useIngresosMensuales() {
  return useQuery({
    queryKey: ['reports', 'ingresos', 6],
    queryFn: () => getIngresosMensuales(6),
  });
}

export function useRentasRecientes() {
  return useQuery({
    queryKey: ['reports', 'rentas-recientes'],
    queryFn: getRentasRecientes,
  });
}

export function useEstadoFlota() {
  return useQuery({
    queryKey: ['reports', 'estado-flota'],
    queryFn: getEstadoFlota,
  });
}

export function useResumenPeriodo(desde: string, hasta: string) {
  return useQuery({
    queryKey: ['reports', 'resumen-periodo', desde, hasta],
    queryFn: () => getResumenPeriodo(desde, hasta),
    enabled: Boolean(desde && hasta),
  });
}

export function useIngresosPeriodo(
  desde: string,
  hasta: string,
  agrupar: AgruparPor,
) {
  return useQuery({
    queryKey: ['reports', 'ingresos-periodo', desde, hasta, agrupar],
    queryFn: () => getIngresosPeriodo(desde, hasta, agrupar),
    enabled: Boolean(desde && hasta),
  });
}

export function useRankingVehiculos(desde: string, hasta: string) {
  return useQuery({
    queryKey: ['reports', 'ranking-vehiculos', desde, hasta, RANKING_LIMITE],
    queryFn: () => getRankingVehiculos(desde, hasta, RANKING_LIMITE),
    enabled: Boolean(desde && hasta),
  });
}

export function useIngresosCategoria(desde: string, hasta: string) {
  return useQuery({
    queryKey: ['reports', 'ingresos-categoria', desde, hasta],
    queryFn: () => getIngresosCategoria(desde, hasta),
    enabled: Boolean(desde && hasta),
  });
}