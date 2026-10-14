import { VEHICLE_FEATURES } from '../types/vehicle.types';
import type { Vehicle, VehicleEstado, VehicleFeature } from '../types/vehicle.types';

export interface VehicleFormValues {
  id_carro: string;
  nombre: string;
  ano: string;
  id_marca: string;
  id_categoria: string;
  combustible: string;
  capacidad: string;
  seguro: boolean;
  transmision: string;
  tarifa: string;
  estado: VehicleEstado;
  foto: string | null;
  features: Record<VehicleFeature, boolean>;
}

export function initialFormValues(vehicle: Vehicle | null): VehicleFormValues {
  if (!vehicle) {
    return {
      id_carro: '',
      nombre: '',
      ano: '',
      id_marca: '',
      id_categoria: '',
      combustible: '',
      capacidad: '',
      seguro: false,
      transmision: '',
      tarifa: '',
      estado: 'activo',
      foto: null,
      features: emptyFeatures(),
    };
  }
  return {
    id_carro: vehicle.id_carro,
    nombre: vehicle.nombre,
    ano: String(vehicle.ano),
    id_marca: vehicle.id_marca,
    id_categoria: vehicle.id_categoria,
    combustible: vehicle.combustible,
    capacidad: String(vehicle.capacidad),
    seguro: vehicle.seguro,
    transmision: vehicle.transmision,
    tarifa: String(vehicle.tarifa),
    estado: vehicle.estado,
    foto: vehicle.foto,
    features: {
      ...emptyFeatures(),
      ...Object.fromEntries(
        VEHICLE_FEATURES.filter((feature) => vehicle[feature]).map((feature) => [
          feature,
          true,
        ]),
      ),
    } as Record<VehicleFeature, boolean>,
  };
}

export function fromFormValues(values: VehicleFormValues): {
  input: Omit<Vehicle, 'id_carro'>;
  idCarro: string;
  error: string | null;
} {
  const nombre = values.nombre.trim();
  const idCarro = values.id_carro.trim().toUpperCase();
  const ano = Number(values.ano);
  const capacidad = Number(values.capacidad);
  const tarifa = Number(values.tarifa);

  if (!nombre) return { input: null as never, idCarro, error: 'El nombre es obligatorio.' };
  if (!values.id_marca) return { input: null as never, idCarro, error: 'Elige una marca.' };
  if (!values.id_categoria) return { input: null as never, idCarro, error: 'Elige una categoría.' };
  if (!values.transmision) return { input: null as never, idCarro, error: 'Elige la transmisión.' };
  if (!values.combustible) return { input: null as never, idCarro, error: 'Elige el combustible.' };
  if (!Number.isInteger(ano) || ano < 1990 || ano > new Date().getFullYear() + 1) {
    return { input: null as never, idCarro, error: 'El año debe estar entre 1990 y el año siguiente.' };
  }
  if (!Number.isInteger(capacidad) || capacidad < 1) {
    return { input: null as never, idCarro, error: 'La capacidad debe ser un entero mayor a 0.' };
  }
  if (!Number.isFinite(tarifa) || tarifa <= 0) {
    return { input: null as never, idCarro, error: 'La tarifa debe ser mayor a 0.' };
  }

  const input = {
    nombre,
    ano,
    id_marca: values.id_marca,
    id_categoria: values.id_categoria,
    combustible: values.combustible,
    capacidad,
    seguro: values.seguro,
    transmision: values.transmision,
    tarifa,
    estado: values.estado,
    foto: values.foto,
    ...values.features,
  } as Omit<Vehicle, 'id_carro'>;

  return { input, idCarro, error: null };
}

function emptyFeatures(): Record<VehicleFeature, boolean> {
  return Object.fromEntries(
    VEHICLE_FEATURES.map((feature) => [feature, false]),
  ) as Record<VehicleFeature, boolean>;
}