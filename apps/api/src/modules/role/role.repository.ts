import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { roles, permissions, permissionRoles } from '@workspace/db';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class RoleRepository {
  constructor(private readonly dbService: DrizzleService) {}

  async findAllRoles() {
    return this.dbService.db.query.roles.findMany({
      with: {
        permissionRoles: {
          with: {
            permission: true,
          },
        },
      },
      orderBy: (roles, { asc }) => [asc(roles.id)],
    });
  }

  async findAllPermissions() {
    return this.dbService.db.query.permissions.findMany({
      orderBy: (permissions, { asc }) => [asc(permissions.name)],
    });
  }

  async findRoleById(id: number) {
    return this.dbService.db.query.roles.findFirst({
      where: (roles, { eq }) => eq(roles.id, id),
      with: {
        permissionRoles: {
          with: {
            permission: true,
          },
        },
      },
    });
  }

  async createRole(data: { name: string; label?: string }) {
    const [newRole] = await this.dbService.db.insert(roles).values(data).returning();
    return newRole;
  }

  async updateRole(id: number, data: { name: string; label?: string }) {
    const [updatedRole] = await this.dbService.db
      .update(roles)
      .set(data)
      .where(eq(roles.id, id))
      .returning();
    return updatedRole;
  }

  async deleteRole(id: number) {
    const [deletedRole] = await this.dbService.db
      .delete(roles)
      .where(eq(roles.id, id))
      .returning();
    return deletedRole;
  }

  async createPermission(data: { name: string; label?: string }) {
    const [newPermission] = await this.dbService.db.insert(permissions).values(data).returning();
    return newPermission;
  }

  async updatePermission(id: number, data: { name: string; label?: string }) {
    const [updatedPermission] = await this.dbService.db
      .update(permissions)
      .set(data)
      .where(eq(permissions.id, id))
      .returning();
    return updatedPermission;
  }

  async deletePermission(id: number) {
    const [deletedPermission] = await this.dbService.db
      .delete(permissions)
      .where(eq(permissions.id, id))
      .returning();
    return deletedPermission;
  }

  async deletePermissionByName(name: string) {
    return this.dbService.db.delete(permissions).where(eq(permissions.name, name));
  }

  async findPermissionByName(name: string) {
    return this.dbService.db.query.permissions.findFirst({
      where: (p, { eq }) => eq(p.name, name),
    });
  }

  async removeRolePermissions(roleId: number) {
    return this.dbService.db.delete(permissionRoles).where(eq(permissionRoles.roleId, roleId));
  }

  async assignPermissionToRole(roleId: number, permissionId: number) {
    await this.dbService.db
      .insert(permissionRoles)
      .values({ roleId, permissionId })
      .onConflictDoNothing();

    return this.dbService.db.query.permissionRoles.findFirst({
      where: (pr, { and, eq }) => and(eq(pr.roleId, roleId), eq(pr.permissionId, permissionId)),
    });
  }
}
