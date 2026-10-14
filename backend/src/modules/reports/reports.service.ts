import { rentalsRepository } from '../rentals/rentals.repository.js';
import { vehiclesRepository } from '../vehicles/vehicles.repository.js';
import { clientsRepository } from '../clients/clients.repository.js';
import { normalizeIdentifier } from '../../shared/utils/normalize.js';
import {
  addDays,
  diffDaysInclusive,
  mondayOf,
  overlapDays,
  previousPeriod,
  toUtcDate,
} from '../../shared/utils/dateRange.js';
import type { DateRange } from '../../shared/utils/dateRange.js';
import type { Renta } from '../rentals/rentals.types.js';
import { RENTA_ESTADOS_OCUPACION } from '../rentals/rentals.types.js';
import { reportsRepository } from './reports.repository.js';
import type {
  AgruparPor,
  DashboardReport,
  EstadoFlotaReporte,
  FlotaEstado,
  IngresosCategoriaItem,
  IngresosCategoriasReporte,
  IngresosTiempoPunto,
  IngresosTiempoReporte,
  KpiPeriodo,
  PagoDelPeriodo,
  PeriodoRef,
  RankingVehiculoItem,
  RankingVehiculosReporte,
  RentaReciente,
  ResumenPeriodo,
} from './reports.types.js';

const RENTAS_RECIENTES_LIMIT = 5;

const RENTA_ESTADO_CANCELADA = 'cancelada';
const RENTA_ESTADO_FINALIZADA = 'finalizada';

const CATEGORIA_SIN_DATOS = 'sin_categoria';

interface PeriodoMetricas {
  dias: number;
  ingresos: number;
  rentas_finalizadas: number;
  ticket_promedio: number;
  tasa_cancelacion: number;
  ocupacion: number;
}

function porcentaje(numerador: number, denominador: number): number {
  if (denominador <= 0) return 0;
  return Math.round((numerador / denominador) * 10000) / 100;
}

/** Ticket promedio en COP entero: nunca Infinity ni NaN. */
function ticketPromedio(ingresos: number, rentasConIngresos: number): number {
  if (rentasConIngresos <= 0) return 0;
  return Math.round(ingresos / rentasConIngresos);
}

/** Variación porcentual contra el periodo anterior; `null` si el anterior es 0. */
function variacion(actual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return Math.round(((actual - anterior) / anterior) * 10000) / 100;
}

function kpi(actual: number, anterior: number): KpiPeriodo {
  return { actual, anterior, variacion: variacion(actual, anterior) };
}

function toPeriodoRef({ desde, hasta }: DateRange): PeriodoRef {
  return { desde, hasta, dias: diffDaysInclusive(desde, hasta) };
}

/** Suma de los totales por renta: el total de ingresos del periodo. */
function sumarTotales(totales: Map<string, number>): number {
  let acc = 0;
  for (const valor of totales.values()) acc += valor;
  return acc;
}

/**
 * Rentas que cuentan como carro ocupado. El filtro se repite en el service
 * aunque la consulta ya lo aplique, para que la métrica no dependa de un solo
 * punto de la cadena.
 */
function soloOcupantes(rentas: Renta[]): Renta[] {
  return rentas.filter((renta) => RENTA_ESTADOS_OCUPACION.includes(renta.estado));
}

/** Días-carro rentados dentro del periodo, prorrateando las rentas que cruzan el borde. */
function diasCarroRentados(rentas: Renta[], periodo: DateRange): number {
  return soloOcupantes(rentas).reduce(
    (acc, renta) =>
      acc + overlapDays(renta.fecha_inicio, renta.fecha_fin, periodo.desde, periodo.hasta),
    0
  );
}

/** Clave del bucket temporal de una fecha: lunes (semana) o 'YYYY-MM' (mes). */
function bucketKey(fecha: string, agrupar: AgruparPor): string {
  return agrupar === 'mes' ? fecha.slice(0, 7) : mondayOf(fecha);
}

/**
 * Todos los buckets del periodo, en orden y con los buckets sin movimiento ya
 * en cero, para que la gráfica no tenga huecos. Se alinean al calendario
 * (lunes / mes natural) y se recortan a los bordes del periodo, de modo que una
 * semana o un mes parcial sigue apareciendo.
 */
function buildBuckets(periodo: DateRange, agrupar: AgruparPor): IngresosTiempoPunto[] {
  const puntos: IngresosTiempoPunto[] = [];

  if (agrupar === 'semana') {
    const ultimoLunes = mondayOf(periodo.hasta);

    for (let inicio = mondayOf(periodo.desde); inicio <= ultimoLunes; inicio = addDays(inicio, 7)) {
      const finBucket = addDays(inicio, 6);
      puntos.push({
        periodo: inicio,
        desde: inicio < periodo.desde ? periodo.desde : inicio,
        hasta: finBucket > periodo.hasta ? periodo.hasta : finBucket,
        ingresos: 0,
        rentas: 0,
      });
    }

    return puntos;
  }

  const inicioPeriodo = toUtcDate(periodo.desde);
  const claveFinal = periodo.hasta.slice(0, 7);
  const cursor = new Date(Date.UTC(inicioPeriodo.getUTCFullYear(), inicioPeriodo.getUTCMonth(), 1));

  for (;;) {
    const year = cursor.getUTCFullYear();
    const mes = cursor.getUTCMonth() + 1;
    const clave = `${year}-${String(mes).padStart(2, '0')}`;
    if (clave > claveFinal) break;

    const primeroBucket = `${clave}-01`;
    const finBucket = addDays(new Date(Date.UTC(year, mes, 1)).toISOString().slice(0, 10), -1);

    puntos.push({
      periodo: clave,
      desde: primeroBucket < periodo.desde ? periodo.desde : primeroBucket,
      hasta: finBucket > periodo.hasta ? periodo.hasta : finBucket,
      ingresos: 0,
      rentas: 0,
    });

    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return puntos;
}

export class ReportsService {
  async dashboard(): Promise<DashboardReport> {
    const [flota, rentasActivas, totalClientes, ingresosMes] = await Promise.all([
      this.estadoFlota(),
      reportsRepository.countActiveRentas(),
      reportsRepository.countActiveClients(),
      reportsRepository.sumIngresosMes(),
    ]);

    const porEstado = new Map(flota.items.map((item) => [item.estado, item.cantidad]));

    return {
      total_carros: flota.total_carros,
      carros_disponibles: porEstado.get('disponibles') ?? 0,
      carros_rentados: porEstado.get('rentados') ?? 0,
      carros_mantenimiento: porEstado.get('mantenimiento') ?? 0,
      rentas_activas: rentasActivas,
      total_clientes: totalClientes,
      ingresos_mes: ingresosMes,
    };
  }

  async rentasRecientes(): Promise<RentaReciente[]> {
    const all = await rentalsRepository.list({});

    const sorted = [...all]
      .sort((a, b) => b.fecha_registro.localeCompare(a.fecha_registro))
      .slice(0, RENTAS_RECIENTES_LIMIT);

    return Promise.all(
      sorted.map(async (renta) => {
        const [cliente, carro] = await Promise.all([
          clientsRepository.findById(renta.id_cliente),
          vehiclesRepository.findById(renta.id_carro),
        ]);

        return {
          ...renta,
          carro: carro ? { nombre: carro.nombre } : null,
          cliente: cliente
            ? { nombres: cliente.nombres, apellidos: cliente.apellidos }
            : null,
        };
      })
    );
  }

  async ingresosMensuales(months: number): Promise<{ mes: string; total: number }[]> {
    return reportsRepository.sumIngresosPorMes(months);
  }

  async estadoFlota(): Promise<EstadoFlotaReporte> {
    const [carrosByEstado, carrosRentados] = await Promise.all([
      reportsRepository.countCarsByEstado(),
      reportsRepository.countRentedCars(),
    ]);

    const total = carrosByEstado.reduce((acc, item) => acc + item.cantidad, 0);

    const countFor = (estado: string): number =>
      carrosByEstado.find((item) => item.estado === estado)?.cantidad ?? 0;

    const activos = countFor('activo');
    const mantenimiento = countFor('mantenimiento');
    const rentados = Math.min(Math.max(0, carrosRentados), activos);

    const buckets: { estado: FlotaEstado; cantidad: number }[] = [
      { estado: 'disponibles', cantidad: activos - rentados },
      { estado: 'rentados', cantidad: rentados },
      { estado: 'mantenimiento', cantidad: mantenimiento },
    ];

    const items = buckets
      .filter((bucket) => bucket.cantidad > 0)
      .map((bucket) => ({
        estado: bucket.estado,
        cantidad: bucket.cantidad,
        porcentaje:
          total === 0 ? 0 : Math.round((bucket.cantidad / total) * 10000) / 100,
      }));

    return { total_carros: total, items };
  }

  async resumenPeriodo(periodo: DateRange): Promise<ResumenPeriodo> {
    const anterior = previousPeriod(periodo);

    const [actual, previo] = await Promise.all([
      this.calcularMetricasPeriodo(periodo),
      this.calcularMetricasPeriodo(anterior),
    ]);

    return {
      periodo: toPeriodoRef(periodo),
      periodo_anterior: toPeriodoRef(anterior),
      ingresos: kpi(actual.ingresos, previo.ingresos),
      rentas_finalizadas: kpi(actual.rentas_finalizadas, previo.rentas_finalizadas),
      ticket_promedio: kpi(actual.ticket_promedio, previo.ticket_promedio),
      tasa_cancelacion: kpi(actual.tasa_cancelacion, previo.tasa_cancelacion),
      ocupacion: kpi(actual.ocupacion, previo.ocupacion),
    };
  }

  async ingresosEnElTiempo(
    periodo: DateRange,
    agrupar: AgruparPor = 'semana'
  ): Promise<IngresosTiempoReporte> {
    const [rentas, pagos] = await Promise.all([
      reportsRepository.listRentasByPeriodo(periodo.desde, periodo.hasta),
      reportsRepository.pagosCompletadosEnRango(periodo.desde, periodo.hasta),
    ]);

    const { totales } = await this.ingresosPorRenta(pagos, rentas);
    const puntos = buildBuckets(periodo, agrupar);
    const porPunto = new Map(puntos.map((punto) => [punto.periodo, punto]));

    // El ingreso se agrupa por la fecha del PAGO (misma regla que el Dashboard).
    for (const pago of pagos) {
      if (totales.get(pago.id_renta) === undefined) continue;

      const punto = porPunto.get(bucketKey(pago.fecha_pago, agrupar));
      if (punto) punto.ingresos += pago.total_pago;
    }

    // La renta se agrupa por su fecha_registro y sólo cuenta si generó ingreso.
    for (const renta of rentas) {
      const monto = totales.get(renta.id_renta) ?? 0;
      if (monto <= 0) continue;

      const punto = porPunto.get(bucketKey(renta.fecha_registro, agrupar));
      if (!punto) continue;

      punto.rentas += 1;
    }

    return {
      desde: periodo.desde,
      hasta: periodo.hasta,
      dias: diffDaysInclusive(periodo.desde, periodo.hasta),
      agrupar,
      total_ingresos: puntos.reduce((acc, punto) => acc + punto.ingresos, 0),
      total_rentas: puntos.reduce((acc, punto) => acc + punto.rentas, 0),
      puntos,
    };
  }

  async rankingVehiculos(periodo: DateRange, limite = 10): Promise<RankingVehiculosReporte> {
    const [rentas, ocupadas, pagos, carros] = await Promise.all([
      reportsRepository.listRentasByPeriodo(periodo.desde, periodo.hasta),
      reportsRepository.listRentasOcupadas(periodo),
      reportsRepository.pagosCompletadosEnRango(periodo.desde, periodo.hasta),
      reportsRepository.listCarros(),
    ]);

    const { totales, rentaById } = await this.ingresosPorRenta(pagos, rentas);
    const carroById = new Map(carros.map((carro) => [carro.id_carro, carro]));
    const porCarro = new Map<string, RankingVehiculoItem>();

    const itemFor = (id_carro: string): RankingVehiculoItem => {
      const existing = porCarro.get(id_carro);
      if (existing) return existing;

      const carro = carroById.get(id_carro);
      const item: RankingVehiculoItem = {
        id_carro,
        nombre: carro?.nombre ?? null,
        id_marca: carro?.id_marca ?? null,
        id_categoria: carro?.id_categoria ?? null,
        rentas: 0,
        ingresos: 0,
        dias_rentados: 0,
      };
      porCarro.set(id_carro, item);
      return item;
    };

    // `rentas` son las registradas en el periodo (criterio de conteo), mientras el
    // ingreso se atribuye por `fecha_pago`, así que se reparte por la renta real
    // de cada pago y no por las del periodo.
    for (const renta of rentas) {
      itemFor(renta.id_carro).rentas += 1;
    }

    for (const [id_renta, total] of totales) {
      const renta = rentaById.get(id_renta);
      if (renta) itemFor(renta.id_carro).ingresos += total;
    }

    for (const renta of soloOcupantes(ocupadas)) {
      itemFor(renta.id_carro).dias_rentados += overlapDays(
        renta.fecha_inicio,
        renta.fecha_fin,
        periodo.desde,
        periodo.hasta
      );
    }

    const ordenados = [...porCarro.values()].sort(
      (a, b) =>
        b.ingresos - a.ingresos ||
        b.dias_rentados - a.dias_rentados ||
        (a.nombre ?? a.id_carro).localeCompare(b.nombre ?? b.id_carro)
    );

    return {
      desde: periodo.desde,
      hasta: periodo.hasta,
      dias: diffDaysInclusive(periodo.desde, periodo.hasta),
      limite,
      total: ordenados.length,
      items: ordenados.slice(0, limite),
    };
  }

  async ingresosPorCategoria(periodo: DateRange): Promise<IngresosCategoriasReporte> {
    const [rentas, pagos, carros] = await Promise.all([
      reportsRepository.listRentasByPeriodo(periodo.desde, periodo.hasta),
      reportsRepository.pagosCompletadosEnRango(periodo.desde, periodo.hasta),
      reportsRepository.listCarros(),
    ]);

const { totales, rentaById } = await this.ingresosPorRenta(pagos, rentas);
    const categoriaByCarro = new Map(
      carros.map((carro) => [carro.id_carro, normalizeIdentifier(carro.id_categoria ?? '')])
    );

    const ingresosByCategoria = new Map<string, number>();
    for (const [id_renta, total] of totales) {
      const renta = rentaById.get(id_renta);
      if (!renta) continue;
      const id_categoria = categoriaByCarro.get(renta.id_carro) || CATEGORIA_SIN_DATOS;
      ingresosByCategoria.set(id_categoria, (ingresosByCategoria.get(id_categoria) ?? 0) + total);
    }

    const porCategoria = new Map<string, IngresosCategoriaItem>();

    // El conteo de rentas es por `fecha_registro`; el ingreso, por `fecha_pago`.
    for (const renta of rentas) {
      const id_categoria = categoriaByCarro.get(renta.id_carro) || CATEGORIA_SIN_DATOS;
      const item = porCategoria.get(id_categoria) ?? { id_categoria, rentas: 0, ingresos: 0 };
      item.rentas += 1;
      porCategoria.set(id_categoria, item);
    }

    for (const [id_categoria, total] of ingresosByCategoria) {
      const item = porCategoria.get(id_categoria) ?? { id_categoria, rentas: 0, ingresos: 0 };
      item.ingresos = total;
      porCategoria.set(id_categoria, item);
    }


    const items = [...porCategoria.values()].sort(
      (a, b) =>
        b.ingresos - a.ingresos ||
        b.rentas - a.rentas ||
        a.id_categoria.localeCompare(b.id_categoria)
    );

    return {
      desde: periodo.desde,
      hasta: periodo.hasta,
      dias: diffDaysInclusive(periodo.desde, periodo.hasta),
      total_ingresos: items.reduce((acc, item) => acc + item.ingresos, 0),
      items,
    };
  }

  /**
   * ÚNICA regla de ingresos del módulo: `pagosCompletadosEnRango` (pagos
   * `completado` con `fecha_pago` dentro del rango, bordes inclusivos — la misma
   * que usa el Dashboard) agrupados por renta, DEJANDO FUERA las rentas
   * canceladas.
   *
   * Como una renta cancelada no aporta, `sumarTotales(...)` es exactamente el
   * "Ingresos del mes" del Dashboard cuando el rango es un mes calendario.
   *
   * Devuelve también la renta de cada pago que sí aporta, porque un pago puede
   * pertenecer a una renta registrada fuera del periodo y el ingreso se atribuye
   * por `fecha_pago`, no por `fecha_registro`.
   */
  private async ingresosPorRenta(
    pagos: PagoDelPeriodo[],
    rentasConocidas: Renta[]
  ): Promise<{ totales: Map<string, number>; rentaById: Map<string, Renta> }> {
    const rentaById = new Map(rentasConocidas.map((renta) => [renta.id_renta, renta]));

    // Un pago puede ser de una renta registrada fuera del periodo: hay que
    // consultarla para atribuir el ingreso correctamente.
    const faltantes = [...new Set(pagos.map((pago) => pago.id_renta))].filter(
      (id) => !rentaById.has(id)
    );

    if (faltantes.length > 0) {
      for (const renta of await reportsRepository.findRentasPorIds(faltantes)) {
        rentaById.set(renta.id_renta, renta);
      }
    }

    const totales = new Map<string, number>();
    for (const pago of pagos) {
      const renta = rentaById.get(pago.id_renta);
      if (renta?.estado === RENTA_ESTADO_CANCELADA) continue;
      totales.set(pago.id_renta, (totales.get(pago.id_renta) ?? 0) + pago.total_pago);
    }

    return { totales, rentaById };
  }

  private async calcularMetricasPeriodo(periodo: DateRange): Promise<PeriodoMetricas> {
    const [rentas, ocupadas, pagos, vehiculosNoInactivos] = await Promise.all([
      reportsRepository.listRentasByPeriodo(periodo.desde, periodo.hasta),
      reportsRepository.listRentasOcupadas(periodo),
      reportsRepository.pagosCompletadosEnRango(periodo.desde, periodo.hasta),
      reportsRepository.countVehiculosNoInactivos(),
    ]);

    const { totales } = await this.ingresosPorRenta(pagos, rentas);
    const ingresos = sumarTotales(totales);

    // Tasa de cancelación sobre las rentas ASIGNADAS al periodo (fecha_registro).
    const canceladas = rentaCountByEstado(rentas, RENTA_ESTADO_CANCELADA);

    const dias = diffDaysInclusive(periodo.desde, periodo.hasta);
    const diasOcupados = diasCarroRentados(ocupadas, periodo);

    return {
      dias,
      ingresos,
      rentas_finalizadas: rentaCountByEstado(rentas, RENTA_ESTADO_FINALIZADA),
      ticket_promedio: ticketPromedio(ingresos, totales.size),
      tasa_cancelacion: porcentaje(canceladas, rentas.length),
      ocupacion: porcentaje(diasOcupados, vehiculosNoInactivos * dias),
    };
  }
}

function rentaCountByEstado(rentas: Renta[], estado: string): number {
  return rentas.filter((renta) => renta.estado === estado).length;
}

export const reportsService = new ReportsService();
