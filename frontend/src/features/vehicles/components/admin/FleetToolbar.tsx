import { CarFront, Plus, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { VehicleEstado } from '../../types/vehicle.types';
import type { TipoOcupacion } from '../../utils/occupancy';

export type EstadoFilter = 'todos' | VehicleEstado;
export type OcupacionFilter = 'todas' | TipoOcupacion;

interface FleetToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  estadoFilter: EstadoFilter;
  onEstadoFilterChange: (value: EstadoFilter) => void;
  ocupacionFilter: OcupacionFilter;
  onOcupacionFilterChange: (value: OcupacionFilter) => void;
  shownCount: number;
  totalCount: number;
  filterActive: boolean;
  onNew: () => void;
}

export function FleetToolbar({
  searchQuery,
  onSearchChange,
  estadoFilter,
  onEstadoFilterChange,
  ocupacionFilter,
  onOcupacionFilterChange,
  shownCount,
  totalCount,
  filterActive,
  onNew,
}: FleetToolbarProps) {
  const contador = filterActive
    ? `${shownCount} de ${totalCount}`
    : `${totalCount}`;

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative w-full md:max-w-xs">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por placa o nombre"
          aria-label="Buscar vehículos"
          className="pl-9"
        />
      </div>

      <Select
        value={estadoFilter}
        onValueChange={(value) => onEstadoFilterChange(value as EstadoFilter)}
      >
        <SelectTrigger
          size="sm"
          aria-label="Filtrar por estado"
          className="md:w-44"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los estados</SelectItem>
          <SelectItem value="activo">Activos</SelectItem>
          <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
          <SelectItem value="inactivo">Inactivos</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={ocupacionFilter}
        onValueChange={(value) => onOcupacionFilterChange(value as OcupacionFilter)}
      >
        <SelectTrigger
          size="sm"
          aria-label="Filtrar por ocupación"
          className="md:w-48"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas las ocupaciones</SelectItem>
          <SelectItem value="disponible">Disponibles</SelectItem>
          <SelectItem value="en_uso">En uso</SelectItem>
          <SelectItem value="reservado">Reservados</SelectItem>
        </SelectContent>
      </Select>

      <p
        aria-live="polite"
        className="flex items-center gap-1.5 text-sm text-muted-foreground md:ml-auto"
      >
        <CarFront className="size-4" aria-hidden="true" />
        {contador} {totalCount === 1 ? 'vehículo' : 'vehículos'}
      </p>

      <Button onClick={onNew}>
        <Plus className="size-4" aria-hidden="true" />
        Nuevo carro
      </Button>
    </div>
  );
}