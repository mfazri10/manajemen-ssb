import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dbService: DrizzleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    let req;
    if (context.getType() === 'http') {
      req = context.switchToHttp().getRequest();
    } else {
      const ctx = GqlExecutionContext.create(context);
      req = ctx.getContext().req;
    }

    const userId = req.userId;

    if (!userId) {
      throw new ForbiddenException('Akses ditolak. Informasi auth tidak lengkap.');
    }

    // Query untuk mengambil permission user
    const roleUsersData = await this.dbService.db.query.roleUsers.findMany({
      where: (ru, { eq }) => eq(ru.userId, userId),
      with: {
        role: {
          with: {
            permissionRoles: {
              with: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // Kumpulkan seluruh permission name yang dimiliki user
    const userPermissions = new Set<string>();
    for (const ru of roleUsersData) {
      for (const pr of ru.role.permissionRoles) {
        userPermissions.add(pr.permission.name);
      }
    }

    // Validasi: user harus memiliki setidaknya salah satu permission yang disyaratkan
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.has(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Akses ditolak. Hak akses tidak mencukupi.');
    }

    return true;
  }
}
