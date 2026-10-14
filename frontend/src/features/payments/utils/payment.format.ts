import type { MetodoPago, PagoEstado } from '../types/payment.types';

export const PAGO_ESTADO_LABELS: Record<PagoEstado, string> = {
  pendiente: 'Por confirmar',
  completado: 'Completado',
  fallido: 'Fallido',
  reembolsado: 'Reembolsado',
};

export const METODO_PAGO_LABELS: Record<MetodoPago, string> = {
  tarjeta: 'Tarjeta',
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
};

export const METODO_PAGO_DESCRIPTIONS: Record<MetodoPago, string> = {
  tarjeta: 'Tu renta queda confirmada al instante.',
  efectivo: 'Pagas en efectivo al recoger el carro.',
  transferencia: 'Un administrador verifica tu pago para confirmar.',
};