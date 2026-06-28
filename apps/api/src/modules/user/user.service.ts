import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { hashPassword } from 'better-auth/crypto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll() {
    return this.userRepository.findAll();
  }

  async findById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User tidak ditemukan.');
    }
    return user;
  }

  async create(data: { name: string; email: string; password?: string; roleIds?: number[] }) {
    // Cek apakah email sudah terdaftar
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new BadRequestException('Email sudah terdaftar.');
    }

    // 1. Buat User baru
    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
    });

    if (!user) {
      throw new BadRequestException('Gagal membuat user.');
    }

    // 2. Jika ada password, buat account credentials (Better Auth)
    if (data.password) {
      const hashedPassword = await hashPassword(data.password);
      await this.userRepository.createAccount({
        userId: user.id,
        providerId: 'credential',
        accountId: data.email,
        password: hashedPassword,
      });
    }

    // 3. Assign roles
    if (data.roleIds && data.roleIds.length > 0) {
      for (const roleId of data.roleIds) {
        await this.userRepository.assignRole(user.id, roleId);
      }
    }

    return this.findById(user.id);
  }

  async updateRoles(userId: string, roleIds: number[]) {
    // Pastikan user ada
    await this.findById(userId);

    // Hapus roles lama
    await this.userRepository.removeRoles(userId);

    // Tambah roles baru
    for (const roleId of roleIds) {
      await this.userRepository.assignRole(userId, roleId);
    }

    return this.findById(userId);
  }

  async delete(id: string) {
    // Pastikan user ada
    await this.findById(id);
    return this.userRepository.delete(id);
  }
}
