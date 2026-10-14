import type { ReactNode } from 'react';
import {
  Cog,
  Fuel,
  ShieldCheck,
  Tag,
  Users,
} from 'lucide-react';
import { categoriaLabel } from '@/shared/utils/catalogo.format';
import { transmisionLabel } from '../utils/vehicle.format';
import type { Vehicle } from '../types/vehicle.types';

interface SpecsSectionProps {
  vehicle: Vehicle;
}

export function SpecsSection({ vehicle }: SpecsSectionProps) {
  const capacidad = Number.isFinite(vehicle.capacidad)
    ? `${vehicle.capacidad} pasajeros`
    : '—';

  const specs = [
    {
      icon: <Tag className='size-4' aria-hidden='true' />,
      label: 'Marca',
      value: vehicle.id_marca,
    },
    {
      icon: <Cog className='size-4' aria-hidden='true' />,
      label: 'Categoría',
      value: categoriaLabel(vehicle.id_categoria),
    },
    {
      icon: <Cog className='size-4' aria-hidden='true' />,
      label: 'Transmisión',
      value: transmisionLabel(vehicle.transmision),
    },
    {
      icon: <Fuel className='size-4' aria-hidden='true' />,
      label: 'Combustible',
      value: vehicle.combustible,
    },
    {
      icon: <Users className='size-4' aria-hidden='true' />,
      label: 'Capacidad',
      value: capacidad,
    },
    {
      icon: <ShieldCheck className='size-4' aria-hidden='true' />,
      label: 'Seguro',
      value: vehicle.seguro ? 'Incluido' : 'No incluido',
    },
  ];

  return (
    <section aria-labelledby='specs-titulo'>
      <h2
        id='specs-titulo'
        className='mb-8! text-lg font-semibold tracking-tight'
      >
        Especificaciones
      </h2>
      <dl className='grid grid-cols-2 gap-x-10 gap-y-8 lg:grid-cols-3'>
        {specs.map((spec) => (
          <SpecRow
            key={spec.label}
            icon={spec.icon}
            label={spec.label}
            value={spec.value}
          />
        ))}
      </dl>
    </section>
  );
}

interface SpecRowProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function SpecRow({ icon, label, value }: SpecRowProps) {
  return (
    <div className='border-b border-border/60 pb-6'>
      <dt className='flex items-center gap-2 text-muted-foreground'>
        <span className='flex size-8 items-center justify-center rounded-full bg-[var(--accent-bg)] text-primary'>
          {icon}
        </span>
        <span className='text-xs font-semibold uppercase tracking-[0.18em]'>{label}</span>
      </dt>
      <dd className='mt-3 text-xl! font-semibold tracking-tight text-foreground'>
        {value}
      </dd>
    </div>
  );
}
