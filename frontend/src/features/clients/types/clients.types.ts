export type ClienteEstado = 'activo' | 'inactivo';

// Mismas columnas públicas que devuelve el backend (sin `contrasena`).
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
  estado: ClienteEstado;
}

export interface ClientFilter {
  estado?: ClienteEstado;
}