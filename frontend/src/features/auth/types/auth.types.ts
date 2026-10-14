export type AuthRol = 'admin' | 'client';

export interface AuthUser {
  id: string;
  nombre: string;
  email: string;
  rol: AuthRol;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  accessToken: string;
}

export interface ClientLoginInput {
  email: string;
  contrasena: string;
}

export interface AdminLoginInput {
  id_usuario: string;
  contrasena: string;
}

export interface ClientRegisterInput {
  nombres: string;
  apellidos: string;
  email: string;
  contrasena: string;
  telefono: string;
  fecha_nacimiento: string;
  numero_licencia: string;
  pais_emision: string;
  fecha_vencimiento: string;
}