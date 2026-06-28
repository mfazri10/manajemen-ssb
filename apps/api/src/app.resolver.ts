import { Resolver, Query, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from './common/guards/auth.guard';
import { CurrentUser } from './common/decorators/current-user.decorator';
import { DrizzleService } from './drizzle/drizzle.service';

@ObjectType()
class UserProfile {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  email!: string;

  @Field(() => [String])
  roles!: string[];

  @Field(() => [String])
  permissions!: string[];
}

@Resolver()
export class AppResolver {
  constructor(private readonly dbService: DrizzleService) {}

  @Query(() => String, { name: 'ping' })
  ping(): string {
    return 'pong';
  }

  @Query(() => UserProfile, { name: 'me' })
  @UseGuards(AuthGuard)
  async me(@CurrentUser() userId: string): Promise<UserProfile> {
    const user = await this.dbService.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    // Ambil roles & permissions user dari database
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

    const rolesList: string[] = [];
    const permissionsSet = new Set<string>();

    for (const ru of roleUsersData) {
      rolesList.push(ru.role.name);
      for (const pr of ru.role.permissionRoles) {
        permissionsSet.add(pr.permission.name);
      }
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: rolesList,
      permissions: Array.from(permissionsSet),
    };
  }
}
