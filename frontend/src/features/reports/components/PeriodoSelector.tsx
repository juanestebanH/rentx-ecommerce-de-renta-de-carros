import { useMemo, useState } from 'react';
import { addDays, format, parseISO, startOfDay } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { cn } from 'cn';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { formatRango } from '@/shared/utils/format';
import {
  MAX_DIAS_PERIODO,
  diasDePeriodo,
  periodoEsteAnio,
  periodoEsteMes,
  periodoUltimosMeses,
  type Periodo,
} from '../utils/reporte.format';

type PresetId = 'este-mes' | 'ultimos-3-meses' | 'este-anio';

const PRESETS: { id: PresetId; label: string; calcular: () => Periodo }[] = [
  { id: 'este-mes', label: 'Este mes', calcular: () => periodoEsteMes() },
  {
    id: 'ultimos-3-meses',
    label: 'Últimos 3 meses',
    calcular: () => periodoUltimosMeses(3),
  },
  { id: 'este-anio', label: 'Este año', calcular: () => periodoEsteAnio() },
];

function rangoDesde(periodo: Periodo): DateRange {
  return { from: parseISO(periodo.desde), to: parseISO(periodo.hasta) };
}

interface PeriodoSelectorProps {
  periodo: Periodo;
  onChange: (periodo: Periodo) => void;
}

export function PeriodoSelector({ periodo, onChange }: PeriodoSelectorProps) {
  const [abierto, setAbierto] = useState(false);
  const [borrador, setBorrador] = useState<DateRange>(() =>
    rangoDesde(periodo),
  );

  const hoy = startOfDay(new Date());
  const presetActivo = useMemo(
    () =>
      PRESETS.find(({ calcular }) => {
        const candidato = calcular();
        return (
          candidato.desde === periodo.desde && candidato.hasta === periodo.hasta
        );
      })?.id,
    [periodo],
  );

  // El tope se aplica sobre el primer día elegido: así el segundo clic nunca
  // puede dejar un rango que el backend rechace.
  const maxHasta = borrador.from
    ? addDays(startOfDay(borrador.from), MAX_DIAS_PERIODO - 1)
    : undefined;

  const aplicarPreset = (id: PresetId) => {
    const siguiente = PRESETS.find((preset) => preset.id === id)?.calcular();
    if (!siguiente) return;
    setBorrador(rangoDesde(siguiente));
    onChange(siguiente);
  };

  const alSeleccionar = (siguiente: DateRange | undefined) => {
    setBorrador(siguiente ?? { from: undefined, to: undefined });
    if (!siguiente?.from || !siguiente.to) return;

    const periodoNuevo: Periodo = {
      desde: format(siguiente.from, 'yyyy-MM-dd'),
      hasta: format(siguiente.to, 'yyyy-MM-dd'),
    };
    if (diasDePeriodo(periodoNuevo.desde, periodoNuevo.hasta) > MAX_DIAS_PERIODO) {
      return;
    }

    onChange(periodoNuevo);
    setAbierto(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => (
        <Button
          key={preset.id}
          type="button"
          size="sm"
          variant={presetActivo === preset.id ? 'default' : 'outline'}
          onClick={() => aplicarPreset(preset.id)}
        >
          {preset.label}
        </Button>
      ))}

      <Popover
        open={abierto}
        onOpenChange={(abierto) => {
          setAbierto(abierto);
          if (abierto) setBorrador(rangoDesde(periodo));
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant={presetActivo ? 'outline' : 'default'}
            className={cn(presetActivo && 'text-muted-foreground')}
          >
            <CalendarIcon aria-hidden="true" />
            {presetActivo ? 'Otro periodo' : formatRango(periodo.desde, periodo.hasta)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={borrador}
            onSelect={alSeleccionar}
            defaultMonth={borrador.from}
            disabled={[{ after: hoy }, ...(maxHasta ? [{ after: maxHasta }] : [])]}
            numberOfMonths={1}
          />
          <p className="border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">
            Máximo {MAX_DIAS_PERIODO} días por consulta.
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}