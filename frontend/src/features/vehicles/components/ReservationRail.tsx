import { differenceInCalendarDays, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { AvailabilityVerdict } from './AvailabilityVerdict';
import { FechaRangeInputs } from './FechaRangeInputs';
import { ReservationBreakdown } from './ReservationBreakdown';
import type { CatalogDates, Vehicle } from '../types/vehicle.types';

interface ReservationRailProps {
  vehicle: Vehicle;
  dates: CatalogDates;
  onDatesChange: (dates: CatalogDates) => void;
  availability: {
    enabled: boolean;
    isPending: boolean;
    isError: boolean;
    available?: boolean;
    refetch: () => void;
  };
}

function rentalDays(dates: CatalogDates): number | null {
  if (!dates.fecha_inicio || !dates.fecha_fin) return null;
  if (dates.fecha_inicio > dates.fecha_fin) return null;
  return (
    differenceInCalendarDays(
      parseISO(dates.fecha_fin),
      parseISO(dates.fecha_inicio),
    ) + 1
  );
}

export function ReservationRail({
  vehicle,
  dates,
  onDatesChange,
  availability,
}: ReservationRailProps) {
  const navigate = useNavigate();
  const days = rentalDays(dates);
  const available = availability.available === true;
  const showBreakdown = availability.enabled && !availability.isPending && !availability.isError;

  const handleReserve = () => {
    if (!available || !dates.fecha_inicio || !dates.fecha_fin) return;
    const params = new URLSearchParams({
      id_carro: vehicle.id_carro,
      fecha_inicio: dates.fecha_inicio,
      fecha_fin: dates.fecha_fin,
    });
    navigate(`/reservar?${params.toString()}`);
  };

  return (
    <Card className="sticky top-6 flex min-w-0 flex-col gap-4 p-5">
      <div>
        <h2 className="my-0 text-xl font-semibold tracking-tight">Reserva</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Elige tus fechas y confirma que el carro esté disponible.
        </p>
      </div>

      <FechaRangeInputs
        context="detail"
        dates={dates}
        onDatesChange={onDatesChange}
      />

      <div className="flex min-h-10 items-start gap-2 rounded-xl border border-border bg-accent/30 p-3">
        <AvailabilityVerdict
          hasDates={availability.enabled}
          isPending={availability.isPending}
          isError={availability.isError}
          available={availability.available}
          onRetry={availability.refetch}
        />
      </div>

      {showBreakdown && days !== null && (
        <ReservationBreakdown tarifa={vehicle.tarifa} days={days} />
      )}

      <Button
        type="button"
        size="lg"
        disabled={!available}
        onClick={handleReserve}
      >
        Reservar
      </Button>
    </Card>
  );
}