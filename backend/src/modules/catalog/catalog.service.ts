import { AppError } from '../../shared/utils/AppError.js';
import { normalizeIdentifier } from '../../shared/utils/normalize.js';
import { vehiclesRepository } from '../vehicles/vehicles.repository.js';
import { catalogRepository } from './catalog.repository.js';
import type { Categoria, Marca } from './catalog.types.js';

export class CatalogService {
  async listMarcas(): Promise<Marca[]> {
    return catalogRepository.listMarcas();
  }

  async createMarca(nombre: string): Promise<Marca> {
    const nombreNormalizado = normalizeIdentifier(nombre);
    if (await catalogRepository.marcaExists(nombreNormalizado)) {
      throw new AppError('Ya existe una marca con ese nombre', 400);
    }
    return catalogRepository.createMarca(nombreNormalizado);
  }

  async updateMarca(nombreActual: string, nuevoNombre: string): Promise<Marca> {
    const actual = normalizeIdentifier(nombreActual);
    const nuevo = normalizeIdentifier(nuevoNombre);

    if (!(await catalogRepository.marcaExists(actual))) {
      throw new AppError('Marca no encontrada', 404);
    }

    if (actual !== nuevo && (await catalogRepository.marcaExists(nuevo))) {
      throw new AppError('Ya existe una marca con ese nombre', 400);
    }

    return catalogRepository.updateMarca(actual, nuevo);
  }

  async deleteMarca(nombre: string): Promise<void> {
    const nombreNormalizado = normalizeIdentifier(nombre);

    if (!(await catalogRepository.marcaExists(nombreNormalizado))) {
      throw new AppError('Marca no encontrada', 404);
    }

    const vehiclesUsing = await vehiclesRepository.countVehiclesByMarca(nombreNormalizado);
    if (vehiclesUsing > 0) {
      throw new AppError('No se puede eliminar, hay vehículos usando esta marca', 409);
    }

    await catalogRepository.deleteMarca(nombreNormalizado);
  }

  async listCategorias(): Promise<Categoria[]> {
    return catalogRepository.listCategorias();
  }

  async createCategoria(nombre: string): Promise<Categoria> {
    const nombreNormalizado = normalizeIdentifier(nombre);
    if (await catalogRepository.categoriaExists(nombreNormalizado)) {
      throw new AppError('Ya existe una categoría con ese nombre', 400);
    }
    return catalogRepository.createCategoria(nombreNormalizado);
  }

  async updateCategoria(nombreActual: string, nuevoNombre: string): Promise<Categoria> {
    const actual = normalizeIdentifier(nombreActual);
    const nuevo = normalizeIdentifier(nuevoNombre);

    if (!(await catalogRepository.categoriaExists(actual))) {
      throw new AppError('Categoría no encontrada', 404);
    }

    if (actual !== nuevo && (await catalogRepository.categoriaExists(nuevo))) {
      throw new AppError('Ya existe una categoría con ese nombre', 400);
    }

    return catalogRepository.updateCategoria(actual, nuevo);
  }

  async deleteCategoria(nombre: string): Promise<void> {
    const nombreNormalizado = normalizeIdentifier(nombre);

    if (!(await catalogRepository.categoriaExists(nombreNormalizado))) {
      throw new AppError('Categoría no encontrada', 404);
    }

    const vehiclesUsing = await vehiclesRepository.countVehiclesByCategoria(nombreNormalizado);
    if (vehiclesUsing > 0) {
      throw new AppError('No se puede eliminar, hay vehículos usando esta categoría', 409);
    }

    await catalogRepository.deleteCategoria(nombreNormalizado);
  }
}

export const catalogService = new CatalogService();