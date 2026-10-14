import { useState } from 'react';
import { addDays, parseISO, startOfToday } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { toISODate } from '@/shared/lib/date';
import type { CatalogDates } from '@/features/vehicles/types/vehicle.types';
import { buildCatalogHref } from '@/features/vehicles/utils/catalogUrl';
import { DateField } from './DateField';

export function HomeDatePicker() {
  const [dates, setDates] = useState<CatalogDates>({});
  const today = startOfToday();

  const from = dates.fecha_inicio ? parseISO(dates.fecha_inicio) : undefined;
  const to = dates.fecha_fin ? parseISO(dates.fecha_fin) : undefined;
  const returnMinDate = from ? addDays(from, 1) : today;

  const handleRecogida = (date?: Date) => {
    if (!date) {
      setDates({});
      return;
    }
    const nextInicio = toISODate(date);
    setDates((prev) => {
      const fin =
        prev.fecha_fin && prev.fecha_fin > nextInicio ? prev.fecha_fin : undefined;
      return { fecha_inicio: nextInicio, fecha_fin: fin };
    });
  };

  const handleDevolucion = (date?: Date) => {
    if (!date) {
      setDates((prev) => ({ fecha_inicio: prev.fecha_inicio }));
      return;
    }
    const siguienteFin = toISODate(date);
    setDates((prev) => {
      if (prev.fecha_inicio && siguienteFin <= prev.fecha_inicio) return prev;
      return { fecha_inicio: prev.fecha_inicio, fecha_fin: siguienteFin };
    });
  };

  return (
    <div className="flex w-full flex-col gap-2 rounded-[28px] border border-white/10 bg-petroleum/60 p-3 shadow-lg backdrop-blur-xl sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-2">
      <DateField
        label="Recogida"
        date={from}
        placeholder="Agrega fecha"
        ariaLabel="Fecha de recogida del viaje"
        onSelect={handleRecogida}
        minDate={today}
        defaultMonth={from ?? today}
      />

      <span
        aria-hidden="true"
        className="h-px w-full bg-white/15 sm:h-8 sm:w-px sm:shrink-0"
      />

      <DateField
        label="Devolución"
        date={to}
        placeholder="Agrega fecha"
        ariaLabel="Fecha de devolución del viaje"
        onSelect={handleDevolucion}
        minDate={returnMinDate}
        defaultMonth={to ?? (from ?? today)}
      />

      <Button
        asChild
        size="lg"
        className="h-12 w-full shrink-0 rounded-full px-6 py-3 active:scale-[0.98] sm:w-auto sm:ml-1"
      >
        <Link to={buildCatalogHref(dates)}>
          Buscar carros disponibles
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}