import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { mensajeError } from '@/shared/utils/format';
import { ErrorState } from '@/features/reports/components/ErrorState';
import type { Client, ClienteEstado } from '../types/clients.types';
import { ClienteTarjetaMovil } from './ClienteTarjetaMovil';
import { ClientsTableRow } from './ClientsTableRow';

interface ClientsTableProps {
  clients: Client[];
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  estadoFilter: 'todos' | ClienteEstado;
  searchQuery: string;
  pendingEstadoId: string | null;
  onToggleEstado: (client: Client) => void;
  onViewHistory: (id: string) => void;
}

export function ClientsTable({
  clients,
  isLoading,
  error,
  onRetry,
  estadoFilter,
  searchQuery,
  pendingEstadoId,
  onToggleEstado,
  onViewHistory,
}: ClientsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes registrados</CardTitle>
        <CardDescription>
          Busca, revisa licencias, consulta el historial de rentas y administra
          el estado de cada cliente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ClientsSkeleton />
        ) : error || !clients ? (
          <ErrorState
            message={mensajeError(error, 'No se pudieron cargar los clientes.')}
            onRetry={onRetry}
          />
        ) : clients.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center text-center">
            <div>
              <p className="text-sm font-medium">
                {searchQuery.trim()
                  ? 'Sin resultados'
                  : estadoFilter !== 'todos'
                    ? `No hay clientes ${estadoFilter === 'inactivo' ? 'inactivos' : 'activos'}`
                    : 'Aún no hay clientes registrados'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery.trim()
                  ? `Ningún cliente coincide con “${searchQuery.trim()}”.`
                  : estadoFilter !== 'todos'
                    ? 'Prueba con otro filtro de estado.'
                    : 'Cuando un cliente se registre, aparecerá aquí.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="relative hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <caption className="sr-only">
                  Clientes con nombre, licencia, estado y acciones de
                  activar/desactivar y ver historial de rentas
                </caption>
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th scope="col" className="pb-2 pr-4 font-medium">
                      Cliente
                    </th>
                    <th scope="col" className="pb-2 pr-4 font-medium">
                      Licencia
                    </th>
                    <th scope="col" className="pb-2 pr-4 font-medium">
                      Estado
                    </th>
                    <th scope="col" className="pb-2 text-right font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <ClientsTableRow
                      key={client.id_cliente}
                      client={client}
                      estadoPending={pendingEstadoId === client.id_cliente}
                      onToggleEstado={() => onToggleEstado(client)}
                      onViewHistory={() => onViewHistory(client.id_cliente)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 md:hidden">
              {clients.map((client) => (
                <ClienteTarjetaMovil
                  key={client.id_cliente}
                  client={client}
                  estadoPending={pendingEstadoId === client.id_cliente}
                  onToggleEstado={() => onToggleEstado(client)}
                  onViewHistory={() => onViewHistory(client.id_cliente)}
                />
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ClientsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}