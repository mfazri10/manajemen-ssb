import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { menus, permissions } from '@workspace/db';
import { eq, and, isNull, like } from 'drizzle-orm';

@Injectable()
export class MenuService {
  constructor(private readonly dbService: DrizzleService) {}

  async findActiveMenuTree() {
    return this.dbService.db.query.menus.findMany({
      where: (menus, { eq, and, isNull }) => and(isNull(menus.parentId), eq(menus.isActive, true)),
      with: {
        subMenus: {
          where: (sub, { eq }) => eq(sub.isActive, true),
          orderBy: (sub, { asc }) => [asc(sub.orderNo)],
        },
      },
      orderBy: (menus, { asc }) => [asc(menus.orderNo)],
    });
  }

  async findAllMenus() {
    return this.dbService.db.query.menus.findMany({
      with: {
        subMenus: {
          orderBy: (sub, { asc }) => [asc(sub.orderNo)],
        },
      },
      orderBy: (menus, { asc }) => [asc(menus.orderNo)],
    });
  }

  async createMenu(data: {
    name: string;
    route?: string;
    icon?: string;
    parentId?: number;
    orderNo: number;
    isActive?: boolean;
    slug: string;
  }) {
    // Check unique slug
    const existing = await this.dbService.db.query.menus.findFirst({
      where: (menus, { eq }) => eq(menus.slug, data.slug),
    });
    if (existing) {
      throw new ConflictException(`Menu dengan slug "${data.slug}" sudah terdaftar.`);
    }

    // Create menu
    const [menu] = await this.dbService.db
      .insert(menus)
      .values({
        name: data.name,
        route: data.route,
        icon: data.icon,
        parentId: data.parentId,
        orderNo: data.orderNo,
        isActive: data.isActive ?? true,
        slug: data.slug,
      })
      .returning();

    // Auto-generate permissions
    const ops = [
      { suffix: 'index', prefix: 'Lihat Menu' },
      { suffix: 'create', prefix: 'Tambah Data' },
      { suffix: 'update', prefix: 'Ubah Data' },
      { suffix: 'delete', prefix: 'Hapus Data' },
    ];

    for (const op of ops) {
      const permName = `${data.slug}.${op.suffix}`;
      const permLabel = `${op.prefix} ${data.name}`;

      const permExisting = await this.dbService.db.query.permissions.findFirst({
        where: (p, { eq }) => eq(p.name, permName),
      });

      if (!permExisting) {
        await this.dbService.db.insert(permissions).values({
          name: permName,
          label: permLabel,
        });
      }
    }

    return menu;
  }

  async updateMenu(
    id: number,
    data: {
      name?: string;
      route?: string;
      icon?: string;
      parentId?: number;
      orderNo?: number;
      isActive?: boolean;
      slug?: string;
    }
  ) {
    const existingMenu = await this.dbService.db.query.menus.findFirst({
      where: (menus, { eq }) => eq(menus.id, id),
    });
    if (!existingMenu) {
      throw new NotFoundException('Menu tidak ditemukan.');
    }

    // Check unique slug if changed
    if (data.slug && data.slug !== existingMenu.slug) {
      const slugConflict = await this.dbService.db.query.menus.findFirst({
        where: (menus, { eq }) => eq(menus.slug, data.slug!),
      });
      if (slugConflict) {
        throw new ConflictException(`Menu dengan slug "${data.slug}" sudah terdaftar.`);
      }

      // Rename old permissions to new permissions
      const oldPrefix = `${existingMenu.slug}.`;
      const newPrefix = `${data.slug}.`;
      
      const permissionsToRename = await this.dbService.db.query.permissions.findMany({
        where: (p, { like }) => like(p.name, `${oldPrefix}%`),
      });

      for (const p of permissionsToRename) {
        const funcName = p.name.substring(oldPrefix.length);
        const newName = `${newPrefix}${funcName}`;
        const newLabel = p.label
          ? p.label.replace(existingMenu.name, data.name || existingMenu.name)
          : null;

        await this.dbService.db
          .update(permissions)
          .set({
            name: newName,
            label: newLabel,
          })
          .where(eq(permissions.id, p.id));
      }
    } else if (data.name && data.name !== existingMenu.name) {
      // Just rename permission labels if name changed but slug remains
      const oldPrefix = `${existingMenu.slug}.`;
      const permissionsToRename = await this.dbService.db.query.permissions.findMany({
        where: (p, { like }) => like(p.name, `${oldPrefix}%`),
      });

      for (const p of permissionsToRename) {
        const newLabel = p.label
          ? p.label.replace(existingMenu.name, data.name)
          : null;

        await this.dbService.db
          .update(permissions)
          .set({
            label: newLabel,
          })
          .where(eq(permissions.id, p.id));
      }
    }

    const [updatedMenu] = await this.dbService.db
      .update(menus)
      .set(data)
      .where(eq(menus.id, id))
      .returning();

    return updatedMenu;
  }

  async deleteMenu(id: number) {
    const existingMenu = await this.dbService.db.query.menus.findFirst({
      where: (menus, { eq }) => eq(menus.id, id),
    });
    if (!existingMenu) {
      throw new NotFoundException('Menu tidak ditemukan.');
    }

    // Delete permissions starting with this slug
    const prefix = `${existingMenu.slug}.`;
    await this.dbService.db
      .delete(permissions)
      .where(like(permissions.name, `${prefix}%`));

    // Delete menu
    const [deletedMenu] = await this.dbService.db
      .delete(menus)
      .where(eq(menus.id, id))
      .returning();

    return deletedMenu;
  }
}
