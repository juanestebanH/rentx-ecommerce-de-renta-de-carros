import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type {
  ActualizarUsuarioInput,
  CrearUsuarioInput,
  Usuario,
  UsuarioEstado,
} from '@/features/users/types/users.types';
import {
  useCreateUsuario,
  useUpdateUsuario,
  useUpdateUsuarioEstado,
  useUsers,
} from '@/features/users/hooks/useUsers';
import {
  UsersToolbar,
  type EstadoFilter,
} from '@/features/users/components/UsersToolbar';
import { UsersTable } from '@/features/users/components/UsersTable';
import { UserFormDrawer } from '@/features/users/components/UserFormDrawer';
import { ConfirmarDesactivacionUsuarioDialog } from '@/features/users/components/ConfirmarDesactivacionUsuarioDialog';
import { usuarioErrorMensaje } from '@/features/users/utils/users.format';

type FormTarget = { modo: 'crear' } | { modo: 'editar'; usuario: Usuario };

function AdminUsersPage() {
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('todos');
  const [query, setQuery] = useState('');
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [confirmUsuario, setConfirmUsuario] = useState<Usuario | null>(null);

  const usuarioActualId = useAuthStore((state) => state.user?.id ?? null);

  const usersQuery = useUsers();
  const createMutation = useCreateUsuario();
  const updateMutation = useUpdateUsuario();
  const estadoMutation = useUpdateUsuarioEstado();

  const usuarios = usersQuery.data;

  const activeCount = useMemo(
    () => (usuarios ?? []).filter((usuario) => usuario.estado === 'activo').length,
    [usuarios],
  );

  const filtered = useMemo(() => {
    if (!usuarios) return [];
    const q = query.trim().toLowerCase();
    return usuarios.filter((usuario) => {
      if (estadoFilter !== 'todos' && usuario.estado !== estadoFilter) {
        return false;
      }
      if (!q) return true;
      return (
        usuario.nombre.toLowerCase().includes(q) ||
        usuario.email.toLowerCase().includes(q) ||
        usuario.id_usuario.toLowerCase().includes(q)
      );
    });
  }, [usuarios, query, estadoFilter]);

  const pendingEstadoId = estadoMutation.isPending
    ? (estadoMutation.variables?.id ?? null)
    : null;

  const filterActive = query.trim().length > 0 || estadoFilter !== 'todos';

  const abrirCrear = () => {
    createMutation.reset();
    updateMutation.reset();
    setFormKey((prev) => prev + 1);
    setFormTarget({ modo: 'crear' });
  };

  const abrirEditar = (usuario: Usuario) => {
    createMutation.reset();
    updateMutation.reset();
    setFormKey((prev) => prev + 1);
    setFormTarget({ modo: 'editar', usuario });
  };

  const cerrarForm = () => {
    if (createMutation.isPending || updateMutation.isPending) return;
    setFormTarget(null);
  };

  const enviarCrear = (input: CrearUsuarioInput) => {
    createMutation.mutate(input, {
      onSuccess: (usuario) => {
        toast.success(`Usuario ${usuario.id_usuario} creado.`);
        setFormTarget(null);
      },
      onError: (error) => {
        toast.error(
          usuarioErrorMensaje(error, 'No se pudo crear el usuario.'),
        );
      },
    });
  };

  const enviarEditar = (id: string, input: ActualizarUsuarioInput) => {
    updateMutation.mutate(
      { id, input },
      {
        onSuccess: () => {
          toast.success('Usuario actualizado.');
          setFormTarget(null);
        },
        onError: (error) => {
          toast.error(
            usuarioErrorMensaje(error, 'No se pudo actualizar el usuario.'),
          );
        },
      },
    );
  };

  const aplicarEstado = (usuario: Usuario, estado: UsuarioEstado) => {
    estadoMutation.mutate(
      { id: usuario.id_usuario, estado },
      {
        onSuccess: () => {
          toast.success(
            estado === 'activo'
              ? `${usuario.nombre} reactivado.`
              : `${usuario.nombre} dado de baja.`,
          );
          setConfirmUsuario(null);
        },
        onError: (error) => {
          toast.error(
            usuarioErrorMensaje(
              error,
              'No se pudo actualizar el estado del usuario.',
            ),
          );
          setConfirmUsuario(null);
        },
      },
    );
  };

  const confirmarBaja = () => {
    if (confirmUsuario) aplicarEstado(confirmUsuario, 'inactivo');
  };

  const cancelarBaja = () => {
    if (estadoMutation.isPending) return;
    setConfirmUsuario(null);
  };

  const formModo = formTarget?.modo ?? 'crear';
  const formUsuario = formTarget?.modo === 'editar' ? formTarget.usuario : null;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="my-0 text-3xl font-semibold tracking-tight">Usuarios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona quién puede entrar al panel: crea credenciales, edítalas o
          retira el acceso.
        </p>
      </div>

      <UsersToolbar
        searchQuery={query}
        onSearchChange={setQuery}
        estadoFilter={estadoFilter}
        onEstadoFilterChange={setEstadoFilter}
        totalCount={usuarios?.length ?? 0}
        shownCount={filtered.length}
        filterActive={filterActive}
        onNew={abrirCrear}
      />

      <UsersTable
        usuarios={filtered}
        isLoading={usersQuery.isLoading}
        error={usersQuery.error}
        onRetry={() => void usersQuery.refetch()}
        searchQuery={query}
        estadoFilter={estadoFilter}
        usuarioActualId={usuarioActualId}
        activeCount={activeCount}
        pendingEstadoId={pendingEstadoId}
        onNew={abrirCrear}
        onEdit={abrirEditar}
        onDeactivate={setConfirmUsuario}
        onActivate={(usuario) => aplicarEstado(usuario, 'activo')}
      />

      <UserFormDrawer
        key={formKey}
        open={formTarget !== null}
        modo={formModo}
        usuario={formUsuario}
        isPending={createMutation.isPending || updateMutation.isPending}
        error={createMutation.error ?? updateMutation.error ?? null}
        onClose={cerrarForm}
        onSubmitCreate={enviarCrear}
        onSubmitUpdate={enviarEditar}
      />

      <ConfirmarDesactivacionUsuarioDialog
        usuario={confirmUsuario}
        isPending={estadoMutation.isPending}
        error={estadoMutation.error}
        onConfirm={confirmarBaja}
        onCancel={cancelarBaja}
      />
    </div>
  );
}

export default AdminUsersPage;
