import { useState } from 'react';
import { Check } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import {
  ESTADO_LABELS,
  formatTarifa,
} from '../utils/vehicle.format';
import { VehiclePhotoFrame } from './VehiclePhotoFrame';
import type { Vehicle } from '../types/vehicle.types';
import { SpecsSection } from './SpecsSection';

const FEATURE_LABELS: Record<string, string> = {
  aire_acondicionado: 'Aire acondicionado',
  bluetooth: 'Bluetooth',
  camara_reversa: 'Cámara de reversa',
  freno_abs: 'Frenos ABS',
  control_estabilidad: 'Control de estabilidad',
  puertos_usb: 'Puertos USB',
  sistema_sonido: 'Sistema de sonido',
  airbags_frontales: 'Airbags frontales',
  airbags_laterales: 'Airbags laterales',
  alarma_antirrobo: 'Alarma antirrobo',
  luces_led: 'Luces LED',
};

interface VehicleDetailInfoProps {
  vehicle: Vehicle;
}

export function VehicleDetailInfo({ vehicle }: VehicleDetailInfoProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(vehicle.foto) && !imgFailed;

  const anio = Number.isFinite(vehicle.ano) ? String(vehicle.ano) : '—';

  const features = [
    ...new Set<string>(
      Object.entries(FEATURE_LABELS)
        .filter(
          ([key]) => vehicle[key as keyof Vehicle] === true,
        )
        .map(([, label]) => label),
    ),
  ];

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <VehiclePhotoFrame
        src={showImage ? vehicle.foto : null}
        alt={vehicle.nombre}
        onError={() => setImgFailed(true)}
        className="rounded-2xl bg-card"
        overlay={
          vehicle.estado !== 'activo' ? (
            <Badge variant="secondary" className="absolute right-3 top-3">
              {ESTADO_LABELS[vehicle.estado]}
            </Badge>
          ) : null
        }
      />

      <SpecsSection vehicle={vehicle} />

      {features.length > 0 && (
        <section aria-labelledby="equipo-titulo">
          <h2
            id="equipo-titulo"
            className="mb-4! text-lg font-semibold tracking-tight"
          >
            Equipamiento
          </h2>
          <ul className="flex flex-wrap gap-2">
            {features.map((feature) => (
              <li
                key={feature}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] px-3 py-1.5 text-sm font-medium text-accent-foreground"
              >
                <Check className="size-3.5 shrink-0" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-sm text-muted-foreground">
        Tarifa base de{' '}
        <span className="font-semibold text-accent-foreground">
          {formatTarifa(vehicle.tarifa)}
        </span>{' '}
        por día. El total final se calcula según el rango de fechas elegido.{' '}
        {vehicle.ano > 0 ? `Modelo ${anio}.` : ''}
      </p>
    </div>
  );
}

