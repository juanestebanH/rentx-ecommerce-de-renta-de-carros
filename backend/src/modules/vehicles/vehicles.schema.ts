import { z } from 'zod';
import { VEHICLE_ESTADOS } from './vehicles.types.js';

const vehicleEstadoSchema = z.enum(VEHICLE_ESTADOS);

const MAX_ANIO = new Date().getFullYear() + 1;

export const listVehiclesQuerySchema = z.object({
  id_categoria: z.string().min(1).optional(),
  id_marca: z.string().min(1).optional(),
  transmision: z.string().min(1).optional(),
  combustible: z.string().min(1).optional(),
  incluirMantenimiento: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  tarifa_min: z.coerce.number().gte(0).optional(),
  tarifa_max: z.coerce.number().gte(0).optional(),
});

const vehicleFields = {
  nombre: z.string().min(1, 'nombre is required'),
  ano: z
    .number()
    .int('ano must be an integer')
    .min(1990, 'ano must be >= 1990')
    .max(MAX_ANIO, `ano must be <= ${MAX_ANIO}`),
  id_marca: z.string().min(1, 'id_marca is required'),
  id_categoria: z.string().min(1, 'id_categoria is required'),
  combustible: z.string().min(1, 'combustible is required'),
  capacidad: z.number().int('capacidad must be an integer').gt(0, 'capacidad must be positive'),
  seguro: z.boolean(),
  transmision: z.string().min(1, 'transmision is required'),
  tarifa: z.number().gt(0, 'tarifa must be positive'),
  foto: z.string().url('foto must be a valid URL').nullable().optional(),
};

const featureFields = {
  aire_acondicionado: z.boolean().optional(),
  bluetooth: z.boolean().optional(),
  camara_reversa: z.boolean().optional(),
  freno_abs: z.boolean().optional(),
  control_estabilidad: z.boolean().optional(),
  puertos_usb: z.boolean().optional(),
  sistema_sonido: z.boolean().optional(),
  airbags_frontales: z.boolean().optional(),
  airbags_laterales: z.boolean().optional(),
  sistema_frenos_abs: z.boolean().optional(),
  alarma_antirrobo: z.boolean().optional(),
  luces_led: z.boolean().optional(),
};

export const createVehicleSchema = z.object({
  id_carro: z.string().min(1, 'id_carro is required'),
  ...vehicleFields,
  estado: vehicleEstadoSchema.optional().default('activo'),
  aire_acondicionado: z.boolean().optional().default(false),
  bluetooth: z.boolean().optional().default(false),
  camara_reversa: z.boolean().optional().default(false),
  freno_abs: z.boolean().optional().default(false),
  control_estabilidad: z.boolean().optional().default(false),
  puertos_usb: z.boolean().optional().default(false),
  sistema_sonido: z.boolean().optional().default(false),
  airbags_frontales: z.boolean().optional().default(false),
  airbags_laterales: z.boolean().optional().default(false),
  sistema_frenos_abs: z.boolean().optional().default(false),
  alarma_antirrobo: z.boolean().optional().default(false),
  luces_led: z.boolean().optional().default(false),
});

export const updateVehicleSchema = z.object({
  ...vehicleFields,
  ...featureFields,
  estado: vehicleEstadoSchema.optional(),
});

export const updateEstadoSchema = z.object({
  estado: vehicleEstadoSchema,
});