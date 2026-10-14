import { Eye, Loader2 } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/shared/components/ui/button';
import { RentalStatusBadge } from '../RentalStatusBadge';
import { labelAccionFila } from '../../utils/rental.acciones';
import {
  etiquetaPlazo,
  formatCurrencyCOP,
  formatRangoFechas,
} from '../../utils/rental.format';
import type { ResumenRenta } from '../../utils/renta.resumen';

interface RentasTableRowProps {
  resumen: ResumenRenta;
  seleccionado: boolean;
  pendiente: boolean;
  onSelect: () => void;
  onAccion: () => void;
}

export function RentasTableRow({
  resumen,
  seleccionado,
  pendiente,
  onSelect,
  onAccion,
}: RentasTableRowProps) {
  const { renta, accion } = resumen;
  const vencida = resumen.diasVencimiento !== null && resumen.diasVencimiento < 0;
  const enCurso = renta.estado === 'en_curso';

  return (
    <tr
      onClick={onSelect}
      className={cn(
        'cursor-pointer border-b border-border/60 align-top transition-colors last:border-0',
        seleccionado
          ? 'bg-[var(--accent-bg)]'
          : 'hover:bg-accent/50 focus-within:bg-accent/50',
      )}
    >
      <td className="py-3 pr-3">
        <p className="max-w-[10rem] truncate font-medium" title={resumen.clienteNombre}>
          {resumen.clienteNombre}
        </p>
        {resumen.cliente && (
          <p className="mt-0.5 max-w-[10rem] truncate text-xs text-muted-foreground">
            {resumen.cliente.email}
          </p>
        )}
      </td>

      <td className="py-3 pr-3">
        {resumen.carroNombre ? (
          <>
            <p className="max-w-[9rem] truncate" title={resumen.carroNombre}>
              {resumen.carroNombre}
            </p>
            <span className="mt-0.5 inline-block rounded border border-border px-1 py-px font-mono text-xs text-muted-foreground">
              {resumen.idCarro}
            </span>
          </>
        ) : (
          <span className="italic text-muted-foreground">Carro eliminado</span>
        )}
      </td>

      <td className="py-3 pr-3 whitespace-nowrap">
        <p className="tabular-nums text-muted-foreground">
          {formatRangoFechas(renta.fecha_inicio, renta.fecha_fin)}
        </p>
        {resumen.diasVencimiento !== null && (
          <p
            className={cn(
              'mt-0.5 text-xs',
              vencida ? 'font-medium text-amber-800' : 'text-muted-foreground',
            )}
          >
            {etiquetaPlazo(
              resumen.diasVencimiento,
              enCurso ? 'Terminó' : 'Inició',
              enCurso ? 'Termina' : 'Inicia',
            )}
          </p>
        )}
      </td>

      <td className="py-3 pr-3 text-right tabular-nums">
        {resumen.totalEsperado === null ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          formatCurrencyCOP(resumen.totalEsperado)
        )}
      </td>

      <td className="py-3 pr-3">
        <p className="tabular-nums">
          {resumen.pagos.length === 0 ? (
            <span className="text-muted-foreground">Sin pagos</span>
          ) : (
            formatCurrencyCOP(resumen.pagado)
          )}
        </p>
        {resumen.totalEsperado !== null && (
          <p
            className={cn(
              'mt-0.5 text-xs',
              (resumen.saldo ?? 0) > 0
                ? 'text-amber-800'
                : 'font-medium text-accent-foreground',
            )}
          >
            {(resumen.saldo ?? 0) > 0
              ? `Salda ${formatCurrencyCOP(resumen.saldo ?? 0)}`
              : 'Completo'}
          </p>
        )}
      </td>

      <td className="py-3 pr-3">
        <RentalStatusBadge estado={renta.estado} />
      </td>

      <td className="py-3 text-right" onClick={(event) => event.stopPropagation()}>
        {accion ? (
          <Button
            size="xs"
            onClick={onAccion}
            disabled={pendiente}
            aria-label={`${labelAccionFila(accion, resumen.pagosPorConfirmar.length)} — ${resumen.clienteNombre}`}
          >
            {pendiente && <Loader2 className="animate-spin" aria-hidden="true" />}
            {labelAccionFila(accion, resumen.pagosPorConfirmar.length)}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onAccion}
            aria-label={`Ver detalle de la renta de ${resumen.clienteNombre}`}
          >
            <Eye className="size-4" aria-hidden="true" />
          </Button>
        )}
      </td>
    </tr>
  );
}
