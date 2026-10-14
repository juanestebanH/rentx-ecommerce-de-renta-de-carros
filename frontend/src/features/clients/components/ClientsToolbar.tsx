import { Search, Users } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { ClienteEstado } from '../types/clients.types';

export type EstadoFilter = 'todos' | ClienteEstado;

interface ClientsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  estadoFilter: EstadoFilter;
  onEstadoFilterChange: (value: EstadoFilter) => void;
  totalCount: number;
  shownCount: number;
  filterActive: boolean;
}

export function ClientsToolbar({
  searchQuery,
  onSearchChange,
  estadoFilter,
  onEstadoFilterChange,
  totalCount,
  shownCount,
  filterActive,
}: ClientsToolbarProps) {
  const contador = filterActive
    ? `${shownCount} de ${totalCount}`
    : `${totalCount}`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative w-full sm:max-w-xs">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nombre, email o licencia"
          aria-label="Buscar clientes"
          className="pl-9"
        />
      </div>

      <Select
        value={estadoFilter}
        onValueChange={(value) => onEstadoFilterChange(value as EstadoFilter)}
      >
        <SelectTrigger size="sm" aria-label="Filtrar por estado" className="sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los estados</SelectItem>
          <SelectItem value="activo">Activos</SelectItem>
          <SelectItem value="inactivo">Inactivos</SelectItem>
        </SelectContent>
      </Select>

      <p
        aria-live="polite"
        className="flex items-center gap-1.5 text-sm text-muted-foreground sm:ml-auto"
      >
        <Users className="size-4" aria-hidden="true" />
        {contador} {totalCount === 1 ? 'cliente' : 'clientes'}
      </p>
    </div>
  );
}