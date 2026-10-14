import { ApiError } from '@/shared/lib/apiClient';
import type { VehicleEstado } from '../types/vehicle.types';

const tarifaFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatTarifa(value: number): string {
  return Number.isFinite(value) ? tarifaFormatter.format(value) : '—';
}

export const ESTADO_LABELS: Record<VehicleEstado, string> = {
  activo: 'Activo',
  mantenimiento: 'Mantenimiento',
  inactivo: 'Inactivo',
};

export const ESTADO_DOTS: Record<VehicleEstado, string> = {
  activo: 'bg-[var(--color-primary)]',
  mantenimiento: 'bg-amber-600',
  inactivo: 'bg-muted-foreground/70',
};

export const ESTADO_TEXT_CLASSES: Record<VehicleEstado, string> = {
  activo: 'text-accent-foreground',
  mantenimiento: 'text-amber-700',
  inactivo: 'text-muted-foreground',
};

const TRANSMISION_LABELS: Record<string, string> = {
  manual: 'Manual',
  automatica: 'Automática',
  automatico: 'Automática',
};

export function transmisionLabel(value: string): string {
  return TRANSMISION_LABELS[value.toLowerCase()] ?? value;
}

export const FEATURE_LABELS: Record<string, string> = {
  aire_acondicionado: 'Aire acondicionado',
  bluetooth: 'Bluetooth',
  camara_reversa: 'Cámara de reversa',
  freno_abs: 'Frenos ABS',
  control_estabilidad: 'Control de estabilidad',
  puertos_usb: 'Puertos USB',
  sistema_sonido: 'Sistema de sonido',
  airbags_frontales: 'Airbags frontales',
  airbags_laterales: 'Airbags laterales',
  sistema_frenos_abs: 'Sistema de frenos',
  alarma_antirrobo: 'Alarma antirrobo',
  luces_led: 'Luces LED',
};

const COMBUSTIBLE_LABELS: Record<string, string> = {
  gasolina: 'Gasolina',
  diesel: 'Diésel',
  electrico: 'Eléctrico',
  hibrido: 'Híbrido',
};

export function combustibleLabel(value: string): string {
  return COMBUSTIBLE_LABELS[value.toLowerCase()] ?? value;
}

export function vehicleErrorMensaje(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}