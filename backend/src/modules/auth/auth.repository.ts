import { supabase } from '../../config/supabase.js';
import type { AdminUser, ClientUser } from './auth.types.js';

export interface RefreshTokenRow {
  token: string;
  user_id: string;
  user_type: 'admin' | 'client';
  expires_at: string;
}

class AuthRepository {
  async findAdminById(id: string): Promise<AdminUser | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id_usuario', id)
      .single();

    if (error || !data) return null;
    return data as AdminUser;
  }

  async findClientByEmail(email: string): Promise<ClientUser | null> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return data as ClientUser;
  }

  async findClientById(id: string): Promise<ClientUser | null> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id_cliente', id)
      .single();

    if (error || !data) return null;
    return data as ClientUser;
  }

  async emailExists(email: string): Promise<boolean> {
    const { data } = await supabase
      .from('clientes')
      .select('id_cliente')
      .eq('email', email)
      .maybeSingle();

    return data !== null;
  }

  async insertClient(payload: {
    id_cliente: string;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    fecha_nacimiento: string;
    numero_licencia: string;
    pais_emision: string;
    fecha_vencimiento: string;
    contrasena: string;
  }): Promise<ClientUser> {
    const { data, error } = await supabase
      .from('clientes')
      .insert(payload)
      .select()
      .single();

    if (error || !data) throw error ?? new Error('Failed to insert client');
    return data as ClientUser;
  }

  async storeRefreshToken(
    userId: string,
    token: string,
    userType: 'admin' | 'client',
    expiresAt: string,
  ): Promise<void> {
    await supabase.from('refresh_tokens').insert({
      token,
      user_id: userId,
      user_type: userType,
      expires_at: expiresAt,
    });
  }

  async findRefreshToken(
    token: string,
    userId: string,
    userType: 'admin' | 'client',
  ): Promise<RefreshTokenRow | null> {
    const { data, error } = await supabase
      .from('refresh_tokens')
      .select('*')
      .eq('token', token)
      .eq('user_id', userId)
      .eq('user_type', userType)
      .single();

    if (error || !data) return null;
    return data as RefreshTokenRow;
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await supabase.from('refresh_tokens').delete().eq('token', token);
  }

  async deleteRefreshTokenByUser(
    token: string,
    userId: string,
    userType: 'admin' | 'client',
  ): Promise<void> {
    await supabase
      .from('refresh_tokens')
      .delete()
      .eq('token', token)
      .eq('user_id', userId)
      .eq('user_type', userType);
  }
}

export const authRepository = new AuthRepository();
