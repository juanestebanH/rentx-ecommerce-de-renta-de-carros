import { describe, it, expect, beforeEach, vi } from 'vitest';
import { reportsService } from './reports.service.js';
import type { Renta } from '../rentals/rentals.types.js';
import type { PagoDelPeriodo, ReporteCarro } from './reports.types.js';

const mocks = vi.hoisted(() => ({
  countCarsByEstado: vi.fn(),
  countRentedCars: vi.fn(),
  countActiveRentas: vi.fn(),
  countActiveClients: vi.fn(),
  sumIngresosMes: vi.fn(),
  sumIngresosPorMes: vi.fn(),
  pagosCompletadosEnRango: vi.fn(),
  listRentasByPeriodo: vi.fn(),
  listRentasOcupadas: vi.fn(),
  findRentasPorIds: vi.fn(),
  countVehiculosNoInactivos: vi.fn(),
  listCarros: vi.fn(),
}));

vi.mock('./reports.repository.js', () => ({
  reportsRepository: {
    countCarsByEstado: mocks.countCarsByEstado,
    countRentedCars: mocks.countRentedCars,
    countActiveRentas: mocks.countActiveRentas,
    countActiveClients: mocks.countActiveClients,
    sumIngresosMes: mocks.sumIngresosMes,
    sumIngresosPorMes: mocks.sumIngresosPorMes,
    pagosCompletadosEnRango: mocks.pagosCompletadosEnRango,
    listRentasByPeriodo: mocks.listRentasByPeriodo,
    listRentasOcupadas: mocks.listRentasOcupadas,
    findRentasPorIds: mocks.findRentasPorIds,
    countVehiculosNoInactivos: mocks.countVehiculosNoInactivos,
    listCarros: mocks.listCarros,
  },
}));

vi.mock('../rentals/rentals.repository.js', () => ({
  rentalsRepository: {
    list: vi.fn(),
  },
}));

vi.mock('../vehicles/vehicles.repository.js', () => ({
  vehiclesRepository: {
    findById: vi.fn(),
  },
}));

vi.mock('../clients/clients.repository.js', () => ({
  clientsRepository: {
    findById: vi.fn(),
  },
}));

function makeRenta(overrides: Partial<Renta> = {}): Renta {
  return {
    id_renta: 'RENTA-1',
    fecha_inicio: '2026-03-01',
    fecha_fin: '2026-03-05',
    fecha_registro: '2026-03-01',
    dias_duracion: 5,
    estado: 'finalizada',
    id_carro: 'aaa-001',
    id_cliente: 'lic-001',
    ...overrides,
  };
}

function makePago(overrides: Partial<PagoDelPeriodo> = {}): PagoDelPeriodo {
  return {
    id_renta: 'RENTA-1',
    total_pago: 100000,
    fecha_pago: '2026-03-02',
    ...overrides,
  };
}

function makeCarro(overrides: Partial<ReporteCarro> = {}): ReporteCarro {
  return {
    id_carro: 'aaa-001',
    nombre: 'Carro Uno',
    id_marca: 'honda',
    id_categoria: 'sedan',
    ...overrides,
  };
}

/** Periodo con el que se comportan todos los tests: marzo 2026 (31 días). */
const MARZO = { desde: '2026-03-01', hasta: '2026-03-31' };

/**
 * Deja el repositorio en blanco salvo lo que se pase por parámetro, de modo que
 * el periodo anterior (2026-01-29 .. 2026-02-28) siempre quede en cero salvo
 * que se diga lo contrario.
 */
function soloEnMarzo(datos: {
  rentas?: Renta[];
  ocupadas?: Renta[];
  pagos?: PagoDelPeriodo[];
  carros?: ReporteCarro[];
  vehiculosNoInactivos?: number;
}): void {
  mocks.listRentasByPeriodo.mockImplementation(async (desde: string) =>
    desde === MARZO.desde ? (datos.rentas ?? []) : []
  );
  mocks.listRentasOcupadas.mockImplementation(async ({ desde }: { desde: string }) =>
    desde === MARZO.desde ? (datos.ocupadas ?? []) : []
  );
  mocks.pagosCompletadosEnRango.mockImplementation(async (desde: string) =>
    desde === MARZO.desde ? (datos.pagos ?? []) : []
  );
  mocks.findRentasPorIds.mockResolvedValue([]);
  mocks.countVehiculosNoInactivos.mockResolvedValue(datos.vehiculosNoInactivos ?? 0);
  mocks.listCarros.mockResolvedValue(datos.carros ?? []);
}

beforeEach(() => {
  vi.clearAllMocks();
  soloEnMarzo({});
});

describe('ReportsService.estadoFlota', () => {
  it('parte los carros activos entre disponibles y rentados', async () => {
    mocks.countCarsByEstado.mockResolvedValue([
      { estado: 'activo', cantidad: 6 },
      { estado: 'mantenimiento', cantidad: 2 },
      { estado: 'inactivo', cantidad: 2 },
    ]);
    mocks.countRentedCars.mockResolvedValue(2);

    const reporte = await reportsService.estadoFlota();

    expect(reporte.total_carros).toBe(10);
    expect(reporte.items).toEqual([
      { estado: 'disponibles', cantidad: 4, porcentaje: 40 },
      { estado: 'rentados', cantidad: 2, porcentaje: 20 },
      { estado: 'mantenimiento', cantidad: 2, porcentaje: 20 },
    ]);
  });

  it('deja los inactivos fuera del desglose pero dentro del total', async () => {
    mocks.countCarsByEstado.mockResolvedValue([
      { estado: 'activo', cantidad: 8 },
      { estado: 'inactivo', cantidad: 2 },
    ]);
    mocks.countRentedCars.mockResolvedValue(4);

    const reporte = await reportsService.estadoFlota();

    expect(reporte.total_carros).toBe(10);
    expect(reporte.items.map((item) => item.estado)).not.toContain('inactivo');

    const suma = reporte.items.reduce((acc, item) => acc + item.porcentaje, 0);
    expect(suma).toBe(80);
  });

  it('omite los buckets que quedan en cero', async () => {
    mocks.countCarsByEstado.mockResolvedValue([{ estado: 'activo', cantidad: 3 }]);
    mocks.countRentedCars.mockResolvedValue(3);

    const reporte = await reportsService.estadoFlota();

    expect(reporte.items).toEqual([{ estado: 'rentados', cantidad: 3, porcentaje: 100 }]);
  });

  it('acota los rentados a los activos cuando un carro rentado no está activo', async () => {
    mocks.countCarsByEstado.mockResolvedValue([
      { estado: 'activo', cantidad: 2 },
      { estado: 'mantenimiento', cantidad: 1 },
    ]);
    mocks.countRentedCars.mockResolvedValue(3);

    const reporte = await reportsService.estadoFlota();

    expect(reporte.total_carros).toBe(3);
    expect(reporte.items).toEqual([
      { estado: 'rentados', cantidad: 2, porcentaje: 66.67 },
      { estado: 'mantenimiento', cantidad: 1, porcentaje: 33.33 },
    ]);

    const clasificada = reporte.items.reduce((acc, item) => acc + item.cantidad, 0);
    expect(clasificada).toBe(reporte.total_carros);
  });

  it('devuelve total cero y sin items cuando no hay carros', async () => {
    mocks.countCarsByEstado.mockResolvedValue([]);
    mocks.countRentedCars.mockResolvedValue(0);

    expect(await reportsService.estadoFlota()).toEqual({ total_carros: 0, items: [] });
  });

  it('no desglosa nada si hay rentadas sin carros registrados', async () => {
    mocks.countCarsByEstado.mockResolvedValue([]);
    mocks.countRentedCars.mockResolvedValue(2);

    const reporte = await reportsService.estadoFlota();

    expect(reporte).toEqual({ total_carros: 0, items: [] });
  });
});

describe('ReportsService.dashboard', () => {
  it('toma los campos de flota del reporte de estado y conserva su contrato', async () => {
    mocks.countCarsByEstado.mockResolvedValue([
      { estado: 'activo', cantidad: 6 },
      { estado: 'mantenimiento', cantidad: 2 },
      { estado: 'inactivo', cantidad: 2 },
    ]);
    mocks.countRentedCars.mockResolvedValue(2);
    mocks.countActiveRentas.mockResolvedValue(3);
    mocks.countActiveClients.mockResolvedValue(7);
    mocks.sumIngresosMes.mockResolvedValue(1500000);

    const report = await reportsService.dashboard();

    expect(report).toEqual({
      total_carros: 10,
      carros_disponibles: 4,
      carros_rentados: 2,
      carros_mantenimiento: 2,
      rentas_activas: 3,
      total_clientes: 7,
      ingresos_mes: 1500000,
    });
  });
});

describe('ReportsService.resumenPeriodo', () => {
  it('devuelve todo en cero y variación null en un periodo vacío', async () => {
    soloEnMarzo({ vehiculosNoInactivos: 5 });

    const reporte = await reportsService.resumenPeriodo(MARZO);

    expect(reporte.periodo).toEqual({ ...MARZO, dias: 31 });
    expect(reporte.periodo_anterior).toEqual({
      desde: '2026-01-29',
      hasta: '2026-02-28',
      dias: 31,
    });
    expect(reporte.ingresos).toEqual({ actual: 0, anterior: 0, variacion: null });
    expect(reporte.rentas_finalizadas).toEqual({ actual: 0, anterior: 0, variacion: null });
    expect(reporte.ticket_promedio).toEqual({ actual: 0, anterior: 0, variacion: null });
    expect(reporte.tasa_cancelacion).toEqual({ actual: 0, anterior: 0, variacion: null });
    expect(reporte.ocupacion).toEqual({ actual: 0, anterior: 0, variacion: null });
  });

  it('excluye del ingreso las rentas canceladas pero las cuenta en la tasa', async () => {
    soloEnMarzo({
      vehiculosNoInactivos: 2,
      carros: [makeCarro()],
      rentas: [
        makeRenta({ id_renta: 'RENTA-OK', estado: 'finalizada' }),
        makeRenta({ id_renta: 'RENTA-CANCEL', estado: 'cancelada' }),
        makeRenta({ id_renta: 'RENTA-PEND', estado: 'pendiente' }),
      ],
      // La cancelada tiene un pago completado en el periodo: aun así no suma.
      pagos: [
        makePago({ id_renta: 'RENTA-OK', total_pago: 400000 }),
        makePago({ id_renta: 'RENTA-CANCEL', total_pago: 250000 }),
      ],
    });

    const reporte = await reportsService.resumenPeriodo(MARZO);

    expect(reporte.ingresos.actual).toBe(400000);
    expect(reporte.tasa_cancelacion.actual).toBe(33.33);
    expect(reporte.rentas_finalizadas.actual).toBe(1);
    // 400000 / 1 renta que generó ingreso (la cancelada no cuenta).
    expect(reporte.ticket_promedio.actual).toBe(400000);
  });

  it('excluye el ingreso de una renta cancelada aunque su pago caiga en el periodo', async () => {
    soloEnMarzo({
      vehiculosNoInactivos: 1,
      rentas: [makeRenta({ id_renta: 'RENTA-CANCEL', estado: 'cancelada' })],
      pagos: [makePago({ id_renta: 'RENTA-CANCEL', total_pago: 90000 })],
    });

    const reporte = await reportsService.resumenPeriodo(MARZO);

    expect(reporte.ingresos.actual).toBe(0);
    expect(reporte.tasa_cancelacion.actual).toBe(100);
  });

  it('prorratea en ocupación las rentas que cruzan el borde del periodo', async () => {
    soloEnMarzo({
      vehiculosNoInactivos: 4,
      ocupadas: [
        // Entra en febrero, sale el 5 de marzo -> 5 días dentro de marzo.
        makeRenta({ fecha_inicio: '2026-02-25', fecha_fin: '2026-03-05' }),
        // Empieza el 28 de marzo, sigue en abril -> 4 días dentro de marzo.
        makeRenta({ fecha_inicio: '2026-03-28', fecha_fin: '2026-04-10' }),
      ],
    });

    const reporte = await reportsService.resumenPeriodo(MARZO);

    // 9 días-carro / (4 vehículos × 31 días) = 7.26 %
    expect(reporte.ocupacion.actual).toBe(7.26);
  });

  it('no cuenta como ocupación una renta pendiente', async () => {
    soloEnMarzo({
      vehiculosNoInactivos: 4,
      ocupadas: [makeRenta({ estado: 'pendiente', fecha_inicio: '2026-03-01', fecha_fin: '2026-03-31' })],
    });

    const reporte = await reportsService.resumenPeriodo(MARZO);

    expect(reporte.ocupacion.actual).toBe(0);
  });

  it('devuelve variación null cuando el periodo anterior vale 0, nunca Infinity ni NaN', async () => {
    soloEnMarzo({
      vehiculosNoInactivos: 1,
      rentas: [makeRenta({ id_renta: 'RENTA-NUEVA', estado: 'finalizada' })],
      ocupadas: [
        makeRenta({ id_renta: 'RENTA-NUEVA', fecha_inicio: '2026-03-01', fecha_fin: '2026-03-31' }),
      ],
      pagos: [makePago({ id_renta: 'RENTA-NUEVA', total_pago: 120000 })],
    });

    const reporte = await reportsService.resumenPeriodo(MARZO);

    expect(reporte.ingresos).toEqual({ actual: 120000, anterior: 0, variacion: null });
    expect(reporte.ocupacion).toEqual({ actual: 100, anterior: 0, variacion: null });
    for (const kpi of Object.values(reporte)) {
      if (typeof kpi === 'object' && kpi !== null && 'variacion' in kpi) {
        expect(Number.isFinite(kpi.variacion ?? 0)).toBe(true);
      }
    }
  });

  it('calcula la variación porcentual contra el periodo anterior de igual duración', async () => {
    mocks.listRentasByPeriodo.mockImplementation(async (desde: string) => {
      if (desde === MARZO.desde) return [makeRenta({ id_renta: 'R-M', estado: 'finalizada' })];
      return [makeRenta({ id_renta: 'R-P', estado: 'finalizada' })];
    });
    mocks.pagosCompletadosEnRango.mockImplementation(async (desde: string) =>
      desde === MARZO.desde ? [makePago({ id_renta: 'R-M', total_pago: 250000 })] : [makePago({ id_renta: 'R-P', total_pago: 200000 })]
    );
    mocks.findRentasPorIds.mockResolvedValue([]);
    mocks.countVehiculosNoInactivos.mockResolvedValue(1);
    mocks.listCarros.mockResolvedValue([]);

    const reporte = await reportsService.resumenPeriodo(MARZO);

    expect(reporte.ingresos).toEqual({ actual: 250000, anterior: 200000, variacion: 25 });
    expect(reporte.rentas_finalizadas.variacion).toBe(0);
    expect(reporte.ticket_promedio.actual).toBe(250000);
  });

  it('los ingresos del resumen coinciden con los del Dashboard para el mismo mes', async () => {
    const pagos = [
      makePago({ id_renta: 'RENTA-1', total_pago: 250000, fecha_pago: '2026-03-05' }),
      makePago({ id_renta: 'RENTA-2', total_pago: 175000, fecha_pago: '2026-03-22' }),
    ];

    mocks.pagosCompletadosEnRango.mockResolvedValue(pagos);
    mocks.listRentasByPeriodo.mockImplementation(async (desde: string) =>
      desde === MARZO.desde
        ? [
            makeRenta({ id_renta: 'RENTA-1', fecha_registro: '2026-03-05' }),
            makeRenta({ id_renta: 'RENTA-2', fecha_registro: '2026-03-20' }),
          ]
        : []
    );
    mocks.listRentasOcupadas.mockResolvedValue([]);
    mocks.findRentasPorIds.mockResolvedValue([]);
    mocks.countVehiculosNoInactivos.mockResolvedValue(4);
    mocks.listCarros.mockResolvedValue([]);

    // El Dashboard pide el mes por `sumIngresosMes`, que ya delega en la misma
    // regla de rango; 250000 + 175000.
    mocks.sumIngresosMes.mockResolvedValue(425000);
    mocks.countCarsByEstado.mockResolvedValue([{ estado: 'activo', cantidad: 4 }]);
    mocks.countRentedCars.mockResolvedValue(1);
    mocks.countActiveRentas.mockResolvedValue(2);
    mocks.countActiveClients.mockResolvedValue(5);

    const dashboard = await reportsService.dashboard();
    const resumen = await reportsService.resumenPeriodo(MARZO);

    expect(resumen.ingresos.actual).toBe(425000);
    expect(dashboard.ingresos_mes).toBe(resumen.ingresos.actual);
    expect(mocks.pagosCompletadosEnRango).toHaveBeenCalledWith(MARZO.desde, MARZO.hasta);
  });

  it('renta cancelada con pago completado no suma ingresos ni en Dashboard ni en Reportes', async () => {
    const pagos = [makePago({ id_renta: 'RENTA-C', total_pago: 780000, fecha_pago: '2026-03-15' })];

    mocks.pagosCompletadosEnRango.mockResolvedValue(pagos);
    mocks.listRentasByPeriodo.mockResolvedValue([
      makeRenta({ id_renta: 'RENTA-C', estado: 'cancelada', fecha_registro: '2026-03-10' }),
    ]);
    mocks.listRentasOcupadas.mockResolvedValue([]);
    mocks.findRentasPorIds.mockResolvedValue([]);
    mocks.countVehiculosNoInactivos.mockResolvedValue(2);
    mocks.listCarros.mockResolvedValue([makeCarro()]);

    mocks.sumIngresosMes.mockResolvedValue(0);
    mocks.countCarsByEstado.mockResolvedValue([{ estado: 'activo', cantidad: 2 }]);
    mocks.countRentedCars.mockResolvedValue(0);
    mocks.countActiveRentas.mockResolvedValue(0);
    mocks.countActiveClients.mockResolvedValue(1);

    const dashboard = await reportsService.dashboard();
    const resumen = await reportsService.resumenPeriodo(MARZO);

    expect(resumen.ingresos.actual).toBe(0);
    expect(dashboard.ingresos_mes).toBe(0);
    expect(dashboard.ingresos_mes).toBe(resumen.ingresos.actual);
  });
});

describe('ReportsService.ingresosEnElTiempo', () => {
  it('rellena en cero los puntos sin movimiento para que la gráfica no tenga huecos', async () => {
    soloEnMarzo({
      pagos: [makePago({ id_renta: 'RENTA-1', total_pago: 100000, fecha_pago: '2026-03-04' })],
      rentas: [makeRenta({ id_renta: 'RENTA-1', fecha_registro: '2026-03-04' })],
    });

    const reporte = await reportsService.ingresosEnElTiempo(MARZO, 'semana');

// 2026-03-01 es domingo: la primera semana va del 23 de feb al 1 de marzo y
// la última del 30 de marzo al 5 de abril, así que hay 6 buckets en marzo.
expect(reporte.puntos).toHaveLength(6);
expect(reporte.puntos[0]).toEqual({
      periodo: '2026-02-23',
      desde: '2026-03-01',
      hasta: '2026-03-01',
      ingresos: 0,
      rentas: 0,
    });
    expect(reporte.puntos[1]).toEqual({
      periodo: '2026-03-02',
      desde: '2026-03-02',
      hasta: '2026-03-08',
      ingresos: 100000,
      rentas: 1,
    });
    expect(reporte.puntos[5]).toEqual({
      periodo: '2026-03-30',
      desde: '2026-03-30',
      hasta: '2026-03-31',
ingresos: 0,
      rentas: 0,
    });
    expect(reporte.total_ingresos).toBe(100000);
    expect(reporte.total_rentas).toBe(1);
  });

  it('agrupa por mes natural cuando agrupar=mes', async () => {
    soloEnMarzo({
      pagos: [makePago({ id_renta: 'RENTA-1', total_pago: 70000, fecha_pago: '2026-03-31' })],
      rentas: [makeRenta({ id_renta: 'RENTA-1', fecha_registro: '2026-03-31' })],
    });

    const reporte = await reportsService.ingresosEnElTiempo(MARZO, 'mes');

    expect(reporte.puntos).toEqual([
      { periodo: '2026-03', desde: '2026-03-01', hasta: '2026-03-31', ingresos: 70000, rentas: 1 },
    ]);
  });

  it('atribuye el ingreso por fecha_pago aunque la renta se haya registrado antes del periodo', async () => {
    mocks.pagosCompletadosEnRango.mockResolvedValue([
      makePago({ id_renta: 'RENTA-VIEJA', total_pago: 180000, fecha_pago: '2026-03-10' }),
    ]);
    mocks.listRentasByPeriodo.mockResolvedValue([]);
    mocks.listRentasOcupadas.mockResolvedValue([]);
    mocks.countVehiculosNoInactivos.mockResolvedValue(1);
    mocks.listCarros.mockResolvedValue([makeCarro()]);
    mocks.findRentasPorIds.mockResolvedValue([
      makeRenta({ id_renta: 'RENTA-VIEJA', fecha_registro: '2026-02-10' }),
    ]);

    const ranking = await reportsService.rankingVehiculos(MARZO);
    const categorias = await reportsService.ingresosPorCategoria(MARZO);
    const resumen = await reportsService.resumenPeriodo(MARZO);

    // La renta no está en el periodo, pero su pago sí: el ingreso no se pierde.
    expect(ranking.items[0].ingresos).toBe(180000);
    expect(ranking.items[0].rentas).toBe(0);
    expect(categorias.total_ingresos).toBe(180000);
    // Las tres vistas del mismo periodo cuadran con el mismo número.
    expect(categorias.total_ingresos).toBe(resumen.ingresos.actual);
  });

  it('no cuenta una renta sin pago completado en la serie', async () => {
    soloEnMarzo({ rentas: [makeRenta({ id_renta: 'RENTA-SIN-PAGO' })] });

    const reporte = await reportsService.ingresosEnElTiempo(MARZO, 'mes');

    expect(reporte.total_ingresos).toBe(0);
    expect(reporte.total_rentas).toBe(0);
    expect(reporte.puntos[0].ingresos).toBe(0);
  });
});

describe('ReportsService.rankingVehiculos', () => {
  it('ordena por ingresos descendente y aplica el límite', async () => {
    soloEnMarzo({
      carros: [
        makeCarro({ id_carro: 'aaa-001', nombre: 'Barato', id_categoria: 'sedan' }),
        makeCarro({ id_carro: 'aaa-002', nombre: 'Medio', id_categoria: 'suv' }),
        makeCarro({ id_carro: 'aaa-003', nombre: 'Caro', id_categoria: 'suv' }),
      ],
      rentas: [
        makeRenta({ id_renta: 'R1', id_carro: 'aaa-001', fecha_registro: '2026-03-01' }),
        makeRenta({ id_renta: 'R2', id_carro: 'aaa-002', fecha_registro: '2026-03-02' }),
        makeRenta({ id_renta: 'R3', id_carro: 'aaa-003', fecha_registro: '2026-03-03' }),
      ],
      ocupadas: [makeRenta({ id_carro: 'aaa-003', fecha_inicio: '2026-03-03', fecha_fin: '2026-03-09' })],
      pagos: [
        makePago({ id_renta: 'R1', total_pago: 100000, fecha_pago: '2026-03-05' }),
        makePago({ id_renta: 'R2', total_pago: 200000, fecha_pago: '2026-03-06' }),
        makePago({ id_renta: 'R3', total_pago: 300000, fecha_pago: '2026-03-07' }),
      ],
    });

    const reporte = await reportsService.rankingVehiculos(MARZO, 2);

    expect(reporte.limite).toBe(2);
    expect(reporte.total).toBe(3);
    expect(reporte.items.map((item) => item.id_carro)).toEqual(['aaa-003', 'aaa-002']);
    expect(reporte.items[0]).toEqual({
      id_carro: 'aaa-003',
      nombre: 'Caro',
      id_marca: 'honda',
      id_categoria: 'suv',
      rentas: 1,
      ingresos: 300000,
      dias_rentados: 7,
    });
  });

  it('devuelve lista vacía y total 0 cuando no hay rentas en el periodo', async () => {
    soloEnMarzo({ carros: [makeCarro()] });

    const reporte = await reportsService.rankingVehiculos(MARZO);

    expect(reporte.items).toEqual([]);
    expect(reporte.total).toBe(0);
  });

  it('suma el ranking exactamente el mismo ingreso que el resumen del periodo', async () => {
    soloEnMarzo({
      carros: [makeCarro()],
      rentas: [makeRenta({ id_renta: 'R1', fecha_registro: '2026-03-05' })],
      pagos: [makePago({ id_renta: 'R1', total_pago: 330000, fecha_pago: '2026-03-18' })],
    });

    const ranking = await reportsService.rankingVehiculos(MARZO);
    const resumen = await reportsService.resumenPeriodo(MARZO);

    expect(ranking.items.reduce((acc, item) => acc + item.ingresos, 0)).toBe(resumen.ingresos.actual);
  });
});

describe('ReportsService.ingresosPorCategoria', () => {
  it('agrupa por categoría y ordena por ingresos descendente', async () => {
    soloEnMarzo({
      carros: [
        makeCarro({ id_carro: 'aaa-001', id_categoria: 'sedan' }),
        makeCarro({ id_carro: 'aaa-002', id_categoria: ' SUV ' }),
      ],
      rentas: [
        makeRenta({ id_renta: 'R1', id_carro: 'aaa-001', fecha_registro: '2026-03-01' }),
        makeRenta({ id_renta: 'R2', id_carro: 'aaa-001', fecha_registro: '2026-03-02' }),
        makeRenta({ id_renta: 'R3', id_carro: 'aaa-002', fecha_registro: '2026-03-03' }),
      ],
      pagos: [
        makePago({ id_renta: 'R1', total_pago: 100000, fecha_pago: '2026-03-04' }),
        makePago({ id_renta: 'R2', total_pago: 150000, fecha_pago: '2026-03-05' }),
        makePago({ id_renta: 'R3', total_pago: 90000, fecha_pago: '2026-03-06' }),
      ],
    });

    const reporte = await reportsService.ingresosPorCategoria(MARZO);

    expect(reporte.items).toEqual([
      { id_categoria: 'sedan', rentas: 2, ingresos: 250000 },
      { id_categoria: 'suv', rentas: 1, ingresos: 90000 },
    ]);
    expect(reporte.total_ingresos).toBe(340000);
  });
});
