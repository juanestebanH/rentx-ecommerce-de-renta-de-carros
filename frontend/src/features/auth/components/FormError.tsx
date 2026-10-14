import { ApiError } from '@/shared/lib/apiClient';

interface FormErrorProps {
  error: unknown;
}

const RATE_LIMIT_MESSAGE =
  'Demasiados intentos. Espera unos minutos antes de volver a intentar.';

export function FormError({ error }: FormErrorProps) {
  if (!error) return null;

  let message =
    error instanceof Error && error.message.length > 0
      ? error.message
      : 'Ocurrió un error inesperado. Inténtalo de nuevo.';

  if (error instanceof ApiError && error.status === 429) {
    message = RATE_LIMIT_MESSAGE;
  }

  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
    >
      {message}
    </div>
  );
}