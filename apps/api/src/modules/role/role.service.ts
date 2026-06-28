import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async findAllRoles() {
    return this.roleRepository.findAllRoles();
  }

  async findAllPermissions() {
    return this.roleRepository.findAllPermissions();
  }

  async findRoleById(id: number) {
    const role = await this.roleRepository.findRoleById(id);
    if (!role) {
      throw new NotFoundException('Role tidak ditemukan.');
    }
    return role;
  }

  async createRole(data: { name: string; label?: string }) {
    return this.roleRepository.createRole(data);
  }

  async updateRole(id: number, data: { name: string; label?: string }) {
    await this.findRoleById(id);
    return this.roleRepository.updateRole(id, data);
  }

  async deleteRole(id: number) {
    await this.findRoleById(id);
    return this.roleRepository.deleteRole(id);
  }

  async createFeature(id: string, label: string, fungsi: string[]) {
    const createdPermissions = [];
    for (const func of fungsi) {
      const permName = `${id}.${func}`;
      const permLabel = `${this.getFuncIndonesian(func)} ${label}`;
      
      // Upsert permission
      const existing = await this.roleRepository.findPermissionByName(permName);
      if (!existing) {
        const created = await this.roleRepository.createPermission({
          name: permName,
          label: permLabel,
        });
        createdPermissions.push(created);
      }
    }
    return createdPermissions;
  }

  async updateFeature(oldId: string, newId: string, label: string, fungsi: string[]) {
    // 1. Dapatkan semua permissions saat ini
    const allPerms = await this.roleRepository.findAllPermissions();
    const oldPrefix = `${oldId}.`;
    const newPrefix = `${newId}.`;
    
    const existingPermsOfOldFeature = allPerms.filter((p) => p.name.startsWith(oldPrefix));

    // 2. Hapus yang tidak ada di fungsi baru
    for (const p of existingPermsOfOldFeature) {
      const funcName = p.name.substring(oldPrefix.length);
      if (!fungsi.includes(funcName)) {
        await this.roleRepository.deletePermission(p.id);
      }
    }

    // 3. Buat atau update fungsi yang baru
    for (const func of fungsi) {
      const oldPermName = `${oldId}.${func}`;
      const newPermName = `${newId}.${func}`;
      const permLabel = `${this.getFuncIndonesian(func)} ${label}`;

      const existingOld = existingPermsOfOldFeature.find((p) => p.name === oldPermName);
      if (existingOld) {
        // Update
        await this.roleRepository.updatePermission(existingOld.id, {
          name: newPermName,
          label: permLabel,
        });
      } else {
        // Create new
        const existingNew = await this.roleRepository.findPermissionByName(newPermName);
        if (!existingNew) {
          await this.roleRepository.createPermission({
            name: newPermName,
            label: permLabel,
          });
        }
      }
    }

    return true;
  }

  async deleteFeature(id: string) {
    const allPerms = await this.roleRepository.findAllPermissions();
    const prefix = `${id}.`;
    const toDelete = allPerms.filter((p) => p.name.startsWith(prefix));

    for (const p of toDelete) {
      await this.roleRepository.deletePermission(p.id);
    }
    return true;
  }

  private getFuncIndonesian(func: string): string {
    const map: Record<string, string> = {
      index: 'Lihat',
      view: 'Lihat',
      create: 'Tambah',
      update: 'Ubah',
      delete: 'Hapus',
      print: 'Cetak',
      detail: 'Detail',
      import: 'Import',
      export: 'Ekspor',
    };
    return map[func] || func;
  }

  async updateRolePermissions(roleId: number, permissionIds: number[]) {
    // Pastikan role ada
    await this.findRoleById(roleId);

    // Hapus relasi permission lama
    await this.roleRepository.removeRolePermissions(roleId);

    // Tambah relasi permission baru
    for (const permissionId of permissionIds) {
      await this.roleRepository.assignPermissionToRole(roleId, permissionId);
    }

    return this.findRoleById(roleId);
  }
}
