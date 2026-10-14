import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { Client, ClienteEstado } from '@/features/clients/types/clients.types';
import {
  useClientRentalHistory,
  useClients,
  useUpdateClienteEstado,
} from '@/features/clients/hooks/useClients';
import { ClientsTable } from '@/features/clients/components/ClientsTable';
import { ClientsHistoryDrawer } from '@/features/clients/components/ClientsHistoryDrawer';
import {
  ConfirmarDesactivacionDialog,
} from '@/features/clients/components/ConfirmarDesactivacionDialog';
import {
  ClientsToolbar,
  type EstadoFilter,
} from '@/features/clients/components/ClientsToolbar';
import { clienteErrorMensaje } from '@/features/clients/utils/clients.format';
import { PaginationBar } from '@/shared/components/PaginationBar';
import { usePagination } from '@/shared/hooks/usePagination';

function AdminClientsPage() {
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('todos');
  const [query, setQuery] = useState('');
  const [historyClientId, setHistoryClientId] = useState<string | null>(null);
  const [confirmClient, setConfirmClient] = useState<Client | null>(null);

  const clientsQuery = useClients(
    estadoFilter === 'todos' ? undefined : estadoFilter,
  );
  const estadoMutation = useUpdateClienteEstado();

  const clients = clientsQuery.data;

  const filtered = useMemo(() => {
    if (!clients) return [];
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (client) =>
        `${client.nombres} ${client.apellidos}`.toLowerCase().includes(q) ||
        client.email.toLowerCase().includes(q) ||
        client.numero_licencia.toLowerCase().includes(q),
    );
  }, [clients, query]);

  const tablaRef = useRef<HTMLDivElement>(null);
  const paginacion = usePagination(filtered, {
    pageSize: 10,
    resetKey: `${query}|${estadoFilter}`,
    scrollTargetRef: tablaRef,
  });

  // El drawer se deriva del roster visible: si el cliente sale de la lista
  // (búsqueda, filtro o refetch) se cierra sin estado extra.
  const historyClient =
    historyClientId !== null
      ? (filtered.find((client) => client.id_cliente === historyClientId) ??
        null)
      : null;

  const historial = useClientRentalHistory(historyClient?.id_cliente ?? '');

  const pendingEstadoId = estadoMutation.isPending
    ? estadoMutation.variables?.id
    : null;

  const closeHistory = useCallback(() => {
    setHistoryClientId(null);
  }, []);

  const applyEstado = useCallback(
    (client: Client, estado: ClienteEstado) => {
      const nombre = `${client.nombres} ${client.apellidos}`;
      estadoMutation.mutate(
        { id: client.id_cliente, estado },
        {
          onSuccess: () => {
            toast.success(
              `${nombre} ${estado === 'activo' ? 'activado' : 'desactivado'}.`,
            );
            setConfirmClient(null);
          },
          onError: (error) => {
            toast.error(
              clienteErrorMensaje(
                error,
                'No se pudo actualizar el estado del cliente.',
              ),
            );
            setConfirmClient(null);
          },
        },
      );
    },
    [estadoMutation],
  );

  const toggleEstado = (client: Client) => {
    if (client.estado === 'activo') {
      setConfirmClient(client);
    } else {
      applyEstado(client, 'activo');
    }
  };

  const handleConfirmDeactivate = () => {
    if (!confirmClient) return;
    applyEstado(confirmClient, 'inactivo');
  };

  const cancelDeactivate = () => {
    if (estadoMutation.isPending) return;
    setConfirmClient(null);
  };

  const filterActive = query.trim().length > 0 || estadoFilter !== 'todos';

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="my-0 text-3xl font-semibold tracking-tight">Clientes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Busca clientes registrados, revisa su licencia y cambia su estado.
        </p>
      </div>

      <ClientsToolbar
        searchQuery={query}
        onSearchChange={setQuery}
        estadoFilter={estadoFilter}
        onEstadoFilterChange={setEstadoFilter}
        totalCount={clients?.length ?? 0}
        shownCount={filtered.length}
        filterActive={filterActive}
      />

      <div ref={tablaRef} className="scroll-mt-4 space-y-4">
        <ClientsTable
          clients={paginacion.pageItems}
          isLoading={clientsQuery.isLoading}
          error={clientsQuery.error}
          onRetry={() => void clientsQuery.refetch()}
          estadoFilter={estadoFilter}
          searchQuery={query}
          pendingEstadoId={pendingEstadoId}
          onToggleEstado={toggleEstado}
          onViewHistory={setHistoryClientId}
        />
        <PaginationBar
          page={paginacion.page}
          totalPages={paginacion.totalPages}
          rangeStart={paginacion.rangeStart}
          rangeEnd={paginacion.rangeEnd}
          total={paginacion.total}
          itemLabel={paginacion.total === 1 ? 'cliente' : 'clientes'}
          onPageChange={paginacion.goTo}
        />
      </div>

      <ClientsHistoryDrawer
        client={historyClient}
        historial={{
          data: historial.data,
          isLoading: historial.isLoading,
          error: historial.error,
          onRetry: () => void historial.refetch(),
        }}
        onClose={closeHistory}
      />

      <ConfirmarDesactivacionDialog
        client={confirmClient}
        isPending={estadoMutation.isPending}
        onConfirm={handleConfirmDeactivate}
        onCancel={cancelDeactivate}
      />
    </div>
  );
}

export default AdminClientsPage;