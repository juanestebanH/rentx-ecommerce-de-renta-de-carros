import { z } from 'zod';

export const adminLoginSchema = z.object({
  id_usuario: z.string().min(1, 'id_usuario is required'),
  contrasena: z.string().min(1, 'contrasena is required'),
});

export const clientLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  contrasena: z.string().min(1, 'contrasena is required'),
});

export const clientRegisterSchema = z.object({
  nombres: z.string().min(1, 'nombres is required'),
  apellidos: z.string().min(1, 'apellidos is required'),
  email: z.string().email('Invalid email format'),
  contrasena: z.string().min(6, 'Password must be at least 6 characters'),
  telefono: z.string().min(1, 'telefono is required'),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  numero_licencia: z.string().min(1, 'numero_licencia is required'),
  pais_emision: z.string().min(1, 'pais_emision is required'),
  fecha_vencimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
});

export const logoutSchema = z.object({});