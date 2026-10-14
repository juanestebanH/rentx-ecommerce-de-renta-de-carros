import { apiClient } from '@/shared/lib/apiClient';
import type { CreatePaymentInput, Payment, PagoEstado } from '../types/payment.types';

const BASE = '/api/payments';

export function createPayment(input: CreatePaymentInput): Promise<Payment> {
  return apiClient.post<Payment>(BASE, input);
}

export function updatePaymentEstado(id: string, estado: PagoEstado): Promise<Payment> {
  return apiClient.patch<Payment>(`${BASE}/${id}/estado`, { estado });
}

// El backend expone los pagos de una renta en `/renta/:id_renta` (no acepta
// `?id_renta=`). Cualquier otro id_renta en la ruta no filtra: se devuelve 404
// con "Renta no encontrada".
export function getPaymentsByRental(idRenta: string): Promise<Payment[]> {
  return apiClient.get<Payment[]>(`${BASE}/renta/${idRenta}`);
}
