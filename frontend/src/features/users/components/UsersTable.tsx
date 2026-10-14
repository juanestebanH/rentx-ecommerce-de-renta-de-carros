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
import type { Usuario, UsuarioEstado } from '../types/users.types';
import { UsuarioTarjetaMovil } from './UsuarioTarjetaMovil';
import { UsersTableRow } from './UsersTableRow';

interface UsersTableProps {
  usuarios: Usuario[];
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  searchQuery: string;
  estadoFilter: 'todos' | UsuarioEstado;
  usuarioActualId: string | null;
  activeCount: number;
  pendingEstadoId: string | null;
  onNew: () => void;
  onEdit: (usuario: Usuario) => void;
  onDeactivate: (usuario: Usuario) => void;
  onActivate: (usuario: Usuario) => void;
}

interface Guarda {
  puede: boolean;
  motivo: string;
}

function evaluarGuarda(
  usuario: Usuario,
  usuarioActualId: string | null,
  activeCount: number,
): Guarda {
  if (usuario.id_usuario === usuarioActualId) {
    return {
      puede: false,
      motivo: 'No puedes desactivar tu propia cuenta.',
    };
  }
  if (usuario.estado === 'activo' && activeCount <= 1) {
    return {
      puede: false,
      motivo: 'Es el único administrador activo; el panel quedaría sin acceso.',
    };
  }
  return { puede: true, motivo: '' };
}

export function UsersTable({
  usuarios,
  isLoading,
  error,
  onRetry,
  searchQuery,
  estadoFilter,
  usuarioActualId,
  activeCount,
  pendingEstadoId,
  onNew,
  onEdit,
  onDeactivate,
  onActivate,
}: UsersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios del sistema</CardTitle>
        <CardDescription>
          Cuentas con acceso al panel. El login es por id de usuario, y dar de
          baja corta el acceso.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <UsersSkeleton />
        ) : error ? (
          <ErrorState
            message={mensajeError(error, 'No se pudieron cargar los usuarios.')}
            onRetry={onRetry}
          />
        ) : usuarios.length === 0 ? (
          <EmptyState
            searchQuery={searchQuery}
            estadoFilter={estadoFilter}
            onNew={onNew}
          />
        ) : (
          <>
            <div className="relative hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <caption className="sr-only">
                  Usuarios con identidad de acceso, estado y acciones de editar,
                  dar de baja o reactivar
                </caption>
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th scope="col" className="pb-2 pr-4 font-medium">
                      Usuario
                    </th>
                    <th scope="col" className="pb-2 pr-4 font-medium">
                      Id de usuario
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
                  {usuarios.map((usuario) => {
                    const guarda = evaluarGuarda(
                      usuario,
                      usuarioActualId,
                      activeCount,
                    );
                    return (
                      <UsersTableRow
                        key={usuario.id_usuario}
                        usuario={usuario}
                        esUsuarioActual={
                          usuario.id_usuario === usuarioActualId
                        }
                        estadoPending={pendingEstadoId === usuario.id_usuario}
                        puedeDesactivar={guarda.puede}
                        motivoDesactivar={guarda.motivo}
                        onEdit={() => onEdit(usuario)}
                        onDeactivate={() => onDeactivate(usuario)}
                        onActivate={() => onActivate(usuario)}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 md:hidden">
              {usuarios.map((usuario) => {
                const guarda = evaluarGuarda(
                  usuario,
                  usuarioActualId,
                  activeCount,
                );
                return (
                  <UsuarioTarjetaMovil
                    key={usuario.id_usuario}
                    usuario={usuario}
                    esUsuarioActual={usuario.id_usuario === usuarioActualId}
                    estadoPending={pendingEstadoId === usuario.id_usuario}
                    puedeDesactivar={guarda.puede}
                    motivoDesactivar={guarda.motivo}
                    onEdit={() => onEdit(usuario)}
                    onDeactivate={() => onDeactivate(usuario)}
                    onActivate={() => onActivate(usuario)}
                  />
                );
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  searchQuery: string;
  estadoFilter: 'todos' | UsuarioEstado;
  onNew: () => void;
}

function EmptyState({ searchQuery, estadoFilter, onNew }: EmptyStateProps) {
  const q = searchQuery.trim();

  if (q) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-center">
        <div>
          <p className="text-sm font-medium">Sin resultados</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ningún usuario coincide con “{q}”.
          </p>
        </div>
      </div>
    );
  }

  if (estadoFilter !== 'todos') {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-center">
        <div>
          <p className="text-sm font-medium">
            No hay usuarios {estadoFilter === 'inactivo' ? 'inactivos' : 'activos'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Prueba con otro filtro de estado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
      <div>
        <p className="text-sm font-medium">Aún no hay usuarios</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Crea la primera credencial de acceso al panel.
        </p>
      </div>
      <button
        type="button"
        onClick={onNew}
        className="text-sm font-medium text-accent-foreground underline underline-offset-4 hover:no-underline"
      >
        Nuevo usuario
      </button>
    </div>
  );
}

function UsersSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          <Skeleton className="size-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}
