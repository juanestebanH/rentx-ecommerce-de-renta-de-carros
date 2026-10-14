import type { ResumenRenta } from './renta.resumen';

export interface FiltroRentas {
  query: string;
  desde: string;
  hasta: string;
}

export const FILTRO_VACIO: FiltroRentas = { query: '', desde: '', hasta: '' };

export function filtroActivo(filtro: FiltroRentas, estadoFilter: string): boolean {
  return (
    filtro.query.trim() !== '' ||
    filtro.desde !== '' ||
    filtro.hasta !== '' ||
    estadoFilter !== 'todos'
  );
}

/** Coincidencia por nombre, email, licencia, placa o nombre del carro. */
export function coincideBusqueda(resumen: ResumenRenta, needle: string): boolean {
  if (needle === '') return true;
  const campos = [
    resumen.clienteNombre,
    resumen.cliente?.email ?? '',
    resumen.cliente?.numero_licencia ?? '',
    resumen.idCarro,
    resumen.carroNombre ?? '',
  ];
  return campos.some((campo) => campo.toLowerCase().includes(needle));
}

/**
 * El backend no filtra por fechas, así que el rango se resuelve acá por
 * solapamiento: una renta entra si su período toca el rango escolhido. Las
 * fechas son `YYYY-MM-DD`, que ordenan igual comparando strings.
 */
export function solapaRango(
  renta: { fecha_inicio: string; fecha_fin: string },
  filtro: FiltroRentas,
): boolean {
  if (filtro.desde !== '' && renta.fecha_fin < filtro.desde) return false;
  if (filtro.hasta !== '' && renta.fecha_inicio > filtro.hasta) return false;
  return true;
}

export function filtrarRentas(
  resumenes: ResumenRenta[],
  filtro: FiltroRentas,
): ResumenRenta[] {
  const needle = filtro.query.trim().toLowerCase();
  return resumenes.filter(
    (resumen) =>
      coincideBusqueda(resumen, needle) && solapaRango(resumen.renta, filtro),
  );
}

/** Lo vencido primero: la cola se ordena por `fecha_inicio` ascendente. */
export function porInicioAscendente(a: ResumenRenta, b: ResumenRenta): number {
  return a.renta.fecha_inicio.localeCompare(b.renta.fecha_inicio);
}
