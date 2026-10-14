import { CheckCircle2 } from 'lucide-react';
import { cn } from 'cn';
import { MOTIVO_LABELS, type MotivoRenta } from '../../utils/rental.acciones';
import type { ConteoMotivos } from '../../utils/renta.resumen';

export type VistaRentas = 'accionables' | 'todas';

const ORDEN_MOTIVOS: MotivoRenta[] = [
  'pago_por_confirmar',
  'renta_por_confirmar',
  'renta_por_iniciar',
  'renta_por_finalizar',
];

// El pago es el único motivo que no es avanzar el ciclo: es esperar a un
// humano, y por eso lee en ámbar igual que el badge de renta pendiente.
const MOTIVO_DOT: Record<MotivoRenta, string> = {
  pago_por_confirmar: 'bg-amber-500',
  renta_por_confirmar: 'bg-primary',
  renta_por_iniciar: 'bg-primary',
  renta_por_finalizar: 'bg-primary',
};

interface RentasSegmentosProps {
  vista: VistaRentas;
  onVistaChange: (vista: VistaRentas) => void;
  conteo: ConteoMotivos;
  totalRentas: number;
}

export function RentasSegmentos({
  vista,
  onVistaChange,
  conteo,
  totalRentas,
}: RentasSegmentosProps) {
  const enAccion = vista === 'accionables';
  const desglose = ORDEN_MOTIVOS.filter((motivo) => conteo.porMotivo[motivo] > 0);

  return (
    <section
      aria-label="Segmento de rentas"
      className="rounded-xl border border-border bg-card"
    >
      <div
        role="group"
        className="flex flex-wrap items-stretch gap-1.5 p-1.5"
      >
        <SegmentoButton
          activo={enAccion}
          onClick={() => onVistaChange('accionables')}
          conteo={conteo.total}
          emphasized
          label="Requieren acción"
        />
        <SegmentoButton
          activo={!enAccion}
          onClick={() => onVistaChange('todas')}
          conteo={totalRentas}
          label="Todas"
        />
      </div>

      <div className="border-t border-border px-4 py-2.5">
        {!enAccion ? (
          <p className="text-sm text-muted-foreground">
            Las {totalRentas} rentas del panel, en el orden del servidor.
          </p>
        ) : conteo.total === 0 ? (
          <p className="flex items-center gap-2 text-sm font-medium text-accent-foreground">
            <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden="true" />
            Nada pendiente: cada renta con su pago y su estado al día.
          </p>
        ) : (
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {desglose.map((motivo) => (
              <li
                key={motivo}
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <span
                  aria-hidden="true"
                  className={cn('size-2 shrink-0 rounded-full', MOTIVO_DOT[motivo])}
                />
                <span className="font-semibold tabular-nums text-foreground">
                  {conteo.porMotivo[motivo]}
                </span>
                {MOTIVO_LABELS[motivo]}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

interface SegmentoButtonProps {
  activo: boolean;
  onClick: () => void;
  conteo: number;
  label: string;
  emphasized?: boolean;
}

function SegmentoButton({
  activo,
  onClick,
  conteo,
  label,
  emphasized = false,
}: SegmentoButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-between gap-3 rounded-lg border px-3.5 py-2 text-left transition-colors',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        activo
          ? 'border-[var(--accent-border)] bg-[var(--accent-bg)] text-accent-foreground'
          : 'border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className={cn(
          'shrink-0 tabular-nums leading-none',
          emphasized
            ? 'text-2xl font-semibold tracking-tight'
            : 'text-sm font-semibold',
          !activo && 'text-muted-foreground',
        )}
      >
        {conteo}
      </span>
    </button>
  );
}
