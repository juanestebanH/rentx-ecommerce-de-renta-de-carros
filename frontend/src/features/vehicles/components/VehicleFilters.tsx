import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/shared/components/ui/card';
import type {
  CatalogDates,
  VehicleFilters as VehicleFiltersValue,
} from '../types/vehicle.types';
import { categoriaLabel } from '@/shared/utils/catalogo.format';
import { transmisionLabel } from '../utils/vehicle.format';
import { FechaRangeInputs } from './FechaRangeInputs';
import { FilterSelect } from './FilterSelect';
import { TarifaRangeInputs } from './TarifaRangeInputs';

const DEFAULT_TRANSMISIONES = ['automatica', 'automatico', 'manual'];

interface VehicleFiltersProps {
  value: VehicleFiltersValue;
  onChange: (filters: VehicleFiltersValue) => void;
  marcas: string[];
  categorias: string[];
  transmisiones?: string[];
  dates?: CatalogDates;
  onDatesChange?: (dates: CatalogDates) => void;
}

export function VehicleFilters({
  value,
  onChange,
  marcas,
  categorias,
  transmisiones = DEFAULT_TRANSMISIONES,
  dates,
  onDatesChange,
}: VehicleFiltersProps) {
  const update = (patch: Partial<VehicleFiltersValue>) =>
    onChange({ ...value, ...patch });

  const clear = () => {
    onChange({});
    onDatesChange?.({});
  };

  const hasActiveFilters = Object.values(value).some(
    (v) => v !== undefined && v !== '',
  );
  const hasActiveDates = Boolean(dates?.fecha_inicio || dates?.fecha_fin);
  const hasAnythingActive = hasActiveFilters || hasActiveDates;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <h2 className="text-base font-semibold">Filtrar carros</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clear}
          disabled={!hasAnythingActive}
        >
          Limpiar filtros
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4">
        <FilterSelect
          value={value.id_marca}
          onChange={(marca) => update({ id_marca: marca })}
          label="Marca"
          placeholder="Todas las marcas"
          options={marcas}
        />
        <FilterSelect
          value={value.id_categoria}
          onChange={(categoria) => update({ id_categoria: categoria })}
          label="Categoría"
          placeholder="Todas las categorías"
          options={categorias}
          formatOption={categoriaLabel}
        />
        <FilterSelect
          value={value.transmision}
          onChange={(transmision) => update({ transmision })}
          label="Transmisión"
          placeholder="Todas las transmisiones"
          options={transmisiones}
          formatOption={transmisionLabel}
        />
        <TarifaRangeInputs value={value} onChange={update} />
        <FechaRangeInputs dates={dates} onDatesChange={onDatesChange} />
      </CardContent>
    </Card>
  );
}