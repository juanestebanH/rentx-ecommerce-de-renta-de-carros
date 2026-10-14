import {
  differenceInCalendarDays,
  format,
  parseISO,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from 'date-fns';
import { es as esDateFns } from 'date-fns/locale';
import { formatCop, capitalizar, formatNumero } from '@/shared/utils/format';
import type {
  AgruparPor,
  IngresosCategoriasReporte,
  IngresoTiempoPunto,
  IngresosTiempoReporte,
  KpiPeriodo,
  RankingVehiculosReporte,
  ResumenPeriodo,
} from '../types/reports.types';

export const MAX_DIAS_PERIODO = 366;
const DIAS_PARA_MENSUAL = 92;
const SEPARADOR = ';';
const PATRON_FECHA = /^\d{4}-\d{2}-\d{2}$/;

export interface Periodo {
  desde: string;
  hasta: string;
}

function iso(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function redondear2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function diasDePeriodo(desde: string, hasta: string): number {
  return differenceInCalendarDays(parseISO(hasta), parseISO(desde)) + 1;
}

export function periodoEsteMes(hoy = new Date()): Periodo {
  return { desde: iso(startOfMonth(hoy)), hasta: iso(hoy) };
}

export function periodoUltimosMeses(meses: number, hoy = new Date()): Periodo {
  return {
    desde: iso(startOfMonth(subMonths(hoy, meses - 1))),
    hasta: iso(hoy),
  };
}

export function periodoEsteAnio(hoy = new Date()): Periodo {
  return { desde: iso(startOfYear(hoy)), hasta: iso(hoy) };
}

/** Ventana inmediatamente anterior de la misma longitud. */
export function periodoAnterior({ desde, hasta }: Periodo): Periodo {
  const dias = diasDePeriodo(desde, hasta);
  const fin = subDays(parseISO(desde), 1);
  return { desde: iso(subDays(fin, dias - 1)), hasta: iso(fin) };
}

export function esPeriodoValido({ desde, hasta }: Periodo): boolean {
  if (!PATRON_FECHA.test(desde) || !PATRON_FECHA.test(hasta)) return false;
  if (desde > hasta) return false;
  return diasDePeriodo(desde, hasta) <= MAX_DIAS_PERIODO;
}

/** Semanal para rangos cortos, mensual para los largos. */
export function agruparPorPeriodo(dias: number): AgruparPor {
  return dias <= DIAS_PARA_MENSUAL ? 'semana' : 'mes';
}

export function etiquetaComparacion(periodo: {
  desde: string;
  hasta: string;
}): string {
  const ini = parseISO(periodo.desde);
  const fin = parseISO(periodo.hasta);
  const rango =
    ini.getFullYear() === fin.getFullYear()
      ? `${format(ini, 'd MMM', { locale: esDateFns })} – ${format(fin, 'd MMM', { locale: esDateFns })}`
      : `${format(ini, 'd MMM yyyy', { locale: esDateFns })} – ${format(fin, 'd MMM yyyy', { locale: esDateFns })}`;
  return `vs. ${rango}`;
}

export function etiquetaBucket(
  periodo: string,
  agrupar: AgruparPor,
): string {
  if (agrupar === 'mes') {
    return capitalizar(format(parseISO(`${periodo}-01`), 'MMM', { locale: esDateFns }));
  }
  return format(parseISO(periodo), 'd MMM', { locale: esDateFns });
}

export function detalleBucket(
  punto: IngresoTiempoPunto,
  agrupar: AgruparPor,
): string {
  const ini = parseISO(punto.desde);
  const fin = parseISO(punto.hasta);
  if (agrupar === 'mes') {
    return `${capitalizar(format(ini, 'MMMM', { locale: esDateFns }))} ${format(ini, 'yyyy')}`;
  }
  return ini.getFullYear() === fin.getFullYear()
    ? `${format(ini, 'd', { locale: esDateFns })} – ${format(fin, 'd MMM', { locale: esDateFns })}`
    : `${format(ini, 'd MMM', { locale: esDateFns })} – ${format(fin, 'd MMM', { locale: esDateFns })}`;
}

export type FormatoKpi = 'cop' | 'numero' | 'porcentaje';

export function formatKpiValor(valor: number, formato: FormatoKpi): string {
  if (formato === 'cop') return formatCop(valor);
  if (formato === 'porcentaje') return `${formatNumero(redondear2(valor))}%`;
  return formatNumero(valor);
}

export type DireccionVariacion = 'sube' | 'baja' | 'empata' | 'sin-datos';

export interface VariacionKpi {
  texto: string;
  direccion: DireccionVariacion;
}

/** Nunca inventa un porcentaje: sin base previa lo dice explícitamente. */
export function variacionKpi(kpi: KpiPeriodo): VariacionKpi {
  if (kpi.anterior === 0) {
    return kpi.actual === 0
      ? { texto: '—', direccion: 'empata' }
      : { texto: 'Sin datos previos', direccion: 'sin-datos' };
  }

  const variacion = kpi.variacion ?? 0;
  if (variacion > 0) {
    return { texto: `+${formatNumero(redondear2(variacion))}%`, direccion: 'sube' };
  }
  if (variacion < 0) {
    return { texto: `${formatNumero(redondear2(variacion))}%`, direccion: 'baja' };
  }
  return { texto: '0%', direccion: 'empata' };
}

export function porcentajeSobreTotal(valor: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((valor / total) * 1000) / 10;
}

function celda(valor: string | number): string {
  const texto = String(valor);
  return texto.includes(SEPARADOR) ? `"${texto}"` : texto;
}

function linea(celdas: (string | number)[]): string {
  return celdas.map(celda).join(SEPARADOR);
}

function numero(valor: number): number {
  return Math.round(valor);
}

function seccionKpis(resumen: ResumenPeriodo): string[] {
  const filas: (string | number)[][] = [
    ['Indicador', 'Periodo', 'Periodo anterior', 'Variación'],
  ];

  const kpis: [string, KpiPeriodo, FormatoKpi][] = [
    ['Ingresos', resumen.ingresos, 'cop'],
    ['Rentas finalizadas', resumen.rentas_finalizadas, 'numero'],
    ['Ticket promedio', resumen.ticket_promedio, 'cop'],
    ['Ocupación', resumen.ocupacion, 'porcentaje'],
  ];

  for (const [etiqueta, kpi, formato] of kpis) {
    const valor = formato === 'porcentaje' ? redondear2 : numero;
    filas.push([
      etiqueta,
      valor(kpi.actual),
      valor(kpi.anterior),
      kpi.variacion === null ? '' : redondear2(kpi.variacion),
    ]);
  }

  return filas.map(linea);
}

function seccionIngresos(reporte: IngresosTiempoReporte): string[] {
  const filas: (string | number)[][] = [
    ['Periodo', 'Desde', 'Hasta', 'Ingresos', 'Rentas'],
  ];

  for (const punto of reporte.puntos) {
    filas.push([
      punto.periodo,
      punto.desde,
      punto.hasta,
      numero(punto.ingresos),
      punto.rentas,
    ]);
  }

  filas.push(['Total', reporte.desde, reporte.hasta, numero(reporte.total_ingresos), reporte.total_rentas]);

  return filas.map(linea);
}

function seccionRanking(
  reporte: RankingVehiculosReporte,
  totalIngresos: number,
): string[] {
  const filas: (string | number)[][] = [
    ['Vehículo', 'Marca', 'Categoría', 'Rentas', 'Días rentados', 'Ingresos', '% sobre ingresos'],
  ];

  for (const item of reporte.items) {
    filas.push([
      item.nombre ?? item.id_carro,
      item.id_marca ?? '',
      item.id_categoria ?? '',
      item.rentas,
      redondear2(item.dias_rentados),
      numero(item.ingresos),
      porcentajeSobreTotal(item.ingresos, totalIngresos),
    ]);
  }

  return filas.map(linea);
}

function seccionCategorias(reporte: IngresosCategoriasReporte): string[] {
  const filas: (string | number)[][] = [
    ['Categoría', 'Rentas', 'Ingresos', '% sobre ingresos'],
  ];

  for (const item of reporte.items) {
    filas.push([
      item.id_categoria,
      item.rentas,
      numero(item.ingresos),
      porcentajeSobreTotal(item.ingresos, reporte.total_ingresos),
    ]);
  }

  return filas.map(linea);
}

export interface DatosExportables {
  resumen?: ResumenPeriodo;
  ingresos?: IngresosTiempoReporte;
  ranking?: RankingVehiculosReporte;
  categorias?: IngresosCategoriasReporte;
}

/**
 * El botón de exportación solo se habilita cuando las cuatro secciones están
 * cargadas y el periodo tiene algo que exportar.
 */
export function puedeExportar(datos: DatosExportables): boolean {
  const { resumen, ingresos, ranking, categorias } = datos;
  if (!resumen || !ingresos || !ranking || !categorias) return false;

  return (
    resumen.ingresos.actual > 0 ||
    resumen.rentas_finalizadas.actual > 0 ||
    ingresos.total_rentas > 0 ||
    ranking.items.length > 0 ||
    categorias.items.length > 0
  );
}

export function motivoExportDeshabilitado(datos: DatosExportables): string {
  if (!datos.resumen || !datos.ingresos || !datos.ranking || !datos.categorias) {
    return 'Espera a que carguen las cuatro secciones del reporte.';
  }
  return 'El periodo no tiene ingresos ni rentas para exportar.';
}

export function construirCsv(datos: DatosExportables): string {
  const secciones: string[] = [];

  if (datos.resumen) {
    secciones.push(['Indicadores del periodo', ...seccionKpis(datos.resumen)].join('\n'));
  }
  if (datos.ingresos) {
    secciones.push(['Ingresos en el tiempo', ...seccionIngresos(datos.ingresos)].join('\n'));
  }
  if (datos.ranking) {
    secciones.push(
      [
        'Ranking de vehículos',
        ...seccionRanking(
          datos.ranking,
          datos.resumen?.ingresos.actual ?? 0,
        ),
      ].join('\n'),
    );
  }
  if (datos.categorias) {
    secciones.push(['Ingresos por categoría', ...seccionCategorias(datos.categorias)].join('\n'));
  }

  return secciones.join('\n\n');
}

export function nombreArchivoCsv(periodo: Periodo): string {
  return `reportes-rentx_${periodo.desde}_a_${periodo.hasta}.csv`;
}

/** Genera el archivo en el navegador, con BOM para que Excel respete UTF-8. */
export function descargarCsv(nombre: string, contenido: string): void {
  const blob = new Blob([`\uFEFF${contenido}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}