import { supabase } from '../../config/supabase.js';
import type { Categoria, Marca } from './catalog.types.js';

class CatalogRepository {
  async listMarcas(): Promise<Marca[]> {
    const { data, error } = await supabase
      .from('marcas')
      .select('nombre')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return (data ?? []) as Marca[];
  }

  async marcaExists(nombre: string): Promise<boolean> {
    const { data } = await supabase.from('marcas').select('nombre').eq('nombre', nombre).maybeSingle();
    return data !== null;
  }

  async createMarca(nombre: string): Promise<Marca> {
    const { data, error } = await supabase.from('marcas').insert({ nombre }).select().single();
    if (error || !data) throw error ?? new Error('Failed to create marca');
    return data as Marca;
  }

  async updateMarca(nombreActual: string, nuevoNombre: string): Promise<Marca> {
    const { data, error } = await supabase
      .from('marcas')
      .update({ nombre: nuevoNombre })
      .eq('nombre', nombreActual)
      .select()
      .single();

    if (error || !data) throw error ?? new Error('Failed to update marca');
    return data as Marca;
  }

  async deleteMarca(nombre: string): Promise<void> {
    const { error } = await supabase.from('marcas').delete().eq('nombre', nombre);
    if (error) throw error;
  }

  async listCategorias(): Promise<Categoria[]> {
    const { data, error } = await supabase
      .from('categorias')
      .select('nombre')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return (data ?? []) as Categoria[];
  }

  async categoriaExists(nombre: string): Promise<boolean> {
    const { data } = await supabase
      .from('categorias')
      .select('nombre')
      .eq('nombre', nombre)
      .maybeSingle();
    return data !== null;
  }

  async createCategoria(nombre: string): Promise<Categoria> {
    const { data, error } = await supabase
      .from('categorias')
      .insert({ nombre })
      .select()
      .single();
    if (error || !data) throw error ?? new Error('Failed to create categoria');
    return data as Categoria;
  }

  async updateCategoria(nombreActual: string, nuevoNombre: string): Promise<Categoria> {
    const { data, error } = await supabase
      .from('categorias')
      .update({ nombre: nuevoNombre })
      .eq('nombre', nombreActual)
      .select()
      .single();

    if (error || !data) throw error ?? new Error('Failed to update categoria');
    return data as Categoria;
  }

  async deleteCategoria(nombre: string): Promise<void> {
    const { error } = await supabase.from('categorias').delete().eq('nombre', nombre);
    if (error) throw error;
  }
}

export const catalogRepository = new CatalogRepository();