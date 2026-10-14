import { endOfWeek, parseISO, startOfToday, startOfWeek } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { es as esDayPicker } from 'react-day-picker/locale';
import { cn } from 'cn';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { toISODate } from '@/shared/lib/date';
import { formatFechaCorta, formatRangoFechas } from '../../utils/rental.format';
import type { RangoFechas } from './RentasToolbar';

interface RentasFiltroFechasProps {
  rango: RangoFechas;
  onRangoChange: (rango: RangoFechas) => void;
}

function etiquetaDe(rango: RangoFechas): string {
  if (rango.desde !== '' && rango.hasta !== '') {
    return formatRangoFechas(rango.desde, rango.hasta);
  }
  if (rango.desde !== '') return `Desde ${formatFechaCorta(rango.desde)}`;
  if (rango.hasta !== '') return `Hasta ${formatFechaCorta(rango.hasta)}`;
  return 'Fechas';
}

/**
 * Un solo control en vez de dos `input[type=date]` en línea: el riel de admin se
 * come 256px y la toolbar en una fila no los aguanta. El rango vive en un
 * popover con el mismo `Calendar` que usa el buscador público, y los atajos
 * viven con él en vez de sumar botones a la barra.
 */
export function RentasFiltroFechas({ rango, onRangoChange }: RentasFiltroFechasProps) {
  const hayRango = rango.desde !== '' || rango.hasta !== '';

  const desde = rango.desde === '' ? undefined : parseISO(rango.desde);
  const hasta = rango.hasta === '' ? undefined : parseISO(rango.hasta);
  // Clickear un solo día entrega `from` sin `to`: se conserva ese borde en el
  // estado en vez de perderlo al cerrar el popover.
  const seleccionado: DateRange | undefined = desde
    ? { from: desde, to: hasta }
    : undefined;

  const seleccionarRango = (siguiente: DateRange | undefined) => {
    if (!siguiente?.from) {
      onRangoChange({ desde: '', hasta: '' });
      return;
    }
    onRangoChange({
      desde: toISODate(siguiente.from),
      hasta: siguiente.to ? toISODate(siguiente.to) : '',
    });
  };

  const atajoHoy = () => {
    const hoy = toISODate(startOfToday());
    onRangoChange({ desde: hoy, hasta: hoy });
  };

  // La semana colombiana arranca en lunes.
  const atajoSemana = () => {
    const hoy = startOfToday();
    onRangoChange({
      desde: toISODate(startOfWeek(hoy, { weekStartsOn: 1 })),
      hasta: toISODate(endOfWeek(hoy, { weekStartsOn: 1 })),
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'w-full justify-start gap-2 lg:w-auto lg:max-w-[15rem]',
            hayRango &&
              'border-[var(--accent-border)] bg-[var(--accent-bg)] text-accent-foreground',
          )}
        >
          <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
          <span className="sr-only">Filtrar por rango de fechas: </span>
          <span className="truncate tabular-nums">{etiquetaDe(rango)}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex items-center gap-1 border-b border-border p-2">
          <Button variant="ghost" size="xs" onClick={atajoHoy}>
            Hoy
          </Button>
          <Button variant="ghost" size="xs" onClick={atajoSemana}>
            Esta semana
          </Button>
          <Button
            variant="ghost"
            size="xs"
            disabled={!hayRango}
            onClick={() => onRangoChange({ desde: '', hasta: '' })}
            className="ml-auto"
          >
            Limpiar
          </Button>
        </div>

        <Calendar
          mode="range"
          selected={seleccionado}
          onSelect={seleccionarRango}
          locale={esDayPicker}
          defaultMonth={desde ?? startOfToday()}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}