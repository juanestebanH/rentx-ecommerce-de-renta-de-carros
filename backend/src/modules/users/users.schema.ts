import { z } from 'zod';

export const listUsersQuerySchema = z.object({
  estado: z.enum(['activo', 'inactivo']).optional(),
});

export const createUserSchema = z.object({
  id_usuario: z.string().min(1, 'id_usuario es requerido'),
  nombre: z.string().min(1, 'nombre es requerido'),
  email: z.string().email('email no válido'),
  contrasena: z.string().min(6, 'contrasena debe tener al menos 6 caracteres'),
});

export const updateUserSchema = z
  .object({
    nombre: z.string().min(1).optional(),
    email: z.string().email('email no válido').optional(),
    contrasena: z.string().min(6, 'contrasena debe tener al menos 6 caracteres').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

export const updateUserEstadoSchema = z.object({
  estado: z.enum(['activo', 'inactivo']),
});