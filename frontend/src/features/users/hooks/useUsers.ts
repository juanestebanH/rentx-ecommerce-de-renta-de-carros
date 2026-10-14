import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createUsuario,
  getUsers,
  updateUsuario,
  updateUsuarioEstado,
} from '../api/users.api';
import type {
  ActualizarUsuarioInput,
  CrearUsuarioInput,
  UsuarioEstado,
} from '../types/users.types';

const USERS_QUERY_KEY = ['users'] as const;

export function useUsers(estado?: UsuarioEstado) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, estado ?? 'todos'],
    queryFn: () => getUsers(estado),
    placeholderData: keepPreviousData,
  });
}

export function useCreateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CrearUsuarioInput) => createUsuario(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}

interface UpdateUsuarioVariables {
  id: string;
  input: ActualizarUsuarioInput;
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateUsuarioVariables) =>
      updateUsuario(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}

interface UpdateEstadoVariables {
  id: string;
  estado: UsuarioEstado;
}

export function useUpdateUsuarioEstado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estado }: UpdateEstadoVariables) =>
      updateUsuarioEstado(id, estado),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}
