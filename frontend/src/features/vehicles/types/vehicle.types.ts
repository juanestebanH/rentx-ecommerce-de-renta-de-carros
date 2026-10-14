export type VehicleEstado = 'activo' | 'mantenimiento' | 'inactivo';

export const VEHICLE_ESTADOS: readonly VehicleEstado[] = [
  'activo',
  'mantenimiento',
  'inactivo',
] as const;

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

export interface VehicleFilters {
  id_categoria?: string;
  id_marca?: string;
  transmision?: string;
  combustible?: string;
  tarifa_min?: number;
  tarifa_max?: number;
  incluirMantenimiento?: boolean;
}

export interface CatalogDates {
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface CheckAvailabilityParams {
  id_carro: string;
  fecha_inicio: string;
  fecha_fin: string;
}