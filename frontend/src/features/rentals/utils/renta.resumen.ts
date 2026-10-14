import type { Client } from '@/features/clients/types/clients.types';
import type { Payment } from '@/features/payments/types/payment.types';
import type { Vehicle } from '@/features/vehicles/types/vehicle.types';
import type { Rental } from '../types/rental.types';
import {
  admitePagoNuevo,
  diasHasta,
  estaCubierta,
  getAccionPrincipal,
  getAccionesLegales,
  getMotivosAccionables,
  pagosPorConfirmar,
  totalCompletado,
  totalComprometido,
  type AccionRenta,
  type MotivoRenta,
} from './rental.acciones';

/**
 * Vista de una renta con su dinero resuelto. `GET /api/rentals` (admin) no
 * devuelve nombres ni pagos y no expone el total esperado, así que el total se
 * reconstruye igual que lo hace el backend: `dias_duracion × tarifa` del carro.
 */
export interface ResumenRenta {
  renta: Rental;
  cliente: Client | null;
  clienteNombre: string;
  carroNombre: string | null;
  idCarro: string;
  totalEsperado: number | null;
  pagado: number;
  pendiente: number;
  saldo: number | null;
  cubierta: boolean;
  pagos: Payment[];
  pagosPorConfirmar: Payment[];
  motivos: MotivoRenta[];
  accion: AccionRenta | null;
  accionesLegales: AccionRenta[];
  admitePagoNuevo: boolean;
  /** `false` mientras su lista de pagos no llegó: los motivos de pago no cuentan. */
  pagosCargados: boolean;
  /** Días respecto de la fecha que la fila tiene vencida; `null` si no aplica. */
  diasVencimiento: number | null;
}

export function nombreCompleto(cliente: Client | null | undefined): string {
  if (!cliente) return '—';
  return `${cliente.nombres} ${cliente.apellidos}`;
}

function fechaQueVence(renta: Rental): string | null {
  if (renta.estado === 'confirmada') return renta.fecha_inicio;
  if (renta.estado === 'en_curso') return renta.fecha_fin;
  return null;
}

export function buildResumen(
  renta: Rental,
  pagos: Payment[] | undefined,
  vehiculo: Vehicle | undefined,
  cliente: Client | undefined,
  pagosCargados = true,
): ResumenRenta {
  const listaPagos = pagos ?? [];
  const tarifa = vehiculo?.tarifa ?? null;
  const totalEsperado = tarifa === null ? null : renta.dias_duracion * tarifa;
  const pagado = totalCompletado(listaPagos);
  const pendiente = listaPagos
    .filter((pago) => pago.estado === 'pendiente')
    .reduce((suma, pago) => suma + pago.total_pago, 0);
  const saldo =
    totalEsperado === null
      ? null
      : Math.max(0, totalEsperado - totalComprometido(listaPagos));

  // Antes de que lleguen los pagos, una lista vacía se confundiría con "sin
  // pagos": marcaría como accionable una renta cubierta y escondería el pago por
  // confirmar. Los motivos de fecha no dependen de los pagos y sí cuentan.
  const motivos = getMotivosAccionables(renta, listaPagos, totalEsperado).filter(
    (motivo) =>
      pagosCargados ||
      (motivo !== 'pago_por_confirmar' && motivo !== 'renta_por_confirmar'),
  );
  const vence = fechaQueVence(renta);

  return {
    renta,
    cliente: cliente ?? null,
    clienteNombre: nombreCompleto(cliente),
    carroNombre: vehiculo?.nombre ?? null,
    idCarro: renta.id_carro,
    totalEsperado,
    pagado,
    pendiente,
    saldo,
    cubierta: estaCubierta(totalEsperado, listaPagos),
    pagos: listaPagos,
    pagosPorConfirmar: pagosPorConfirmar(listaPagos),
    motivos,
    accion: getAccionPrincipal(motivos),
    accionesLegales: getAccionesLegales(renta, listaPagos, totalEsperado).filter(
      (accion) => pagosCargados || accion !== 'confirmar_renta',
    ),
    admitePagoNuevo: pagosCargados && admitePagoNuevo(renta, saldo),
    pagosCargados,
    diasVencimiento: vence === null ? null : diasHasta(vence),
  };
}

export interface ConteoMotivos {
  total: number;
  porMotivo: Record<MotivoRenta, number>;
}

export function contarMotivos(resumenes: ResumenRenta[]): ConteoMotivos {
  const porMotivo: Record<MotivoRenta, number> = {
    pago_por_confirmar: 0,
    renta_por_confirmar: 0,
    renta_por_iniciar: 0,
    renta_por_finalizar: 0,
  };

  for (const resumen of resumenes) {
    for (const motivo of resumen.motivos) {
      porMotivo[motivo] += 1;
    }
  }

  return { total: resumenes.length, porMotivo };
}
