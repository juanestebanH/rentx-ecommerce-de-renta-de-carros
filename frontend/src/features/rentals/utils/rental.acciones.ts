import { differenceInCalendarDays, parseISO, startOfToday } from 'date-fns';
import type { Rental, RentalEstado } from '../types/rental.types';
import type { Payment } from '@/features/payments/types/payment.types';

export type AccionRenta =
  | 'confirmar_pago'
  | 'confirmar_renta'
  | 'iniciar_renta'
  | 'finalizar_renta'
  | 'cancelar_renta'
  | 'registrar_pago';

export type MotivoRenta =
  | 'pago_por_confirmar'
  | 'renta_por_confirmar'
  | 'renta_por_iniciar'
  | 'renta_por_finalizar';

export const MOTIVO_LABELS: Record<MotivoRenta, string> = {
  pago_por_confirmar: 'pagos',
  renta_por_confirmar: 'confirmar',
  renta_por_iniciar: 'iniciar',
  renta_por_finalizar: 'finalizar',
};

export const MOTIVO_ACCION: Record<MotivoRenta, AccionRenta> = {
  pago_por_confirmar: 'confirmar_pago',
  renta_por_confirmar: 'confirmar_renta',
  renta_por_iniciar: 'iniciar_renta',
  renta_por_finalizar: 'finalizar_renta',
};

export interface AccionMeta {
  label: string;
  variant: 'default' | 'outline' | 'destructive';
  /** Cómo queda la renta al aplicar la acción, para el copy del diálogo. */
  resultado: string;
}

export const ACCION_META: Record<AccionRenta, AccionMeta> = {
  confirmar_pago: { label: 'Confirmar pago', variant: 'default', resultado: 'completado' },
  confirmar_renta: { label: 'Confirmar renta', variant: 'default', resultado: 'confirmada' },
  iniciar_renta: { label: 'Iniciar renta', variant: 'default', resultado: 'en_curso' },
  finalizar_renta: { label: 'Finalizar renta', variant: 'default', resultado: 'finalizada' },
  cancelar_renta: { label: 'Cancelar renta', variant: 'destructive', resultado: 'cancelada' },
  registrar_pago: { label: 'Registrar pago', variant: 'outline', resultado: 'registrado' },
};

/** Días entre hoy y la fecha. Negativo = la fecha ya pasó. */
export function diasHasta(fecha: string, hoy: Date = startOfToday()): number {
  return differenceInCalendarDays(parseISO(fecha), hoy);
}

/** La fecha ya pasó. */
export function fechaVencida(fecha: string, hoy?: Date): boolean {
  return diasHasta(fecha, hoy) < 0;
}

/** La fecha ya pasó o es hoy: el trabajo de ese día toca. */
export function fechaAlcanzada(fecha: string, hoy?: Date): boolean {
  return diasHasta(fecha, hoy) <= 0;
}

export function pagosPendientes(pagos: Payment[] | undefined): Payment[] {
  return (pagos ?? []).filter((pago) => pago.estado === 'pendiente');
}

/**
 * `POST /api/payments` deja el pago en `pendiente` para efectivo y
 * transferencia; una tarjeta nace `completado`. Esos pendientes son los que el
 * administrador tiene que confirmar a mano.
 */
export function pagosPorConfirmar(pagos: Payment[] | undefined): Payment[] {
  return pagosPendientes(pagos).filter(
    (pago) => pago.metodo_pago === 'efectivo' || pago.metodo_pago === 'transferencia',
  );
}

export function totalCompletado(pagos: Payment[] | undefined): number {
  return (pagos ?? [])
    .filter((pago) => pago.estado === 'completado')
    .reduce((suma, pago) => suma + pago.total_pago, 0);
}

/**
 * El saldo que valida el backend descuenta `completado` **y** `pendiente`
 * (payments.service.ts): un pago por confirmar ya reserva su monto.
 */
export function totalComprometido(pagos: Payment[] | undefined): number {
  return (pagos ?? [])
    .filter((pago) => pago.estado === 'completado' || pago.estado === 'pendiente')
    .reduce((suma, pago) => suma + pago.total_pago, 0);
}

export function estaCubierta(totalEsperado: number | null, pagos: Payment[] | undefined): boolean {
  if (totalEsperado === null || totalEsperado <= 0) return false;
  return totalCompletado(pagos) >= totalEsperado;
}

/**
 * El backend NO valida transiciones en `PATCH /rentals/:id/estado` ni
 * re-evalúa la confirmación automática en `PATCH /payments/:id/estado`: el
 * ciclo legal vive acá y la UI es su único guardián.
 */
export function getMotivosAccionables(
  renta: Rental,
  pagos: Payment[] | undefined,
  totalEsperado: number | null,
): MotivoRenta[] {
  const motivos: MotivoRenta[] = [];

  if (pagosPorConfirmar(pagos).length > 0) {
    motivos.push('pago_por_confirmar');
  }

  if (renta.estado === 'pendiente' && estaCubierta(totalEsperado, pagos)) {
    motivos.push('renta_por_confirmar');
  }

  if (renta.estado === 'confirmada' && fechaAlcanzada(renta.fecha_inicio)) {
    motivos.push('renta_por_iniciar');
  }

  if (renta.estado === 'en_curso' && fechaAlcanzada(renta.fecha_fin)) {
    motivos.push('renta_por_finalizar');
  }

  return motivos;
}

// El pago va primero: el saldo es la fuente de verdad y una renta solo queda
// confirmable cuando sus pagos completados ya cubren el total.
const PRECEDENCIA: AccionRenta[] = [
  'confirmar_pago',
  'confirmar_renta',
  'iniciar_renta',
  'finalizar_renta',
];

export function getAccionPrincipal(motivos: MotivoRenta[]): AccionRenta | null {
  for (const accion of PRECEDENCIA) {
    if (motivos.some((motivo) => MOTIVO_ACCION[motivo] === accion)) {
      return accion;
    }
  }
  return null;
}

/**
 * Acciones legales del estado actual para el drawer. El alta de pago no aparece
 * acá: la posee el formulario del panel de pagos, que valida el monto contra el
 * saldo. La confirmación de un pago concreto tampoco, porque ese panel nombra el
 * monto y el método de cada pago. Cancelar nunca se ofrece sobre una renta
 * `finalizada` ni `cancelada` porque el backend las rechaza.
 */
export function getAccionesLegales(
  renta: Rental,
  pagos: Payment[] | undefined,
  totalEsperado: number | null,
): AccionRenta[] {
  const acciones: AccionRenta[] = [];

  if (renta.estado === 'finalizada' || renta.estado === 'cancelada') return acciones;

  if (renta.estado === 'pendiente' && estaCubierta(totalEsperado, pagos)) {
    acciones.push('confirmar_renta');
  }

  if (renta.estado === 'confirmada' && fechaAlcanzada(renta.fecha_inicio)) {
    acciones.push('iniciar_renta');
  }

  if (renta.estado === 'en_curso' && fechaAlcanzada(renta.fecha_fin)) {
    acciones.push('finalizar_renta');
  }

  if (renta.estado === 'pendiente' || renta.estado === 'confirmada') {
    acciones.push('cancelar_renta');
  }

  return acciones;
}

/**
 * `createPayment` solo mira el saldo, no el estado de la renta: mientras haya
 * saldo por pagar se puede registrar, incluso con la renta `en_curso` (una
 * prórroga cobrada a mitad de alquiler). Las cerradas no aceptan pagos.
 */
export function admitePagoNuevo(renta: Rental, saldo: number | null): boolean {
  if (saldo === null || saldo <= 0) return false;
  return (
    renta.estado === 'pendiente' ||
    renta.estado === 'confirmada' ||
    renta.estado === 'en_curso'
  );
}

export function labelAccionFila(accion: AccionRenta, pagosPorConfirmarCount: number): string {
  if (accion === 'confirmar_pago' && pagosPorConfirmarCount > 1) {
    return `Ver ${pagosPorConfirmarCount} pagos`;
  }
  return ACCION_META[accion].label;
}

/** Estados en los que la renta todavía admite un pago o un cambio de ciclo. */
export const RENTA_ESTADOS_ACTIVOS: RentalEstado[] = [
  'pendiente',
  'confirmada',
  'en_curso',
];

