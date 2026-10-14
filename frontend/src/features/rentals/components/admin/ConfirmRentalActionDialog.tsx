import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { METODO_PAGO_LABELS } from '@/features/payments/utils/payment.format';
import type { Payment } from '@/features/payments/types/payment.types';
import { ACCION_META, type AccionRenta } from '../../utils/rental.acciones';
import {
  RENTA_ESTADO_LABELS,
  formatCurrencyCOP,
  formatRangoFechas,
  rentalDiasLabel,
} from '../../utils/rental.format';
import type { ResumenRenta } from '../../utils/renta.resumen';

export interface RentalActionTarget {
  accion: AccionRenta;
  resumen: ResumenRenta;
  pago: Payment | null;
}

interface ConfirmRentalActionDialogProps {
  target: RentalActionTarget | null;
  isPending: boolean;
  error: string | null;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

function copyDe(accion: AccionRenta, resumen: ResumenRenta, pago: Payment | null) {
  const rango = formatRangoFechas(resumen.renta.fecha_inicio, resumen.renta.fecha_fin);
  const duracion = rentalDiasLabel(resumen.renta.dias_duracion);
  const meta = ACCION_META[accion];

  switch (accion) {
    case 'confirmar_pago':
      return {
        titulo: '¿Confirmar este pago?',
        descripcion: pago
          ? `El pago de ${formatCurrencyCOP(pago.total_pago)} por ${METODO_PAGO_LABELS[pago.metodo_pago].toLowerCase()} quedará completado. La renta ${resumen.renta.id_renta} seguirá pendiente hasta que los pagos completados cubran el total.`
          : 'El pago quedará completado.',
      };
    case 'confirmar_renta':
      return {
        titulo: `¿Confirmar la renta de ${resumen.clienteNombre}?`,
        descripcion: `La renta del ${rango} (${duracion}) pasará de ${RENTA_ESTADO_LABELS.pendiente} a ${RENTA_ESTADO_LABELS.confirmada} y el carro quedará reservado para esas fechas.`,
      };
    case 'iniciar_renta':
      return {
        titulo: `¿Iniciar la renta de ${resumen.clienteNombre}?`,
        descripcion: `La renta del ${rango} pasará de ${RENTA_ESTADO_LABELS.confirmada} a ${RENTA_ESTADO_LABELS.en_curso}. El carro se registra como rentado desde hoy.`,
      };
    case 'finalizar_renta':
      return {
        titulo: `¿Finalizar la renta de ${resumen.clienteNombre}?`,
        descripcion: `La renta del ${rango} pasará de ${RENTA_ESTADO_LABELS.en_curso} a ${RENTA_ESTADO_LABELS.finalizada} y el carro vuelve a estar disponible en la flota.`,
      };
    case 'cancelar_renta':
      return {
        titulo: `¿Cancelar la renta de ${resumen.clienteNombre}?`,
        descripcion: `La renta del ${rango} (${duracion}) quedará ${meta.resultado} y el carro se liberará para otras fechas. Los pagos ya registrados no se modifican y la cancelación no se puede deshacer.`,
      };
    case 'registrar_pago':
      return {
        titulo: 'Registrar un pago',
        descripcion: 'Se añadirá el pago a la renta.',
      };
  }
}

export function ConfirmRentalActionDialog({
  target,
  isPending,
  error,
  onConfirm,
  onOpenChange,
}: ConfirmRentalActionDialogProps) {
  const copy = target ? copyDe(target.accion, target.resumen, target.pago) : null;
  const destructiva = target?.accion === 'cancelar_renta';

  return (
    <Dialog open={target !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{copy?.titulo}</DialogTitle>
          <DialogDescription>{copy?.descripcion}</DialogDescription>
        </DialogHeader>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {destructiva ? 'Mantener renta' : 'Volver'}
          </Button>
          <Button
            variant={destructiva ? 'destructive' : 'default'}
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
            {target ? ACCION_META[target.accion].label : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
