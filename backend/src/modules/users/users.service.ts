import bcrypt from 'bcryptjs';
import { AppError } from '../../shared/utils/AppError.js';
import { usersRepository } from './users.repository.js';
import type {
  AdminUserFilter,
  AdminUserView,
  CreateAdminInput,
  UpdateAdminInput,
  UsuarioEstado,
} from './users.types.js';

const BCRYPT_ROUNDS = 10;

export class UsersService {
  async list(filters: AdminUserFilter): Promise<AdminUserView[]> {
    return usersRepository.list(filters);
  }

  async findById(id: string): Promise<AdminUserView> {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }
    return user;
  }

  async create(input: CreateAdminInput): Promise<AdminUserView> {
    if (await usersRepository.emailExists(input.email)) {
      throw new AppError('Ya existe un usuario con ese email', 400);
    }

    const hashedPassword = await bcrypt.hash(input.contrasena, BCRYPT_ROUNDS);

    return usersRepository.create({
      id_usuario: input.id_usuario,
      nombre: input.nombre,
      email: input.email,
      rol: 'admin',
      contrasena: hashedPassword,
    });
  }

  async update(id: string, input: UpdateAdminInput): Promise<AdminUserView> {
    const existing = await usersRepository.findById(id);
    if (!existing) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (input.email && input.email !== existing.email) {
      if (await usersRepository.emailExists(input.email, id)) {
        throw new AppError('Ya existe un usuario con ese email', 400);
      }
    }

    const data: { nombre?: string; email?: string; contrasena?: string } = {};
    if (input.nombre) data.nombre = input.nombre;
    if (input.email) data.email = input.email;
    if (input.contrasena) data.contrasena = await bcrypt.hash(input.contrasena, BCRYPT_ROUNDS);

    const updated = await usersRepository.update(id, data);
    if (!updated) {
      throw new AppError('Error al actualizar el usuario', 500);
    }

    return updated;
  }

  async updateEstado(id: string, estado: UsuarioEstado, requesterId: string): Promise<AdminUserView> {
    const target = await usersRepository.findById(id);
    if (!target) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (estado === 'inactivo') {
      if (requesterId === id) {
        throw new AppError('No puedes desactivar tu propia cuenta', 400);
      }

      const activeCount = await usersRepository.countActive();
      if (activeCount <= 1) {
        throw new AppError('No se puede desactivar el único administrador activo del sistema', 400);
      }
    }

    const updated = await usersRepository.updateEstado(id, estado);
    if (!updated) {
      throw new AppError('Error al actualizar el estado del usuario', 500);
    }

    return updated;
  }
}

export const usersService = new UsersService();