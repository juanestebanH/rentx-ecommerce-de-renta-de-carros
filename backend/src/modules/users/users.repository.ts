import { supabase } from '../../config/supabase.js';
import type {
  AdminUserFilter,
  AdminUserView,
  CreateAdminInput,
  UpdateAdminInput,
  UsuarioEstado,
} from './users.types.js';

const USER_PUBLIC_COLUMNS = 'id_usuario, nombre, email, rol, estado';

class UsersRepository {
  async list(filters: AdminUserFilter): Promise<AdminUserView[]> {
    let query = supabase.from('usuarios').select(USER_PUBLIC_COLUMNS);

    if (filters.estado) query = query.eq('estado', filters.estado);

    query = query.order('nombre', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as AdminUserView[];
  }

  async findById(id: string): Promise<AdminUserView | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select(USER_PUBLIC_COLUMNS)
      .eq('id_usuario', id)
      .single();

    if (error || !data) return null;
    return data as AdminUserView;
  }

  async countActive(): Promise<number> {
    const { count, error } = await supabase
      .from('usuarios')
      .select('id_usuario', { count: 'exact', head: true })
      .eq('estado', 'activo');

    if (error) throw error;
    return count ?? 0;
  }

  async emailExists(email: string, excludeUserId?: string): Promise<boolean> {
    let query = supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('email', email);

    if (excludeUserId) query = query.neq('id_usuario', excludeUserId);

    const { data } = await query.maybeSingle();
    return data !== null;
  }

  async create(payload: CreateAdminInput & { rol: string; contrasena: string }): Promise<AdminUserView> {
    const { data, error } = await supabase
      .from('usuarios')
      .insert(payload)
      .select(USER_PUBLIC_COLUMNS)
      .single();

    if (error || !data) throw error ?? new Error('Failed to create user');
    return data as AdminUserView;
  }

  async update(id: string, data: { nombre?: string; email?: string; contrasena?: string }): Promise<AdminUserView | null> {
    const { data: result, error } = await supabase
      .from('usuarios')
      .update(data)
      .eq('id_usuario', id)
      .select(USER_PUBLIC_COLUMNS)
      .single();

    if (error || !result) return null;
    return result as AdminUserView;
  }

  async updateEstado(id: string, estado: UsuarioEstado): Promise<AdminUserView | null> {
    const { data: result, error } = await supabase
      .from('usuarios')
      .update({ estado })
      .eq('id_usuario', id)
      .select(USER_PUBLIC_COLUMNS)
      .single();

    if (error || !result) return null;
    return result as AdminUserView;
  }
}

export const usersRepository = new UsersRepository();