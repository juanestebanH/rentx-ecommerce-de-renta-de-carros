export interface DashboardReport {
  total_carros: number;
  carros_disponibles: number;
  carros_rentados: number;
  carros_mantenimiento: number;
  rentas_activas: number;
  total_clientes: number;
  ingresos_mes: number;
}

export interface RentaReciente {
  id_renta: string;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_registro: string;
  dias_duracion: number;
  estado: string;
  id_carro: string;
  id_cliente: string;
  carro: { nombre: string } | null;
  cliente: { nombres: string; apellidos: string } | null;
}

export interface IngresoMes {
  mes: string;
  total: number;
}

export type FlotaEstado = 'disponibles' | 'rentados' | 'mantenimiento';

export interface EstadoFlotaItem {
  estado: FlotaEstado;
  cantidad: number;
  porcentaje: number;
}

export interface EstadoFlotaReporte {
  total_carros: number;
  items: EstadoFlotaItem[];
}

export interface PeriodoRef {
  desde: string;
  hasta: string;
  dias: number;
}

/**
 * `variacion` es el cambio porcentual contra el periodo anterior, o `null`
 * cuando el periodo anterior vale 0 (el backend evita Infinity/NaN).
 */
export interface KpiPeriodo {
  actual: number;
  anterior: number;
  variacion: number | null;
}

export interface ResumenPeriodo {
  periodo: PeriodoRef;
  periodo_anterior: PeriodoRef;
  ingresos: KpiPeriodo;
  rentas_finalizadas: KpiPeriodo;
  ticket_promedio: KpiPeriodo;
  tasa_cancelacion: KpiPeriodo;
  ocupacion: KpiPeriodo;
}

export type AgruparPor = 'semana' | 'mes';

export interface IngresoTiempoPunto {
  /** 'YYYY-MM-DD' (lunes) al agrupar por semana, 'YYYY-MM' al agrupar por mes. */
  periodo: string;
  desde: string;
  hasta: string;
  ingresos: number;
  /** Rentas con al menos un pago completado dentro del bucket. */
  rentas: number;
}

export interface IngresosTiempoReporte {
  desde: string;
  hasta: string;
  dias: number;
  agrupar: AgruparPor;
  total_ingresos: number;
  total_rentas: number;
  puntos: IngresoTiempoPunto[];
}

export interface RankingVehiculoItem {
  id_carro: string;
  nombre: string | null;
  id_marca: string | null;
  id_categoria: string | null;
  rentas: number;
  ingresos: number;
  dias_rentados: number;
}

export interface RankingVehiculosReporte {
  desde: string;
  hasta: string;
  dias: number;
  limite: number;
  /** Vehículos con al menos una renta en el periodo, antes de aplicar `limite`. */
  total: number;
  items: RankingVehiculoItem[];
}

export interface IngresoCategoriaItem {
  id_categoria: string;
  rentas: number;
  ingresos: number;
}

export interface IngresosCategoriasReporte {
  desde: string;
  hasta: string;
  dias: number;
  total_ingresos: number;
  items: IngresoCategoriaItem[];
}