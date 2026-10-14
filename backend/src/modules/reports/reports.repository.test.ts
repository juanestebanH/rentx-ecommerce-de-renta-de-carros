import { describe, it, expect, beforeEach, vi } from 'vitest';
import { reportsRepository } from './reports.repository.js';

type Llamada = { metodo: string; args: unknown[] };

const mocks = vi.hoisted(() => ({
  filas: [] as Record<string, unknown>[],
  llamadas: [] as Llamada[],
}));

vi.mock('../../config/supabase.js', () => {
  const builder: Record<string, unknown> = {
    then: (resolve: (value: unknown) => unknown) =>
      Promise.resolve({ data: mocks.filas, error: null }).then(resolve),
  };

  for (const metodo of ['select', 'eq', 'gte', 'lte', 'in', 'neq', 'order']) {
    builder[metodo] = (...args: unknown[]) => {
      mocks.llamadas.push({ metodo, args });
      return builder;
    };
  }

  return {
    supabase: {
      from: (tabla: string) => {
        mocks.llamadas.push({ metodo: 'from', args: [tabla] });
        return builder;
      },
    },
  };
});

function llamada(metodo: string): unknown[] | undefined {
  return mocks.llamadas.find((item) => item.metodo === metodo)?.args;
}

function mesActualUtc(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

function mesPrevioUtc(): string {
  const { year, month } = mesActualUtc();
  const total = month - 2;
  return `${year + Math.floor(total / 12)}-${String(((total % 12) + 12) % 12 + 1).padStart(2, '0')}`;
}

beforeEach(() => {
  mocks.filas = [];
  mocks.llamadas = [];
});

describe('reportsRepository — regla compartida de ingresos', () => {
  it('sumIngresosMes delega en sumIngresosEnRango con el mes calendario completo', async () => {
    mocks.filas = [{ total_pago: 100 }];
    const spy = vi.spyOn(reportsRepository, 'sumIngresosEnRango');
    const { year, month } = mesActualUtc();
    const ultimoDia = new Date(Date.UTC(year, month, 0)).getUTCDate();

    await reportsRepository.sumIngresosMes(0);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      `${year}-${String(month).padStart(2, '0')}-01`,
      `${year}-${String(month).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`
    );

    spy.mockRestore();
  });

  it('filtra siempre por estado=completado y por fecha_pago con bordes inclusivos', async () => {
    mocks.filas = [{ total_pago: 250 }];

    const total = await reportsRepository.sumIngresosEnRango('2026-03-01', '2026-03-31');

    expect(total).toBe(250);
    expect(llamada('from')).toEqual(['pagos']);
    expect(llamada('eq')).toEqual(['estado', 'completado']);
    expect(llamada('gte')).toEqual(['fecha_pago', '2026-03-01']);
    expect(llamada('lte')).toEqual(['fecha_pago', '2026-03-31']);
  });

  it('sumIngresosPorMes reutiliza la misma regla y rellena en cero los meses sin pagos', async () => {
    const mesActual = mesActualUtc();
    const claveActual = `${mesActual.year}-${String(mesActual.month).padStart(2, '0')}`;
    mocks.filas = [
      { id_renta: 'R1', total_pago: 100, fecha_pago: `${claveActual}-02` },
      { id_renta: 'R2', total_pago: 50, fecha_pago: `${claveActual}-20` },
    ];

    const reporte = await reportsRepository.sumIngresosPorMes(2);

    expect(reporte).toEqual([
      { mes: mesPrevioUtc(), total: 0 },
      { mes: claveActual, total: 150 },
    ]);
    expect(llamada('eq')).toEqual(['estado', 'completado']);
  });

  it('devuelve 0 cuando no hay pagos en el rango', async () => {
    mocks.filas = [];

    await expect(reportsRepository.sumIngresosEnRango('2026-03-01', '2026-03-31')).resolves.toBe(0);
  });

  it('una renta cancelada con pago completado no suma ingresos en sumIngresosEnRango', async () => {
    mocks.filas = [{ id_renta: 'R1', total_pago: 150000, fecha_pago: '2026-03-10' }];
    const spy = vi.spyOn(reportsRepository, 'findRentasPorIds').mockResolvedValueOnce([
      { id_renta: 'R1', estado: 'cancelada' } as any,
    ]);

    const total = await reportsRepository.sumIngresosEnRango('2026-03-01', '2026-03-31');
    expect(total).toBe(0);
    expect(spy).toHaveBeenCalledWith(['R1']);
    spy.mockRestore();
  });

  it('findRentasPorIds devuelve vacío sin ids para no gastar una consulta', async () => {
    await expect(reportsRepository.findRentasPorIds([])).resolves.toEqual([]);
    expect(llamada('from')).toBeUndefined();
  });

  it('listRentasByPeriodo filtra por fecha_registro con bordes inclusivos', async () => {
    mocks.filas = [];

    await reportsRepository.listRentasByPeriodo('2026-03-01', '2026-03-31');

    expect(llamada('from')).toEqual(['rentas']);
    expect(llamada('gte')).toEqual(['fecha_registro', '2026-03-01']);
    expect(llamada('lte')).toEqual(['fecha_registro', '2026-03-31']);
  });

  it('countVehiculosNoInactivos excluye el estado inactivo', async () => {
    mocks.filas = [];

    await reportsRepository.countVehiculosNoInactivos();

    expect(llamada('from')).toEqual(['carros']);
    expect(llamada('neq')).toEqual(['estado', 'inactivo']);
  });
});