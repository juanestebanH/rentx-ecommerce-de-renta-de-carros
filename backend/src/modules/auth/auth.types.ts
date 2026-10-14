export interface AdminUser {
  id_usuario: string;
  nombre: string;
  email: string;
  contrasena: string;
  rol: string;
  estado: 'activo' | 'inactivo';
}

export interface ClientUser {
  id_cliente: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  numero_licencia: string;
  pais_emision: string;
  fecha_vencimiento: string | null;
  contrasena: string | null;
}

export interface JwtPayload {
  id: string;
  rol: 'admin' | 'client';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AdminLoginInput {
  id_usuario: string;
  contrasena: string;
}

export interface ClientLoginInput {
  email: string;
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

export interface AuthResponse {
  user: {
    id: string;
    nombre: string;
    email: string;
    rol: 'admin' | 'client';
  };
  accessToken: string;
}

export interface AuthResponseWithRefresh extends AuthResponse {
  refreshToken: string;
}