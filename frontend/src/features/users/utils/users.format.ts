import { ApiError } from '@/shared/lib/apiClient';

export function usuarioErrorMensaje(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function inicialesDe(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).slice(0, 2);
  return (
    partes.map((parte) => parte.charAt(0).toUpperCase()).join('') || '?'
  );
}

// El backend responde 400 con "Ya existe un usuario con ese email" cuando el
// email está repetido; se pinta en el campo en vez de solo en un toast.
export function esEmailDuplicado(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 400 &&
    /email/i.test(error.message)
  );
}
