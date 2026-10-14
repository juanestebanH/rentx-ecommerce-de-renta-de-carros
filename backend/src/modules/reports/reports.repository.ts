import { supabase } from '../../config/supabase.js';
import {
  RENTA_ESTADOS_ACTIVOS,
  RENTA_ESTADOS_OCUPACION,
} from '../rentals/rentals.types.js';
import type { Renta } from '../rentals/rentals.types.js';
import { VEHICLE_ESTADO_INACTIVO } from '../vehicles/vehicles.types.js';
import type { PagoEstado } from '../payments/payments.types.js';
import type {
  CarrosEstadoCount,
  PagoDelPeriodo,
  ReporteCarro,
} from './reports.types.js';
import { rangesOverlap } from '../../shared/utils/dateRange.js';
import type { DateRange } from '../../shared/utils/dateRange.js';

/**
 * ÚNICA definición de "ingresos" en el sistema: sólo pagos completados, y la
 * pertenencia a un periodo la decide `fecha_pago` con bordes INCLUSIVOS
 * (`>= desde`, `<= hasta`). Todo el módulo —incluido el Dashboard— pasa por acá.
 */
const PAGO_ESTADO_INGRESO: PagoEstado = 'completado';

const RENTA_ESTADO_CANCELADA = 'cancelada';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function shiftMonth(
  year: number,
  month: number,
  offset: number
): { year: number; month: number } {
  const total = month - 1 + offset;
  return {
    year: year + Math.floor(total / 12),
    month: ((total % 12) + 12) % 12 + 1,
  };
}

function monthRangeUTC(offset: number): { primerDia: string; ultimoDia: string } {
  const now = new Date();
  const { year, month } = shiftMonth(now.getUTCFullYear(), now.getUTCMonth() + 1, offset);
  return {
    primerDia: `${year}-${pad(month)}-01`,
    ultimoDia: `${year}-${pad(month)}-${pad(lastDayOfMonth(year, month))}`,
  };
}

/** Un pago cuenta si no tiene fecha o si cae dentro del rango (bordes inclusivos). */
function enRango(pago: PagoDelPeriodo, desde: string, hasta: string): boolean {
  if (!pago.fecha_pago) return true;
  return pago.fecha_pago >= desde && pago.fecha_pago <= hasta;
}

class ReportsRepository {
  async countCarsByEstado(): Promise<CarrosEstadoCount[]> {
    const { data, error } = await supabase.from('carros').select('estado');
    if (error) throw error;

    const tally = new Map<string, number>();
    for (const row of data ?? []) {
      const estado = row.estado as string;
      tally.set(estado, (tally.get(estado) ?? 0) + 1);
    }

    return [...tally.entries()].map(([estado, cantidad]) => ({ estado, cantidad }));
  }

  async countRentedCars(): Promise<number> {
    const { data, error } = await supabase
      .from('rentas')
      .select('id_carro')
      .in('estado', RENTA_ESTADOS_ACTIVOS);

    if (error) throw error;
    return new Set((data ?? []).map((row) => row.id_carro as string)).size;
  }

  async countActiveRentas(): Promise<number> {
    const { count, error } = await supabase
      .from('rentas')
      .select('id_renta', { count: 'exact', head: true })
      .in('estado', RENTA_ESTADOS_ACTIVOS);

    if (error) throw error;
    return count ?? 0;
  }

  async countActiveClients(): Promise<number> {
    const { count, error } = await supabase
      .from('clientes')
      .select('id_cliente', { count: 'exact', head: true })
      .eq('estado', 'activo');
    if (error) throw error;
    return count ?? 0;
  }

  /**
   * Pagos que cuentan como ingreso en `[desde, hasta]` (ambos inclusive).
   * Es la regla compartida por el Dashboard y los reportes de periodo.
   */
  async pagosCompletadosEnRango(desde: string, hasta: string): Promise<PagoDelPeriodo[]> {
    const { data, error } = await supabase
      .from('pagos')
      .select('id_renta, total_pago, fecha_pago')
      .eq('estado', PAGO_ESTADO_INGRESO)
      .gte('fecha_pago', desde)
      .lte('fecha_pago', hasta);
    if (error) throw error;
    return (data ?? []) as PagoDelPeriodo[];
  }

  /**
   * Ingresos del rango excluyendo los pagos cuya renta está `cancelada`. Es la
   * misma regla que aplica el Dashboard (`sumIngresosMes`) y la gráfica de
   * ingresos mensuales (`sumIngresosPorMes`), para que todas las vistas cuadren.
   */
  async sumIngresosEnRango(desde: string, hasta: string): Promise<number> {
    const crudos = await this.pagosCompletadosEnRango(desde, hasta);
    const pagos = crudos.filter((pago) => enRango(pago, desde, hasta));
    if (pagos.length === 0) return 0;

    const ids = [
      ...new Set(
        pagos
          .map((pago) => pago.id_renta)
          .filter((id): id is string => typeof id === 'string' && id.length > 0)
      ),
    ];

    const rentas = await this.findRentasPorIds(ids);
    const canceladas = new Set(
      rentas.filter((renta) => renta.estado === RENTA_ESTADO_CANCELADA).map((renta) => renta.id_renta)
    );

    return pagos.reduce(
      (acc, pago) => (canceladas.has(pago.id_renta) ? acc : acc + pago.total_pago),
      0
    );
  }

  async sumIngresosMes(offset = 0): Promise<number> {
    const { primerDia, ultimoDia } = monthRangeUTC(offset);
    return this.sumIngresosEnRango(primerDia, ultimoDia);
  }

  async sumIngresosPorMes(months: number): Promise<Array<{ mes: string; total: number }>> {
    const resultado: Array<{ mes: string; total: number }> = [];
    for (let offset = -(months - 1); offset <= 0; offset++) {
      const { primerDia, ultimoDia } = monthRangeUTC(offset);
      const total = await this.sumIngresosEnRango(primerDia, ultimoDia);
      resultado.push({ mes: primerDia.slice(0, 7), total });
    }
    return resultado;
  }

  async listRentasByPeriodo(desde: string, hasta: string): Promise<Renta[]> {
    const { data, error } = await supabase
      .from('rentas')
      .select('*')
      .gte('fecha_registro', desde)
      .lte('fecha_registro', hasta);
    if (error) throw error;
    return (data ?? []) as Renta[];
  }

  /** Renta de cada pago que sí aporta; incluye rentas registradas fuera del periodo. */
  async findRentasPorIds(ids: string[]): Promise<Renta[]> {
    if (ids.length === 0) return [];
    const { data, error } = await supabase.from('rentas').select('*').in('id_renta', ids);
    if (error) throw error;
    return (data ?? []) as Renta[];
  }

  /**
   * Rentas que ocupan el carro dentro del periodo, por solapamiento de
   * `fecha_inicio`/`fecha_fin` con los bordes del periodo. No prorratea: el
   * prorrateo es responsabilidad del caller.
   */
  async listRentasOcupadas({ desde, hasta }: DateRange): Promise<Renta[]> {
    const { data, error } = await supabase
      .from('rentas')
      .select('*')
      .in('estado', RENTA_ESTADOS_OCUPACION)
      .lte('fecha_inicio', hasta)
      .gte('fecha_fin', desde);
    if (error) throw error;

    const period: DateRange = { desde, hasta };
    return ((data ?? []) as Renta[]).filter((renta) =>
      rangesOverlap({ desde: renta.fecha_inicio, hasta: renta.fecha_fin }, period)
    );
  }

  async countVehiculosNoInactivos(): Promise<number> {
    const { count, error } = await supabase
      .from('carros')
      .select('id_carro', { count: 'exact', head: true })
      .neq('estado', VEHICLE_ESTADO_INACTIVO);
    if (error) throw error;
    return count ?? 0;
  }

  async listCarros(): Promise<ReporteCarro[]> {
    const { data, error } = await supabase
      .from('carros')
      .select('id_carro, nombre, id_marca, id_categoria');
    if (error) throw error;
    return (data ?? []) as ReporteCarro[];
  }
}

export const reportsRepository = new ReportsRepository();
