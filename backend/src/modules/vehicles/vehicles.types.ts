export const VEHICLE_ESTADOS = ['activo', 'mantenimiento', 'inactivo'] as const;

/** Estado de un vehículo dentro de la flota. */
export type VehicleEstado = (typeof VEHICLE_ESTADOS)[number];

/** Estados en los que el vehículo se ofrece al público (no incluye 'inactivo'). */
export const VEHICLE_ESTADOS_DISPONIBLES: readonly VehicleEstado[] = ['activo'];

/** Estado de un vehículo retirado de la flota (soft delete; la fila se conserva). */
export const VEHICLE_ESTADO_INACTIVO: VehicleEstado = 'inactivo';

export const VEHICLE_FEATURES = [
  'aire_acondicionado',
  'bluetooth',
  'camara_reversa',
  'freno_abs',
  'control_estabilidad',
  'puertos_usb',
  'sistema_sonido',
  'airbags_frontales',
  'airbags_laterales',
  'sistema_frenos_abs',
  'alarma_antirrobo',
  'luces_led',
] as const;

export type VehicleFeature = (typeof VEHICLE_FEATURES)[number];

export interface Vehicle {
  id_carro: string;
  nombre: string;
  ano: number;
  id_marca: string;
  id_categoria: string;
  combustible: string;
  capacidad: number;
  seguro: boolean;
  transmision: string;
  tarifa: number;
  estado: VehicleEstado;
  foto: string | null;
  aire_acondicionado: boolean;
  bluetooth: boolean;
  camara_reversa: boolean;
  freno_abs: boolean;
  control_estabilidad: boolean;
  puertos_usb: boolean;
  sistema_sonido: boolean;
  airbags_frontales: boolean;
  airbags_laterales: boolean;
  sistema_frenos_abs: boolean;
  alarma_antirrobo: boolean;
  luces_led: boolean;
}

export interface VehicleFilter {
  id_categoria?: string;
  id_marca?: string;
  transmision?: string;
  combustible?: string;
  tarifa_min?: number;
  tarifa_max?: number;
  /**
   * Sólo lo honra el admin. Sin él (o para no-admins) el listado se filtra
   * estrictamente a `estado = 'activo'`. Con él se quita el filtro de estado,
   * por lo que el admin ve TODOS los estados: 'mantenimiento' **e** 'inactivo'.
   */
  incluirMantenimiento?: boolean;
}

export interface CreateVehicleInput {
  id_carro: string;
  nombre: string;
  ano: number;
  id_marca: string;
  id_categoria: string;
  combustible: string;
  capacidad: number;
  seguro: boolean;
  transmision: string;
  tarifa: number;
  estado: VehicleEstado;
  foto?: string | null;
  aire_acondicionado?: boolean;
  bluetooth?: boolean;
  camara_reversa?: boolean;
  freno_abs?: boolean;
  control_estabilidad?: boolean;
  puertos_usb?: boolean;
  sistema_sonido?: boolean;
  airbags_frontales?: boolean;
  airbags_laterales?: boolean;
  sistema_frenos_abs?: boolean;
  alarma_antirrobo?: boolean;
  luces_led?: boolean;
}

export type UpdateVehicleInput = Partial<Omit<CreateVehicleInput, 'id_carro'>>;

/** Resultado de un borrado físico real (`hardDelete`). */
export type HardDeleteOutcome = 'deleted' | 'not_found' | 'has_history';

export interface UploadPhotoInput {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}