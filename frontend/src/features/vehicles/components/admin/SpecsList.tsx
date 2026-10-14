import { categoriaLabel } from '@/shared/utils/catalogo.format';
import { transmisionLabel } from '../../utils/vehicle.format';
import type { Vehicle } from '../../types/vehicle.types';

interface SpecsListProps {
  vehicle: Vehicle;
}

export function SpecsList({ vehicle }: SpecsListProps) {
  const capacidad = Number.isFinite(vehicle.capacidad)
    ? `${vehicle.capacidad} pasajeros`
    : '—';

  const specs = [
    { label: 'Marca', value: vehicle.id_marca },
    { label: 'Categoría', value: categoriaLabel(vehicle.id_categoria) },
    { label: 'Transmisión', value: transmisionLabel(vehicle.transmision) },
    { label: 'Combustible', value: vehicle.combustible },
    { label: 'Capacidad', value: capacidad },
    { label: 'Seguro', value: vehicle.seguro ? 'Incluido' : 'No incluido' },
  ];

  return (
    <section aria-labelledby="admin-specs-titulo" className="mt-6">
      <h2
        id="admin-specs-titulo"
        className="text-lg font-semibold tracking-tight"
      >
        Especificaciones
      </h2>
      <dl className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-border bg-muted/20">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="flex items-center justify-between gap-3 px-3.5 py-2.5"
          >
            <dt className="shrink-0 text-sm text-muted-foreground">
              {spec.label}
            </dt>
            <dd className="truncate text-sm font-medium text-foreground">
              {spec.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}