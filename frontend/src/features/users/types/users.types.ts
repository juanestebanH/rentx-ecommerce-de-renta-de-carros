export type UsuarioEstado = 'activo' | 'inactivo';

// Mismas columnas públicas que devuelve el backend (sin `contrasena`).
// `rol` siempre es 'admin': el backend lo fija al crear la cuenta.
export interface Usuario {
  id_usuario: string;
  nombre: string;
  email: string;
  rol: string;
  estado: UsuarioEstado;
}

export interface UsuarioFilter {
  estado?: UsuarioEstado;
}

export interface CrearUsuarioInput {
  id_usuario: string;
  nombre: string;
  email: string;
  contrasena: string;
}

export interface ActualizarUsuarioInput {
  nombre?: string;
  email?: string;
  contrasena?: string;
}
