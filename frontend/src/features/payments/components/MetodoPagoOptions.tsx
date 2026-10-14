import {
  ArrowRightLeft,
  Banknote,
  Check,
  CreditCard,
} from 'lucide-react';
import { cn } from 'cn';
import {
  METODO_PAGO_DESCRIPTIONS,
  METODO_PAGO_LABELS,
} from '../utils/payment.format';
import type { MetodoPago } from '../types/payment.types';

interface MetodoPagoOptionsProps {
  selected: MetodoPago | null;
  onChange: (metodo: MetodoPago) => void;
  disabled?: boolean;
}

const ICONS: Record<MetodoPago, typeof CreditCard> = {
  tarjeta: CreditCard,
  efectivo: Banknote,
  transferencia: ArrowRightLeft,
};

export function MetodoPagoOptions({
  selected,
  onChange,
  disabled = false,
}: MetodoPagoOptionsProps) {
  return (
    <div role="radiogroup" aria-label="Método de pago" className="flex flex-col gap-2">
      {(Object.keys(METODO_PAGO_LABELS) as MetodoPago[]).map((metodo) => {
        const isSelected = selected === metodo;
        const Icon = ICONS[metodo];
        return (
          <button
            key={metodo}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-disabled={disabled}
            disabled={disabled}
            onClick={() => onChange(metodo)}
            className={cn(
              'group relative flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
              isSelected
                ? 'border-primary bg-accent/30'
                : 'border-border hover:border-primary/50',
              disabled && 'pointer-events-none opacity-60',
            )}
          >
            <span
              className={cn(
                'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              <Icon className="size-4.5" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-semibold">
                {METODO_PAGO_LABELS[metodo]}
              </span>
              <span className="text-xs leading-snug text-muted-foreground">
                {METODO_PAGO_DESCRIPTIONS[metodo]}
              </span>
            </span>
            <span
              className={cn(
                'mt-1 ml-auto flex size-4 shrink-0 items-center justify-center rounded-full border',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border',
              )}
            >
              {isSelected && <Check className="size-3" aria-hidden="true" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}