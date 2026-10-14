import { format, parseISO } from 'date-fns';
import { es as esDateFns } from 'date-fns/locale';
import type { Rental, RentalEstado } from '@/features/rentals/types/rental.types';

export const RENTA_ESTADOS_ACTIVOS: RentalEstado[] = [
  'pendiente',
  'confirmada',
  'en_curso',
];

export type TipoOcupacion = 'disponible' | 'en_uso' | 'reservado';

export interface Ocupacion {
  tipo: Exclude<TipoOcupacion, 'disponible'>;
  estado: RentalEstado;
  fecha_fin: string;
}

const PRIORIDAD: Record<RentalEstado, number> = {
  en_curso: 3,
  confirmada: 2,
  pendiente: 1,
  finalizada: 0,
  cancelada: 0,
};

export function ocupacionPorCarro(
  rentas: Rental[] | undefined,
): Map<string, Ocupacion> {
  const map = new Map<string, Ocupacion>();
  if (!rentas) return map;

  for (const renta of rentas) {
    if (!RENTA_ESTADOS_ACTIVOS.includes(renta.estado)) continue;

    const prev = map.get(renta.id_carro);
    const gana =
      !prev ||
      PRIORIDAD[renta.estado] > PRIORIDAD[prev.estado] ||
      (PRIORIDAD[renta.estado] === PRIORIDAD[prev.estado] &&
        renta.fecha_fin > prev.fecha_fin);

    if (gana) {
      map.set(renta.id_carro, {
        tipo: renta.estado === 'en_curso' ? 'en_uso' : 'reservado',
        estado: renta.estado,
        fecha_fin: renta.fecha_fin,
      });
    }
  }

  return map;
}

export function fechaVueltaLabel(fecha: string): string {
  const date = parseISO(fecha);
  const diffYears = date.getFullYear() - new Date().getFullYear();
  return diffYears === 0
    ? format(date, 'EEE dd', { locale: esDateFns })
    : format(date, "EEE dd MMM ''yy", { locale: esDateFns });
}