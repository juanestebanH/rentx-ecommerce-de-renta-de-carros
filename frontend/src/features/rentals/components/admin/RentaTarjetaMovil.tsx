import { Eye, Loader2 } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/shared/components/ui/button';
import { RentalStatusBadge } from '../RentalStatusBadge';
import { labelAccionFila } from '../../utils/rental.acciones';
import {
  etiquetaPlazo,
  formatCurrencyCOP,
  formatRangoFechas,
  rentalDiasLabel,
} from '../../utils/rental.format';
import type { ResumenRenta } from '../../utils/renta.resumen';

interface RentaTarjetaMovilProps {
  resumen: ResumenRenta;
  pendiente: boolean;
  onSelect: () => void;
  onAccion: () => void;
}

export function RentaTarjetaMovil({
  resumen,
  pendiente,
  onSelect,
  onAccion,
}: RentaTarjetaMovilProps) {
  const { renta, accion } = resumen;
  const vencida = resumen.diasVencimiento !== null && resumen.diasVencimiento < 0;
  const enCurso = renta.estado === 'en_curso';

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{resumen.clienteNombre}</p>
          {resumen.cliente && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {resumen.cliente.email}
            </p>
          )}
        </div>
        <RentalStatusBadge estado={renta.estado} />
      </div>

      <p className="mt-3 text-sm">
        {resumen.carroNombre ?? (
          <span className="italic text-muted-foreground">Carro eliminado</span>
        )}
        {resumen.carroNombre && (
          <span className="ml-1.5 rounded border border-border px-1 py-px font-mono text-xs text-muted-foreground">
            {resumen.idCarro}
          </span>
        )}
      </p>

      <p className="mt-1.5 text-sm tabular-nums text-muted-foreground">
        {formatRangoFechas(renta.fecha_inicio, renta.fecha_fin)} ·{' '}
        {rentalDiasLabel(renta.dias_duracion)}
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

      <div className="mt-3 flex flex-wrap items-baseline gap-x-2 text-sm">
        <span className="tabular-nums">
          {resumen.totalEsperado === null
            ? 'Total desconocido'
            : formatCurrencyCOP(resumen.totalEsperado)}
        </span>
        {resumen.pagos.length > 0 && (
          <span className="tabular-nums text-muted-foreground">
            · {formatCurrencyCOP(resumen.pagado)} pagado
          </span>
        )}
        {resumen.totalEsperado !== null && (resumen.saldo ?? 0) > 0 && (
          <span className="tabular-nums font-medium text-amber-800">
            · Salda {formatCurrencyCOP(resumen.saldo ?? 0)}
          </span>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {accion ? (
          <>
            <Button size="sm" onClick={onAccion} disabled={pendiente} className="flex-1">
              {pendiente && <Loader2 className="animate-spin" aria-hidden="true" />}
              {labelAccionFila(accion, resumen.pagosPorConfirmar.length)}
            </Button>
            <Button variant="ghost" size="sm" onClick={onSelect}>
              Ficha
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={onSelect} className="flex-1">
            <Eye className="size-4" aria-hidden="true" />
            Ver detalle
          </Button>
        )}
      </div>
    </li>
  );
}
