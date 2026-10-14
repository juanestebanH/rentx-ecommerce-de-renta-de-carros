import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { MetodoPago } from '@/features/payments/types/payment.types';
import { formatCurrencyCOP } from '../../utils/rental.format';

const METODOS: MetodoPago[] = ['efectivo', 'transferencia'];

interface NuevoPagoFormProps {
  saldo: number;
  registrando: boolean;
  onRegistrar: (input: {
    metodo_pago: MetodoPago;
    total_pago: number;
  }) => Promise<boolean>;
}

/**
 * El backend valida `total_pago` como entero positivo y lo compara contra el
 * saldo (total esperado menos lo completado **y** lo pendiente). La tarjeta no
 * se ofrece: la registra el cliente al reservar y nace `completado`.
 */
export function NuevoPagoForm({ saldo, registrando, onRegistrar }: NuevoPagoFormProps) {
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo');
  const [monto, setMonto] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validar = (): string | null => {
    if (monto.trim() === '') {
      return 'Escribe el monto que recibió.';
    }
    const valor = Number(monto);
    if (!Number.isInteger(valor)) {
      return 'El monto debe ser un número entero, sin decimales.';
    }
    if (valor <= 0) {
      return 'El monto debe ser mayor que cero.';
    }
    if (valor > saldo) {
      return `El monto no puede superar el saldo de ${formatCurrencyCOP(saldo)}.`;
    }
    return null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const problema = validar();
    setError(problema);
    if (problema) return;

    const ok = await onRegistrar({ metodo_pago: metodo, total_pago: Number(monto) });
    if (ok) {
      setMonto('');
      setError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-3 space-y-2.5">
      <div className="flex gap-2">
        <Select value={metodo} onValueChange={(value) => setMetodo(value as MetodoPago)}>
          <SelectTrigger size="sm" aria-label="Método de pago" className="w-36 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {METODOS.map((valor) => (
              <SelectItem key={valor} value={valor}>
                {valor === 'efectivo' ? 'Efectivo' : 'Transferencia'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          inputMode="numeric"
          step={1000}
          min={0}
          value={monto}
          onChange={(event) => setMonto(event.target.value)}
          placeholder="Monto"
          aria-label="Monto del pago"
          aria-invalid={error !== null}
          disabled={registrando}
          className="tabular-nums"
        />
      </div>

      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={registrando}>
          {registrando && <Loader2 className="animate-spin" aria-hidden="true" />}
          Registrar pago
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={registrando}
          onClick={() => setMonto(String(saldo))}
        >
          Usar el saldo
        </Button>
      </div>
    </form>
  );
}
