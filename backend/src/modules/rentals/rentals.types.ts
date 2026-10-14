export type RentaEstado = 'pendiente' | 'confirmada' | 'en_curso' | 'finalizada' | 'cancelada';

export const RENTA_ESTADOS_ACTIVOS: RentaEstado[] = ['pendiente', 'confirmada', 'en_curso'];

/** Estados en los que el carro estuvo realmente ocupado (base del ocupación). */
export const RENTA_ESTADOS_OCUPACION: RentaEstado[] = ['confirmada', 'en_curso', 'finalizada'];

export interface Renta {
  id_renta: string;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_registro: string;
  dias_duracion: number;
  estado: RentaEstado;
  id_carro: string;
  id_cliente: string;
}

export interface RentaConVehiculo extends Renta {
  nombre_carro: string;
}

export interface CreateRentaInput {
  fecha_inicio: string;
  fecha_fin: string;
  id_carro: string;
}

export interface RentaFilter {
  estado?: RentaEstado;
  id_cliente?: string;
  id_carro?: string;
}

export interface CheckAvailabilityInput {
  id_carro: string;
  fecha_inicio: string;
  fecha_fin: string;
}