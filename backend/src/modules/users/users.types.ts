export type UsuarioEstado = 'activo' | 'inactivo';

export interface AdminUserView {
  id_usuario: string;
  nombre: string;
  email: string;
  rol: string;
  estado: UsuarioEstado;
}

export interface CreateAdminInput {
  id_usuario: string;
  nombre: string;
  email: string;
  contrasena: string;
}

export interface UpdateAdminInput {
  nombre?: string;
  email?: string;
  contrasena?: string;
}

export interface AdminUserFilter {
  estado?: UsuarioEstado;
}