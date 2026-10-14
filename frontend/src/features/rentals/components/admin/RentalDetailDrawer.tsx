import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { SideDrawer } from '@/shared/components/ui/SideDrawer';
import { useRetainedValue } from '@/shared/hooks/useRetainedValue';
import type { MetodoPago, Payment } from '@/features/payments/types/payment.types';
import { RentalStatusBadge } from '../RentalStatusBadge';
import { ACCION_META, type AccionRenta } from '../../utils/rental.acciones';
import {
  formatCurrencyCOP,
  formatRentalFechas,
  formatRangoFechas,
  rentalDiasLabel,
} from '../../utils/rental.format';
import type { ResumenRenta } from '../../utils/renta.resumen';
import { RentalPaymentPanel } from './RentalPaymentPanel';

interface PagosState {
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  pagoConfirmandoId: string | null;
  registrando: boolean;
}

interface RentalDetailDrawerProps {
  resumen: ResumenRenta | null;
  pagos: PagosState;
  accionPendiente: AccionRenta | null;
  onConfirmarPago: (pago: Payment) => void;
  onRegistrarPago: (input: {
    metodo_pago: MetodoPago;
    total_pago: number;
  }) => Promise<boolean>;
  onAccion: (accion: AccionRenta) => void;
  onClose: () => void;
}

export function RentalDetailDrawer({
  resumen,
  pagos,
  accionPendiente,
  onConfirmarPago,
  onRegistrarPago,
  onAccion,
  onClose,
}: RentalDetailDrawerProps) {
  // Se conserva el último resumen para que la animación de salida no muestre
  // el panel vacío cuando el padre limpia la selección al cerrar.
  const contenido = useRetainedValue(resumen);

  return (
    <SideDrawer
      open={resumen !== null}
      onClose={onClose}
      eyebrow="Detalle de la renta"
      title={contenido?.clienteNombre ?? ''}
      subtitle={contenido?.renta.id_renta ?? ''}
    >
      {contenido && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <RentalStatusBadge estado={contenido.renta.estado} />
            <span className="rounded border border-border px-1 py-px font-mono text-xs text-muted-foreground">
              {contenido.idCarro}
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Dato term="Vehículo" valor={contenido.carroNombre ?? 'Carro eliminado'} />
            <Dato
              term="Rango"
              valor={formatRangoFechas(
                contenido.renta.fecha_inicio,
                contenido.renta.fecha_fin,
              )}
            />
            <Dato
              term="Duración"
              valor={rentalDiasLabel(contenido.renta.dias_duracion)}
            />
            <Dato
              term="Total esperado"
              valor={
                contenido.totalEsperado === null
                  ? '—'
                  : formatCurrencyCOP(contenido.totalEsperado)
              }
              tabular
            />
            <Dato
              term="Registrada"
              valor={formatRentalFechas(contenido.renta.fecha_registro)}
            />
            <Dato
              term="Licencia"
              valor={contenido.cliente?.numero_licencia ?? '—'}
            />
          </dl>

          {contenido.cliente && (
            <p className="mt-3 text-sm text-muted-foreground">
              {contenido.cliente.email} · {contenido.cliente.telefono}
            </p>
          )}

          <div className="mt-6 border-t border-border pt-5">
            <RentalPaymentPanel
              resumen={contenido}
              isLoading={pagos.isLoading}
              error={pagos.error}
              onRetry={pagos.onRetry}
              pagoConfirmandoId={pagos.pagoConfirmandoId}
              onConfirmarPago={onConfirmarPago}
              registrando={pagos.registrando}
              onRegistrarPago={onRegistrarPago}
            />
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Acciones
            </h3>
            <AccionesRenta
              resumen={contenido}
              pendiente={accionPendiente}
              onAccion={onAccion}
            />
          </div>
        </>
      )}
    </SideDrawer>
  );
}

interface DatoProps {
  term: string;
  valor: string;
  tabular?: boolean;
}

function Dato({ term, valor, tabular = false }: DatoProps) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className={`mt-0.5 truncate ${tabular ? 'tabular-nums' : ''}`}>{valor}</dd>
    </div>
  );
}

interface AccionesRentaProps {
  resumen: ResumenRenta;
  pendiente: AccionRenta | null;
  onAccion: (accion: AccionRenta) => void;
}

function AccionesRenta({ resumen, pendiente, onAccion }: AccionesRentaProps) {
  if (resumen.accionesLegales.length === 0) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        {resumen.renta.estado === 'pendiente'
          ? 'Esta renta espera a que el cliente complete el pago. El backend la confirma sola cuando los pagos completados cubren el total.'
          : 'Esta renta está cerrada: no admite más cambios de estado.'}
      </p>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      {resumen.accionesLegales.map((accion) => {
        const meta = ACCION_META[accion];
        const enVuelo = pendiente === accion;
        return (
          <Button
            key={accion}
            variant={meta.variant}
            onClick={() => onAccion(accion)}
            disabled={pendiente !== null}
            className="w-full justify-center"
          >
            {enVuelo && <Loader2 className="animate-spin" aria-hidden="true" />}
            {meta.label}
          </Button>
        );
      })}
    </div>
  );
}
