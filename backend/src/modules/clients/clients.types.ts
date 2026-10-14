export type ClienteEstado = 'activo' | 'inactivo';

export interface Client {
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
  estado: ClienteEstado;
}

export type ClientPublic = Omit<Client, 'contrasena'>;

export interface ClientFilter {
  estado?: ClienteEstado;
}