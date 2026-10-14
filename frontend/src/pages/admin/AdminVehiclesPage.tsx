import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  useAdminVehicles,
  useUpdateVehicleEstado,
} from '@/features/vehicles/hooks/useAdminVehicles';
import { useAdminRentals } from '@/features/rentals/hooks/useRentals';
import { ocupacionPorCarro } from '@/features/vehicles/utils/occupancy';
import { vehicleErrorMensaje } from '@/features/vehicles/utils/vehicle.format';
import { FleetToolbar, type EstadoFilter, type OcupacionFilter } from '@/features/vehicles/components/admin/FleetToolbar';
import { FleetTable } from '@/features/vehicles/components/admin/FleetTable';
import {
  ConfirmEstadoChangeDialog,
  type EstadoConfirmTarget,
} from '@/features/vehicles/components/admin/ConfirmEstadoChangeDialog';
import { VehicleDetailDrawer } from '@/features/vehicles/components/admin/VehicleDetailDrawer';
import type { Vehicle, VehicleEstado } from '@/features/vehicles/types/vehicle.types';
import { PaginationBar } from '@/shared/components/PaginationBar';
import { usePagination } from '@/shared/hooks/usePagination';

function AdminVehiclesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('todos');
  const [ocupacionFilter, setOcupacionFilter] =
    useState<OcupacionFilter>('todas');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<EstadoConfirmTarget | null>(
    null,
  );
  const [estadoError, setEstadoError] = useState<unknown>(null);

  const vehiclesQuery = useAdminVehicles();
  const rentalsQuery = useAdminRentals();
  const estadoMutation = useUpdateVehicleEstado();

  const vehicles = vehiclesQuery.data;

  const ocupaciones = useMemo(
    () => ocupacionPorCarro(rentalsQuery.data),
    [rentalsQuery.data],
  );

  const filtered = useMemo(() => {
    if (!vehicles) return [];
    const q = query.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      if (estadoFilter !== 'todos' && vehicle.estado !== estadoFilter) {
        return false;
      }
      if (ocupacionFilter !== 'todas') {
        if (vehicle.estado !== 'activo') return false;
        const oc = ocupaciones.get(vehicle.id_carro);
        if (ocupacionFilter === 'disponible') {
          if (oc) return false;
        } else if (oc?.tipo !== ocupacionFilter) {
          return false;
        }
      }
      if (!q) return true;
      return (
        vehicle.id_carro.toLowerCase().includes(q) ||
        vehicle.nombre.toLowerCase().includes(q)
      );
    });
  }, [vehicles, query, estadoFilter, ocupacionFilter, ocupaciones]);

  const tablaRef = useRef<HTMLDivElement>(null);
  const paginacion = usePagination(filtered, {
    pageSize: 10,
    resetKey: `${query}|${estadoFilter}|${ocupacionFilter}`,
    scrollTargetRef: tablaRef,
  });

  const selectedVehicle =
    vehicles?.find((vehicle) => vehicle.id_carro === selectedId) ?? null;

  const filterActive =
    query.trim().length > 0 ||
    estadoFilter !== 'todos' ||
    ocupacionFilter !== 'todas';

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const commitEstado = (id: string, estado: VehicleEstado) => {
    const target = vehicles?.find((vehicle) => vehicle.id_carro === id);
    const prev = target?.estado;
    const nombre = target?.nombre ?? 'Vehículo';
    if (!prev || prev === estado) return;

    queryClient.setQueryData<Vehicle[]>(['vehicles', 'admin'], (current) =>
      current?.map((vehicle) =>
        vehicle.id_carro === id ? { ...vehicle, estado } : vehicle,
      ),
    );

    estadoMutation.mutate(
      { id, estado },
      {
        onError: (error) => {
          queryClient.setQueryData<Vehicle[]>(['vehicles', 'admin'], (current) =>
            current?.map((vehicle) =>
              vehicle.id_carro === id ? { ...vehicle, estado: prev } : vehicle,
            ),
          );
          toast.error(
            vehicleErrorMensaje(
              error,
              'No se pudo actualizar el estado del vehículo.',
            ),
          );
          if (confirmTarget?.id === id) {
            setEstadoError(error);
          }
        },
        onSuccess: () => {
          setConfirmTarget(null);
          toast.success(
            estado === 'activo'
              ? `${nombre} está nuevamente activo.`
              : estado === 'mantenimiento'
                ? `${nombre} marcado en mantenimiento.`
                : `${nombre} marcado como inactivo.`,
          );
        },
      },
    );
  };

  const handleChangeEstado = (id: string, nombre: string, estado: VehicleEstado) => {
    const current = vehicles?.find((vehicle) => vehicle.id_carro === id)?.estado;
    if (!current || current === estado) return;

    setEstadoError(null);
    if (estado === 'activo') {
      commitEstado(id, estado);
    } else {
      setConfirmTarget({ id, nombre, nextEstado: estado });
    }
  };

  const handleConfirmEstado = () => {
    if (!confirmTarget) return;
    commitEstado(confirmTarget.id, confirmTarget.nextEstado);
  };

  const handleCloseConfirm = (open: boolean) => {
    if (!open && !estadoMutation.isPending) {
      setConfirmTarget(null);
      setEstadoError(null);
    }
  };

  const handleNew = () => navigate('/admin/vehiculos/nuevo');

  const handleEdit = (vehicle: Vehicle) =>
    navigate(`/admin/vehiculos/${encodeURIComponent(vehicle.id_carro)}/editar`);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="my-0 text-3xl font-semibold tracking-tight">
          Flota de vehículos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administra los vehículos: regístralos, edítalos y consulta su
          ocupación en tiempo real.
        </p>
      </div>

      <FleetToolbar
        searchQuery={query}
        onSearchChange={setQuery}
        estadoFilter={estadoFilter}
        onEstadoFilterChange={setEstadoFilter}
        ocupacionFilter={ocupacionFilter}
        onOcupacionFilterChange={setOcupacionFilter}
        shownCount={filtered.length}
        totalCount={vehicles?.length ?? 0}
        filterActive={filterActive}
        onNew={handleNew}
      />

      <div ref={tablaRef} className="scroll-mt-4 space-y-4">
        <FleetTable
          vehicles={paginacion.pageItems}
          isLoading={vehiclesQuery.isLoading}
          error={vehiclesQuery.error}
          onRetry={() => void vehiclesQuery.refetch()}
          selectedId={selectedId}
          onSelect={handleSelect}
          onChangeEstado={handleChangeEstado}
          actionsDisabled={estadoMutation.isPending}
          onNew={handleNew}
          ocupaciones={ocupaciones}
          isEmptyByFilter={filterActive}
        />
        <PaginationBar
          page={paginacion.page}
          totalPages={paginacion.totalPages}
          rangeStart={paginacion.rangeStart}
          rangeEnd={paginacion.rangeEnd}
          total={paginacion.total}
          itemLabel={paginacion.total === 1 ? 'vehículo' : 'vehículos'}
          onPageChange={paginacion.goTo}
        />
      </div>

      <VehicleDetailDrawer
        vehicle={selectedVehicle}
        ocupacion={
          selectedVehicle
            ? ocupaciones.get(selectedVehicle.id_carro)
            : undefined
        }
        onClose={() => setSelectedId(null)}
        onEdit={handleEdit}
      />

      <ConfirmEstadoChangeDialog
        target={confirmTarget}
        isPending={estadoMutation.isPending}
        error={estadoError}
        onConfirm={handleConfirmEstado}
        onOpenChange={handleCloseConfirm}
      />
    </div>
  );
}

export default AdminVehiclesPage;