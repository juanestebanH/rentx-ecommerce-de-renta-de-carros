import { AppError } from '../../shared/utils/AppError.js';
import { normalizeIdentifier } from '../../shared/utils/normalize.js';
import { rentalsRepository } from '../rentals/rentals.repository.js';
import { vehiclesRepository } from '../vehicles/vehicles.repository.js';
import { paymentsRepository } from './payments.repository.js';
import type { CreatePagoInput, Pago, PagoEstado } from './payments.types.js';

export interface PagoRequester {
  id: string;
  rol: 'admin' | 'client';
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function estadoInicialSegunMetodoPago(metodoPago: Pago['metodo_pago']): 'completado' | 'pendiente' {
  return metodoPago === 'tarjeta' ? 'completado' : 'pendiente';
}

export class PaymentsService {
  async listByRenta(idRenta: string, requester: PagoRequester): Promise<Pago[]> {
    const renta = await rentalsRepository.findById(idRenta);
    if (!renta) {
      throw new AppError('Renta no encontrada', 404);
    }

    if (requester.rol === 'client' && renta.id_cliente !== normalizeIdentifier(requester.id)) {
      throw new AppError('No tienes acceso a los pagos de esta renta', 403);
    }

    return paymentsRepository.listByRenta(idRenta);
  }

  async create(input: CreatePagoInput): Promise<Pago> {
    const idRenta = input.id_renta;

    const renta = await rentalsRepository.findById(idRenta);
    if (!renta) {
      throw new AppError('Renta no encontrada', 404);
    }

    if (renta.estado === 'cancelada' || renta.estado === 'finalizada') {
      throw new AppError('No se puede registrar un pago para esta renta', 400);
    }

    const carro = await vehiclesRepository.findTarifaAndEstado(renta.id_carro);
    if (!carro) {
      throw new AppError('Vehículo no encontrado', 404);
    }

    const totalEsperado = renta.dias_duracion * carro.tarifa;

    const saldoRestante =
      totalEsperado -
      (await paymentsRepository.sumByRentaAndEstado(idRenta, ['completado', 'pendiente']));

    if (input.total_pago > saldoRestante) {
      throw new AppError(
        `El monto excede el saldo pendiente de la renta ($${saldoRestante} restante)`,
        400
      );
    }

    const pago: Pago = {
      id_pago: `PAGO-${Date.now()}`,
      id_renta: idRenta,
      metodo_pago: input.metodo_pago,
      total_pago: input.total_pago,
      fecha_pago: toDateString(new Date()),
      estado: estadoInicialSegunMetodoPago(input.metodo_pago),
    };

    const created = await paymentsRepository.create(pago);

    const nuevosCompletados = await paymentsRepository.sumByRentaAndEstado(idRenta, [
      'completado',
    ]);

    if (nuevosCompletados >= totalEsperado && renta.estado === 'pendiente') {
      await rentalsRepository.updateEstado(idRenta, 'confirmada');
    }

    return created;
  }

  async updateEstado(id: string, estado: PagoEstado): Promise<Pago> {
    const existing = await paymentsRepository.findById(id);
    if (!existing) {
      throw new AppError('Pago no encontrado', 404);
    }

    const updated = await paymentsRepository.updateEstado(id, estado);
    if (!updated) {
      throw new AppError('Error al actualizar el estado del pago', 500);
    }

    return updated;
  }
}

export const paymentsService = new PaymentsService();