import { Badge } from '@/shared/components/ui/badge';
import { categoriaLabel } from '@/shared/utils/catalogo.format';
import { formatCop, formatNumero } from '@/shared/utils/format';
import type { RankingVehiculoItem } from '../types/reports.types';
import { porcentajeSobreTotal } from '../utils/reporte.format';

interface RankingVehiculoTarjetaMovilProps {
  item: RankingVehiculoItem;
  totalIngresosPeriodo: number;
}

/** Lista móvil del ranking: la tabla de 6 columnas no es usable en pantalla chica. */
export function RankingVehiculoTarjetaMovil({
  item,
  totalIngresosPeriodo,
}: RankingVehiculoTarjetaMovilProps) {
  const categoria = item.id_categoria ? categoriaLabel(item.id_categoria) : null;
  const subtitulo = [item.id_marca, categoria].filter(Boolean).join(' · ');
  const porcentaje = porcentajeSobreTotal(item.ingresos, totalIngresosPeriodo);

  return (
    <li className="rounded-xl border border-border/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">
            {item.nombre ?? item.id_carro}
          </p>
          {subtitulo && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {subtitulo}
            </p>
          )}
        </div>
        <Badge variant="outline" className="tabular-nums">
          {formatNumero(porcentaje)}%
        </Badge>
      </div>

      <p className="mt-3 text-lg font-semibold tracking-tight tabular-nums">
        {formatCop(item.ingresos)}
      </p>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border/60 pt-3 text-xs">
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-muted-foreground">Rentas</dt>
          <dd className="font-medium tabular-nums">
            {formatNumero(item.rentas)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-muted-foreground">Días rentados</dt>
          <dd className="font-medium tabular-nums">
            {formatNumero(Math.round(item.dias_rentados))}
          </dd>
        </div>
      </dl>
    </li>
  );
}