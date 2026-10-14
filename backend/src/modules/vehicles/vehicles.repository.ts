import { supabase } from '../../config/supabase.js';
import { VEHICLE_ESTADO_INACTIVO } from './vehicles.types.js';
import type {
  Vehicle,
  VehicleFilter,
  CreateVehicleInput,
  HardDeleteOutcome,
  UploadPhotoInput,
  UpdateVehicleInput,
} from './vehicles.types.js';

class VehiclesRepository {
  /**
   * Sin `incluirMantenimiento` el listado es público y se filtra estrictamente
   * a `estado = 'activo'`, por lo que 'mantenimiento' e 'inactivo' quedan
   * excluidos sin filtros extra. Con `incluirMantenimiento` (sólo admin) se
   * quita el filtro y se devuelven todos los estados.
   */
  async list(filters: VehicleFilter): Promise<Vehicle[]> {
    let query = supabase.from('carros').select('*');

    if (filters.incluirMantenimiento !== true) query = query.eq('estado', 'activo');
    if (filters.id_categoria) query = query.eq('id_categoria', filters.id_categoria);
    if (filters.id_marca) query = query.eq('id_marca', filters.id_marca);
    if (filters.transmision) query = query.eq('transmision', filters.transmision);
    if (filters.combustible) query = query.eq('combustible', filters.combustible);
    if (filters.tarifa_min !== undefined) query = query.gte('tarifa', filters.tarifa_min);
    if (filters.tarifa_max !== undefined) query = query.lte('tarifa', filters.tarifa_max);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Vehicle[];
  }

  async findById(id: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('carros')
      .select('*')
      .eq('id_carro', id)
      .single();

    if (error || !data) return null;
    return data as Vehicle;
  }

  async findByIds(ids: string[]): Promise<Pick<Vehicle, 'id_carro' | 'nombre'>[]> {
    if (ids.length === 0) return [];

    const { data, error } = await supabase
      .from('carros')
      .select('id_carro, nombre')
      .in('id_carro', ids);

    if (error) throw error;
    return (data ?? []) as Pick<Vehicle, 'id_carro' | 'nombre'>[];
  }

  async findTarifaAndEstado(id: string): Promise<{ tarifa: number; estado: string } | null> {
    const { data, error } = await supabase
      .from('carros')
      .select('tarifa, estado')
      .eq('id_carro', id)
      .single();

    if (error || !data) return null;
    return { tarifa: data.tarifa as number, estado: data.estado as string };
  }

  async create(data: CreateVehicleInput): Promise<Vehicle> {
    const { data: result, error } = await supabase
      .from('carros')
      .insert(data)
      .select()
      .single();

    if (error || !result) throw error ?? new Error('Failed to create vehicle');
    return result as Vehicle;
  }

  async update(id: string, data: UpdateVehicleInput): Promise<Vehicle | null> {
    const { data: result, error } = await supabase
      .from('carros')
      .update(data)
      .eq('id_carro', id)
      .select()
      .single();

    if (error || !result) return null;
    return result as Vehicle;
  }

  /** Retira el vehículo de la flota sin borrar la fila (soft delete). */
  async deactivate(id: string): Promise<Vehicle | null> {
    return this.update(id, { estado: VEHICLE_ESTADO_INACTIVO });
  }

  async countRentas(id: string): Promise<number> {
    const { count, error } = await supabase
      .from('rentas')
      .select('id_renta', { count: 'exact', head: true })
      .eq('id_carro', id);

    if (error) throw error;
    return count ?? 0;
  }

  /**
   * Borrado FÍSICO real, para casos excepcionales (limpieza de datos de
   * prueba). Sólo procede si el vehículo NUNCA tuvo una renta asociada, ni
   * activa ni pasada: si tuvo historial devuelve `'has_history'` y conserva la
   * fila; para esos casos el borrado correcto es `deactivate()`.
   *
   * No está expuesto en ninguna ruta HTTP: sólo para scripts/SQL directo.
   */
  async hardDelete(id: string): Promise<HardDeleteOutcome> {
    const existing = await this.findById(id);
    if (!existing) return 'not_found';

    if ((await this.countRentas(id)) > 0) return 'has_history';

    const { error } = await supabase.from('carros').delete().eq('id_carro', id);
    if (error) throw error;

    if (existing.foto) {
      await this.deletePhoto(existing.foto);
    }

    return 'deleted';
  }

  async uploadPhoto(file: UploadPhotoInput, name: string): Promise<string> {
    const { error } = await supabase.storage.from('carros').upload(name, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

    if (error) throw error;

    const { data } = supabase.storage.from('carros').getPublicUrl(name);
    return data.publicUrl;
  }

  async deletePhoto(url: string): Promise<void> {
    const filename = url.split('/').pop();
    if (!filename) return;

    const { error } = await supabase.storage.from('carros').remove([filename]);
    if (error) throw error;
  }

  async countVehiclesByMarca(id_marca: string): Promise<number> {
    const { data, error } = await supabase
      .from('carros')
      .select('id_carro')
      .eq('id_marca', id_marca);

    if (error) throw error;
    return (data ?? []).length;
  }

  async countVehiclesByCategoria(id_categoria: string): Promise<number> {
    const { data, error } = await supabase
      .from('carros')
      .select('id_carro')
      .eq('id_categoria', id_categoria);

    if (error) throw error;
    return (data ?? []).length;
  }
}

export const vehiclesRepository = new VehiclesRepository();