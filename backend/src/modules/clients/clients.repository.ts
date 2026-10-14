import { supabase } from '../../config/supabase.js';
import type { ClientFilter, ClienteEstado, ClientPublic } from './clients.types.js';

const CLIENT_PUBLIC_COLUMNS =
  'id_cliente, nombres, apellidos, email, telefono, fecha_nacimiento, numero_licencia, pais_emision, fecha_vencimiento, estado';

class ClientsRepository {
  async list(filters: ClientFilter): Promise<ClientPublic[]> {
    let query = supabase.from('clientes').select(CLIENT_PUBLIC_COLUMNS);

    if (filters.estado) query = query.eq('estado', filters.estado);

    query = query.order('nombres', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as ClientPublic[];
  }

  async findById(id: string): Promise<ClientPublic | null> {
    const { data, error } = await supabase
      .from('clientes')
      .select(CLIENT_PUBLIC_COLUMNS)
      .eq('id_cliente', id)
      .single();

    if (error || !data) return null;
    return data as ClientPublic;
  }

  async updateEstado(id: string, estado: ClienteEstado): Promise<ClientPublic | null> {
    const { data: result, error } = await supabase
      .from('clientes')
      .update({ estado })
      .eq('id_cliente', id)
      .select(CLIENT_PUBLIC_COLUMNS)
      .single();

    if (error || !result) return null;
    return result as ClientPublic;
  }
}

export const clientsRepository = new ClientsRepository();