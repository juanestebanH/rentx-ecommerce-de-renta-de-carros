export type RentalEstado =
  | 'pendiente'
  | 'confirmada'
  | 'en_curso'
  | 'finalizada'
  | 'cancelada';

export interface Rental {
  id_renta: string;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_registro: string;
  dias_duracion: number;
  estado: RentalEstado;
  id_carro: string;
  id_cliente: string;
}

export interface RentalConVehiculo extends Rental {
  nombre_carro: string;
}

export interface CreateRentaInput {
  id_carro: string;
  fecha_inicio: string;
  fecha_fin: string;
}