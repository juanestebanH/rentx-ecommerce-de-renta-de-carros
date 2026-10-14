import { Input } from '@/shared/components/ui/input';

function parseTarifa(raw: string): number | undefined {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.max(0, parsed);
}

interface TarifaRangeInputsProps {
  value: { tarifa_min?: number; tarifa_max?: number };
  onChange: (patch: { tarifa_min?: number; tarifa_max?: number }) => void;
}

export function TarifaRangeInputs({ value, onChange }: TarifaRangeInputsProps) {
  const hasInvertedRange =
    value.tarifa_min !== undefined &&
    value.tarifa_max !== undefined &&
    value.tarifa_min > value.tarifa_max;

  return (
    <>
      <div className="grid grid-cols-1 gap-3">
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-sm font-medium">Tarifa mínima ($/día)</span>
          <Input
            type="number"
            min={0}
            step={100}
            placeholder="0"
            aria-invalid={hasInvertedRange}
            aria-describedby={
              hasInvertedRange ? 'rango-tarifa-error' : undefined
            }
            value={value.tarifa_min ?? ''}
            onChange={(e) =>
              onChange({ tarifa_min: parseTarifa(e.target.value) })
            }
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-sm font-medium">Tarifa máxima ($/día)</span>
          <Input
            type="number"
            min={0}
            step={100}
            placeholder="5,000"
            aria-invalid={hasInvertedRange}
            aria-describedby={
              hasInvertedRange ? 'rango-tarifa-error' : undefined
            }
            value={value.tarifa_max ?? ''}
            onChange={(e) =>
              onChange({ tarifa_max: parseTarifa(e.target.value) })
            }
          />
        </label>
      </div>
      {hasInvertedRange && (
        <p
          id="rango-tarifa-error"
          className="text-xs text-destructive"
          role="alert"
        >
          La tarifa mínima no puede ser mayor que la máxima. Reduce la mínima o
          aumenta la máxima.
        </p>
      )}
    </>
  );
}