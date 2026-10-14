import { supabase } from '../../config/supabase.js';
import { vehiclesRepository } from '../vehicles/vehicles.repository.js';
import { RENTA_ESTADOS_ACTIVOS } from './rentals.types.js';
import type { Renta, RentaEstado, RentaFilter, RentaConVehiculo } from './rentals.types.js';

class RentalsRepository {
  async list(filters: RentaFilter): Promise<Renta[]> {
    let query = supabase.from('rentas').select('*');

    if (filters.estado) query = query.eq('estado', filters.estado);
    if (filters.id_cliente) query = query.eq('id_cliente', filters.id_cliente);
    if (filters.id_carro) query = query.eq('id_carro', filters.id_carro);

    query = query.order('fecha_inicio', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Renta[];
  }

  async listByClient(id_cliente: string): Promise<Renta[]> {
    const { data, error } = await supabase
      .from('rentas')
      .select('*')
      .eq('id_cliente', id_cliente)
      .order('fecha_inicio', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Renta[];
  }

  async listByClientWithVehicle(id_cliente: string): Promise<RentaConVehiculo[]> {
    const rentals = await this.listByClient(id_cliente);

    const carroIds = [...new Set(rentals.map((rental) => rental.id_carro))];
    const vehicles = await vehiclesRepository.findByIds(carroIds);
    const nombreByCarro = new Map(vehicles.map((vehicle) => [vehicle.id_carro, vehicle.nombre]));

    return rentals.map((rental) => ({
      ...rental,
      nombre_carro: nombreByCarro.get(rental.id_carro) ?? 'Desconocido',
    }));
  }

  async findById(id: string): Promise<Renta | null> {
    const { data, error } = await supabase
      .from('rentas')
      .select('*')
      .eq('id_renta', id)
      .single();

    if (error || !data) return null;
    return data as Renta;
  }

  async create(data: Renta): Promise<Renta> {
    const { data: result, error } = await supabase
      .from('rentas')
      .insert(data)
      .select()
      .single();

    if (error || !result) throw error ?? new Error('Failed to create rental');
    return result as Renta;
  }

  async updateEstado(id: string, estado: RentaEstado): Promise<Renta | null> {
    const { data: result, error } = await supabase
      .from('rentas')
      .update({ estado })
      .eq('id_renta', id)
      .select()
      .single();

    if (error || !result) return null;
    return result as Renta;
  }

  async findConflictingRentals(
    id_carro: string,
    fecha_inicio: string,
    fecha_fin: string,
    excludeRentaId?: string
  ): Promise<Renta[]> {
    let query = supabase
      .from('rentas')
      .select('*')
      .eq('id_carro', id_carro)
      .in('estado', RENTA_ESTADOS_ACTIVOS)
      .gte('fecha_fin', fecha_inicio)
      .lte('fecha_inicio', fecha_fin);

    if (excludeRentaId) query = query.neq('id_renta', excludeRentaId);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Renta[];
  }
}

export const rentalsRepository = new RentalsRepository();