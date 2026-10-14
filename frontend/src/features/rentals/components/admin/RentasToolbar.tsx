import { Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { RentalEstado } from '../../types/rental.types';
import { RentasFiltroFechas } from './RentasFiltroFechas';

export type EstadoFilter = 'todos' | RentalEstado;

export type RangoFechas = { desde: string; hasta: string };

const ESTADOS: { value: EstadoFilter; label: string }[] = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'finalizada', label: 'Finalizada' },
  { value: 'cancelada', label: 'Cancelada' },
];

interface RentasToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  estadoFilter: EstadoFilter;
  onEstadoFilterChange: (value: EstadoFilter) => void;
  rango: RangoFechas;
  onRangoChange: (rango: RangoFechas) => void;
  shownCount: number;
  totalCount: number;
  filterActive: boolean;
}

/**
 * Tres controles y el contador. El riel de admin se come 256px, así que el
 * breakpoint `lg` es del viewport: a partir de ahí la fila completa cabe con
 * menú desplegado, que es donde se rompe.
 */
export function RentasToolbar({
  searchQuery,
  onSearchChange,
  estadoFilter,
  onEstadoFilterChange,
  rango,
  onRangoChange,
  shownCount,
  totalCount,
  filterActive,
}: RentasToolbarProps) {
  const contador = filterActive ? `${shownCount} de ${totalCount}` : `${totalCount}`;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative w-full lg:max-w-xs">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Cliente, email, placa o carro"
          aria-label="Buscar rentas"
          className="pl-9"
        />
      </div>

      <Select
        value={estadoFilter}
        onValueChange={(value) => onEstadoFilterChange(value as EstadoFilter)}
      >
        <SelectTrigger size="sm" aria-label="Filtrar por estado" className="w-full lg:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ESTADOS.map((estado) => (
            <SelectItem key={estado.value} value={estado.value}>
              {estado.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <RentasFiltroFechas rango={rango} onRangoChange={onRangoChange} />

      <p
        aria-live="polite"
        className="text-sm text-muted-foreground lg:ml-auto"
      >
        {contador} {totalCount === 1 ? 'renta' : 'rentas'}
      </p>
    </div>
  );
}