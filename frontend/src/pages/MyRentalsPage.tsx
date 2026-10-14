import { useState } from 'react';
import { useMarcas } from '@/features/vehicles/hooks/useVehicles';
import { categoriaLabel } from '@/shared/utils/catalogo.format';
import { CancelRentalDialog } from '@/features/rentals/components/CancelRentalDialog';
import { CancelSuccessNotice } from '@/features/rentals/components/CancelSuccessNotice';
import { RentalCard } from '@/features/rentals/components/RentalCard';
import { RentalCardSkeleton } from '@/features/rentals/components/RentalCardSkeleton';
import { RentalsEmptyState } from '@/features/rentals/components/RentalsEmptyState';
import { RentalsErrorState } from '@/features/rentals/components/RentalsErrorState';
import { useCancelRental, useMyRentals } from '@/features/rentals/hooks/useRentals';
import { useRentalVehicles } from '@/features/rentals/hooks/useRentalVehicles';
import type { Rental } from '@/features/rentals/types/rental.types';

const SKELETON_COUNT = 3;

function marcaLabel(slug: string, marcas: Map<string, string>): string {
  return (
    marcas.get(slug.toLowerCase()) ??
    slug.charAt(0).toUpperCase() + slug.slice(1)
  );
}

function MyRentalsPage() {
  const rentalsQuery = useMyRentals();
  const cancel = useCancelRental();
  const { vehiclesById } = useRentalVehicles(rentalsQuery.data);
  const marcasQuery = useMarcas();

  const [cancelTarget, setCancelTarget] = useState<Rental | null>(null);

  const marcas = new Map(
    (marcasQuery.data ?? []).map((marca) => [marca.nombre.toLowerCase(), marca.nombre]),
  );

  const openCancelDialog = (rental: Rental) => {
    cancel.reset();
    setCancelTarget(rental);
  };

  const confirmCancel = () => {
    if (!cancelTarget) return;
    cancel.mutate(cancelTarget.id_renta, {
      onSuccess: () => setCancelTarget(null),
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 sm:px-6">
      <header className="mb-8">
        <h1 className="my-0 text-2xl font-semibold tracking-tight sm:text-3xl">
          Mis rentas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Sigue el estado de tus reservas y cancela una renta pendiente si
          cambiaste de planes.
        </p>
      </header>

      {rentalsQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <RentalCardSkeleton key={index} />
          ))}
        </div>
      ) : rentalsQuery.isError ? (
        <RentalsErrorState onRetry={() => rentalsQuery.refetch()} />
      ) : (rentalsQuery.data ?? []).length === 0 ? (
        <RentalsEmptyState />
      ) : (
        <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {(rentalsQuery.data ?? []).map((rental) => {
            const vehicle = vehiclesById.get(rental.id_carro);
            return (
              <li key={rental.id_renta}>
                <RentalCard
                  rental={rental}
                  vehicle={vehicle}
                  marca={
                    vehicle ? marcaLabel(vehicle.id_marca, marcas) : undefined
                  }
                  categoria={
                    vehicle ? categoriaLabel(vehicle.id_categoria) : undefined
                  }
                  onRequestCancel={openCancelDialog}
                />
              </li>
            );
          })}
        </ul>
      )}

      <CancelRentalDialog
        rental={cancelTarget}
        isPending={cancel.isPending}
        error={cancel.error}
        onConfirm={confirmCancel}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
      />

      {cancel.isSuccess && <CancelSuccessNotice onClose={cancel.reset} />}
    </div>
  );
}

export default MyRentalsPage;