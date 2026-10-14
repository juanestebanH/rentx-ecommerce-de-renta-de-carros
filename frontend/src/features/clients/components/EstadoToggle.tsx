import { Loader2 } from 'lucide-react';
import { cn } from 'cn';
import type { ClienteEstado } from '../types/clients.types';

interface EstadoToggleProps {
  estado: ClienteEstado;
  onToggle: () => void;
  disabled?: boolean;
  busy?: boolean;
  ariaLabel: string;
}

export function EstadoToggle({
  estado,
  onToggle,
  disabled,
  busy,
  ariaLabel,
}: EstadoToggleProps) {
  const activo = estado === 'activo';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={ariaLabel}
      aria-busy={busy}
      disabled={disabled || busy}
      onClick={onToggle}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors outline-none',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        activo ? 'border-primary bg-primary' : 'border-border bg-muted',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-0.5 left-0.5 flex size-3.5 items-center justify-center rounded-full bg-white shadow-sm transition-transform',
          activo ? 'translate-x-[18px]' : 'translate-x-0',
        )}
      >
        {busy && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
      </span>
    </button>
  );
}