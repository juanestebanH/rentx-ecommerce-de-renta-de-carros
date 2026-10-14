import { format, parseISO, startOfToday } from 'date-fns';
import { es as esDateFns } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { es as esDayPicker } from 'react-day-picker/locale';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { toISODate } from '@/shared/lib/date';
import type { CatalogDates } from '../types/vehicle.types';

interface FechaRangeInputsProps {
  dates?: CatalogDates;
  onDatesChange?: (dates: CatalogDates) => void;
  /** Contexto de uso:
   *  · `catalog` (default): el helper explica que el catálogo FILTRA los carros
   *    por el rango elegido — aquí el copy es correcto ("solo se muestran los
   *    carros disponibles en ese rango").
   *  · `detail`: estamos DENTRO de un carro ya elegido; el mensaje de
   *    "solo se muestran los carros disponibles en ese rango" NO aplica y se
   *    oculta (el rail ya tiene su propio veredicto de disponibilidad). */
  context?: 'catalog' | 'detail';
}

export function FechaRangeInputs({
  dates,
  onDatesChange,
  context = 'catalog',
}: FechaRangeInputsProps) {
  const fechaInicio = dates?.fecha_inicio ?? '';
  const fechaFin = dates?.fecha_fin ?? '';

  const range: DateRange | undefined = (() => {
    if (!fechaInicio) return undefined;
    const from = parseISO(fechaInicio);
    if (!fechaFin) return { from };
    const to = parseISO(fechaFin);
    return from <= to ? { from, to } : { from };
  })();

  const handleDatesSelect = (selected?: DateRange) => {
    if (!selected) {
      onDatesChange?.({});
      return;
    }
    const patch: Partial<CatalogDates> = {};
    if (selected.from) patch.fecha_inicio = toISODate(selected.from);
    if (selected.to) patch.fecha_fin = toISODate(selected.to);
    if (selected.from && !selected.to) patch.fecha_fin = undefined;
    onDatesChange?.(patch);
  };

  return (
    <div className="mt-1 grid grid-cols-1 gap-3 border-t border-border pt-4">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Fechas{context === 'catalog' ? ' (opcional)' : ''}
      </span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={`w-full justify-start gap-2 font-normal ${range ? 'border-[var(--accent-border)] text-accent-foreground' : ''}`}
            aria-label="Rango de fechas"
          >
            <CalendarIcon className="size-4 shrink-0" />
            {range?.from && range.to ? (
              <span>
                {format(range.from, 'dd MMM yyyy', { locale: esDateFns })}{' '}
                — {format(range.to, 'dd MMM yyyy', { locale: esDateFns })}
              </span>
            ) : range?.from ? (
              <span>
                {format(range.from, 'dd MMM yyyy', { locale: esDateFns })}
              </span>
            ) : (
              <span className="text-muted-foreground">Selecciona un rango</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            onSelect={handleDatesSelect}
            numberOfMonths={2}
            locale={esDayPicker}
            defaultMonth={range?.from ?? startOfToday()}
            disabled={{ before: startOfToday() }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      {context === 'catalog' && (
        <p className="text-xs text-muted-foreground">
          Al elegir fechas, solo se muestran los carros disponibles en ese
          rango.
        </p>
      )}
    </div>
  );
}
