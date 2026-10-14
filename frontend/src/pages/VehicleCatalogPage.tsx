import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/shared/components/ui/button';
import { CatalogHeader } from '@/features/vehicles/components/CatalogHeader';
import { CatalogResults } from '@/features/vehicles/components/CatalogResults';
import type { CatalogSortValue } from '@/features/vehicles/components/CatalogSortSelect';
import { VehicleFilters } from '@/features/vehicles/components/VehicleFilters';
import { useCatalogAvailability } from '@/features/vehicles/hooks/useCatalogAvailability';
import {
  useCategorias,
  useMarcas,
  useVehicles,
} from '@/features/vehicles/hooks/useVehicles';
import type {
  CatalogDates,
  VehicleFilters as VehicleFiltersValue,
} from '@/features/vehicles/types/vehicle.types';
import {
  initialCatalogDatesFromUrl,
  initialCatalogFiltersFromUrl,
} from '@/features/vehicles/utils/catalogUrl';

function VehicleCatalogPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<VehicleFiltersValue>(() =>
    initialCatalogFiltersFromUrl(searchParams),
  );
  const [dates, setDates] = useState<CatalogDates>(() =>
    initialCatalogDatesFromUrl(searchParams),
  );
  const [sort, setSort] = useState<CatalogSortValue>('precio-asc');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const vehiclesQuery = useVehicles(filters);
  const marcasQuery = useMarcas();
  const categoriasQuery = useCategorias();

  const attributeFiltered = vehiclesQuery.data ?? [];

  const marcas = (marcasQuery.data ?? []).map((marca) => marca.nombre);
  const categorias = (categoriasQuery.data ?? []).map(
    (categoria) => categoria.nombre,
  );
  const transmisiones = [
    ...new Set(attributeFiltered.map((vehicle) => vehicle.transmision)),
  ];

  const hasDates = Boolean(dates.fecha_inicio && dates.fecha_fin);
  const { isPending: availabilityPending, data: availabilityMap } =
    useCatalogAvailability(attributeFiltered, dates);

  const filteredVehicles = useMemo(() => {
    const base = vehiclesQuery.data ?? [];
    if (!hasDates) return base;
    if (!availabilityMap) return [];
    return base.filter(
      (vehicle) => availabilityMap[vehicle.id_carro] === true,
    );
  }, [vehiclesQuery.data, availabilityMap, hasDates]);

  const sortedVehicles = useMemo(() => {
    const list = [...filteredVehicles];
    switch (sort) {
      case 'precio-asc':
        list.sort((a, b) => a.tarifa - b.tarifa);
        break;
      case 'precio-desc':
        list.sort((a, b) => b.tarifa - a.tarifa);
        break;
      case 'recientes':
        list.sort((a, b) => b.ano - a.ano);
        break;
    }
    return list;
  }, [filteredVehicles, sort]);

  const total = filteredVehicles.length;
  const hasFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== '',
  );
  const activeFilterCount = (hasFilters ? 1 : 0) + (hasDates ? 1 : 0);
  const showAvailabilityLoading = hasDates && availabilityPending;
  const resultsReady =
    !vehiclesQuery.isLoading && !vehiclesQuery.isError && !showAvailabilityLoading;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-8 sm:px-6">
      <CatalogHeader
        total={total}
        resultsReady={resultsReady}
        sort={sort}
        onSortChange={setSort}
      />

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[280px]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
            className="flex w-full items-center justify-between lg:hidden"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="size-4" />
              Filtros
            </span>
            {activeFilterCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <div
            className={cn(
              'mt-4 lg:mt-0',
              filtersOpen ? 'block' : 'hidden',
              'lg:block',
            )}
          >
            <VehicleFilters
              value={filters}
              onChange={setFilters}
              marcas={marcas}
              categorias={categorias}
              transmisiones={transmisiones}
              dates={dates}
              onDatesChange={setDates}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <CatalogResults
            vehicles={sortedVehicles}
            dates={dates}
            isLoading={vehiclesQuery.isLoading}
            isLoadingAvailability={showAvailabilityLoading}
            isError={vehiclesQuery.isError}
            total={total}
            hasFilters={hasFilters}
            hasDates={hasDates}
            onRetry={() => vehiclesQuery.refetch()}
            onClear={() => {
              setFilters({});
              setDates({});
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default VehicleCatalogPage;