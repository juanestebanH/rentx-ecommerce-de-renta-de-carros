export type MetodoPago = 'tarjeta' | 'efectivo' | 'transferencia';

export type PagoEstado = 'pendiente' | 'completado' | 'fallido' | 'reembolsado';

export interface Payment {
  id_pago: string;
  id_renta: string;
  metodo_pago: MetodoPago;
  total_pago: number;
  fecha_pago: string;
  estado: PagoEstado;
}

export interface CreatePaymentInput {
  id_renta: string;
  metodo_pago: MetodoPago;
  total_pago: number;
}