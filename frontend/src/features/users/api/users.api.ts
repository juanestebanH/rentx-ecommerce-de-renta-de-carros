import { apiClient } from '@/shared/lib/apiClient';
import type {
  ActualizarUsuarioInput,
  CrearUsuarioInput,
  Usuario,
  UsuarioEstado,
} from '../types/users.types';

const BASE = '/api/users';

export function getUsers(estado?: UsuarioEstado): Promise<Usuario[]> {
  return apiClient.get<Usuario[]>(
    `${BASE}${estado ? `?estado=${estado}` : ''}`,
  );
}

export function createUsuario(input: CrearUsuarioInput): Promise<Usuario> {
  return apiClient.post<Usuario>(BASE, input);
}

export function updateUsuario(
  id: string,
  input: ActualizarUsuarioInput,
): Promise<Usuario> {
  return apiClient.put<Usuario>(`${BASE}/${encodeURIComponent(id)}`, input);
}

export function updateUsuarioEstado(
  id: string,
  estado: UsuarioEstado,
): Promise<Usuario> {
  return apiClient.patch<Usuario>(
    `${BASE}/${encodeURIComponent(id)}/estado`,
    { estado },
  );
}
