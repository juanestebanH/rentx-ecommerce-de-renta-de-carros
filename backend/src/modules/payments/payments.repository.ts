import { supabase } from '../../config/supabase.js';
import type { Pago, PagoEstado } from './payments.types.js';

class PaymentsRepository {
  async listByRenta(id_renta: string): Promise<Pago[]> {
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .eq('id_renta', id_renta)
      .order('fecha_pago', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Pago[];
  }

  async findById(id: string): Promise<Pago | null> {
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .eq('id_pago', id)
      .single();

    if (error || !data) return null;
    return data as Pago;
  }

  async create(data: Pago): Promise<Pago> {
    const { data: result, error } = await supabase
      .from('pagos')
      .insert(data)
      .select()
      .single();

    if (error || !result) throw error ?? new Error('Failed to create payment');
    return result as Pago;
  }

  async updateEstado(id: string, estado: PagoEstado): Promise<Pago | null> {
    const { data: result, error } = await supabase
      .from('pagos')
      .update({ estado })
      .eq('id_pago', id)
      .select()
      .single();

    if (error || !result) return null;
    return result as Pago;
  }

  async sumByRentaAndEstado(id_renta: string, estados: PagoEstado[]): Promise<number> {
    const { data, error } = await supabase
      .from('pagos')
      .select('total_pago')
      .eq('id_renta', id_renta)
      .in('estado', estados);

    if (error) throw error;
    return (data ?? []).reduce((acc, row) => acc + (row.total_pago as number), 0);
  }
}

export const paymentsRepository = new PaymentsRepository();