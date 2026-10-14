import { apiClient } from '@/shared/lib/apiClient';
import type {
  AgruparPor,
  DashboardReport,
  EstadoFlotaReporte,
  IngresoMes,
  IngresosCategoriasReporte,
  IngresosTiempoReporte,
  RentaReciente,
  RankingVehiculosReporte,
  ResumenPeriodo,
} from '../types/reports.types';

const BASE = '/api/reports';

export function getDashboard(): Promise<DashboardReport> {
  return apiClient.get<DashboardReport>(`${BASE}/dashboard`);
}

export function getIngresosMensuales(months = 6): Promise<IngresoMes[]> {
  return apiClient.get<IngresoMes[]>(
    `${BASE}/ingresos-mensuales?meses=${months}`,
  );
}

export function getRentasRecientes(): Promise<RentaReciente[]> {
  return apiClient.get<RentaReciente[]>(`${BASE}/rentas-recientes`);
}

export function getEstadoFlota(): Promise<EstadoFlotaReporte> {
  return apiClient.get<EstadoFlotaReporte>(`${BASE}/estado-flota`);
}

function rangoParams(desde: string, hasta: string): URLSearchParams {
  return new URLSearchParams({ desde, hasta });
}

export function getResumenPeriodo(
  desde: string,
  hasta: string,
): Promise<ResumenPeriodo> {
  return apiClient.get<ResumenPeriodo>(
    `${BASE}/resumen-periodo?${rangoParams(desde, hasta).toString()}`,
  );
}

export function getIngresosPeriodo(
  desde: string,
  hasta: string,
  agrupar: AgruparPor,
): Promise<IngresosTiempoReporte> {
  const params = rangoParams(desde, hasta);
  params.set('agrupar', agrupar);
  return apiClient.get<IngresosTiempoReporte>(
    `${BASE}/ingresos-periodo?${params.toString()}`,
  );
}

export function getRankingVehiculos(
  desde: string,
  hasta: string,
  limite = 10,
): Promise<RankingVehiculosReporte> {
  const params = rangoParams(desde, hasta);
  params.set('limite', String(limite));
  return apiClient.get<RankingVehiculosReporte>(
    `${BASE}/ranking-vehiculos?${params.toString()}`,
  );
}

export function getIngresosCategoria(
  desde: string,
  hasta: string,
): Promise<IngresosCategoriasReporte> {
  return apiClient.get<IngresosCategoriasReporte>(
    `${BASE}/ingresos-categoria?${rangoParams(desde, hasta).toString()}`,
  );
}