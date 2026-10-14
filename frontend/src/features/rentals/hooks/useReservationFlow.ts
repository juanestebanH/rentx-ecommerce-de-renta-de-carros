import { useMemo, useState } from 'react';
import { useVehicle, useVehicleAvailability } from '@/features/vehicles/hooks/useVehicles';
import type { CatalogDates } from '@/features/vehicles/types/vehicle.types';
import type { MetodoPago, Payment } from '@/features/payments/types/payment.types';
import { useCreatePayment } from '@/features/payments/hooks/usePayments';
import { useCreateRenta } from './useRentals';
import type { Rental } from '../types/rental.types';
import {
  reservarDays,
  reservarRangeProblem,
  type RangeProblem,
  type ReservarParams,
} from '../utils/reservation';

export type ReservationStage =
  | { kind: 'resumen' }
  | { kind: 'creando-renta' }
  | { kind: 'registrando-pago'; renta: Rental }
  | { kind: 'renta-error'; error: unknown }
  | { kind: 'pago-error'; renta: Rental; error: unknown }
  | { kind: 'exito'; renta: Rental; pago: Payment };

export function useReservationFlow(params: ReservarParams | null) {
  const vehicleQuery = useVehicle(params?.id_carro);
  const rangeProblem = useMemo(
    () => (params ? reservarRangeProblem(params) : null),
    [params],
  );
  const rangeValid = params !== null && rangeProblem === null;

  const idCarro = rangeValid ? params?.id_carro : undefined;
  const availabilityDates: CatalogDates = rangeValid && params
    ? { fecha_inicio: params.fecha_inicio, fecha_fin: params.fecha_fin }
    : {};

  const availability = useVehicleAvailability(idCarro, availabilityDates);

  const days = useMemo(
    () => (params ? reservarDays(params.fecha_inicio, params.fecha_fin) : null),
    [params],
  );
  const total =
    vehicleQuery.data && days !== null ? vehicleQuery.data.tarifa * days : null;

  const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(null);
  const [stage, setStage] = useState<ReservationStage>({ kind: 'resumen' });

  const createRenta = useCreateRenta();
  const createPago = useCreatePayment();

  const isRunning = stage.kind === 'creando-renta' || stage.kind === 'registrando-pago';
  const available = availability.data?.available === true;

  const canConfirm =
    Boolean(params) &&
    rangeValid &&
    Boolean(vehicleQuery.data) &&
    total !== null &&
    metodoPago !== null &&
    available &&
    !isRunning;

  const confirmar = async () => {
    if (!params || !total || !metodoPago || isRunning) return;

    setStage({ kind: 'creando-renta' });
    try {
      const renta = await createRenta.mutateAsync({
        id_carro: params.id_carro,
        fecha_inicio: params.fecha_inicio,
        fecha_fin: params.fecha_fin,
      });

      setStage({ kind: 'registrando-pago', renta });
      try {
        const pago = await createPago.mutateAsync({
          id_renta: renta.id_renta,
          metodo_pago: metodoPago,
          total_pago: total,
        });
        setStage({ kind: 'exito', renta, pago });
      } catch (error) {
        setStage({ kind: 'pago-error', renta, error });
      }
    } catch (error) {
      setStage({ kind: 'renta-error', error });
    }
  };

  const reintentarPago = async (renta: Rental) => {
    if (!metodoPago || !total || isRunning) return;

    setStage({ kind: 'registrando-pago', renta });
    try {
      const pago = await createPago.mutateAsync({
        id_renta: renta.id_renta,
        metodo_pago: metodoPago,
        total_pago: total,
      });
      setStage({ kind: 'exito', renta, pago });
    } catch (error) {
      setStage({ kind: 'pago-error', renta, error });
    }
  };

  return {
    rangeProblem,
    vehicleQuery,
    vehicle: vehicleQuery.data,
    availability,
    available,
    days,
    total,
    metodoPago,
    setMetodoPago,
    stage,
    isRunning,
    canConfirm,
    confirmar,
    reintentarPago,
  };
}

export type { RangeProblem };
export type { ReservarParams };