import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { users, accounts, roleUsers } from '@workspace/db';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class UserRepository {
  constructor(private readonly dbService: DrizzleService) {}

  async findAll() {
    return this.dbService.db.query.users.findMany({
      with: {
        roleUsers: {
          with: {
            role: true,
          },
        },
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  }

  async findById(id: string) {
    return this.dbService.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
      with: {
        roleUsers: {
          with: {
            role: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.dbService.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
  }

  async create(data: { name: string; email: string; id?: string }) {
    const [newUser] = await this.dbService.db
      .insert(users)
      .values({
        id: data.id || crypto.randomUUID(),
        name: data.name,
        email: data.email,
      })
      .returning();
    return newUser;
  }

  async createAccount(data: { userId: string; providerId: string; accountId: string; password?: string }) {
    const [newAccount] = await this.dbService.db
      .insert(accounts)
      .values({
        id: crypto.randomUUID(),
        userId: data.userId,
        providerId: data.providerId,
        accountId: data.accountId,
        password: data.password,
      })
      .returning();
    return newAccount;
  }

  async assignRole(userId: string, roleId: number) {
    await this.dbService.db
      .insert(roleUsers)
      .values({ userId, roleId })
      .onConflictDoNothing();

    return this.dbService.db.query.roleUsers.findFirst({
      where: (ru, { and, eq }) => and(eq(ru.userId, userId), eq(ru.roleId, roleId)),
    });
  }

  async removeRoles(userId: string) {
    return this.dbService.db.delete(roleUsers).where(eq(roleUsers.userId, userId));
  }

  async delete(id: string) {
    await this.dbService.db.delete(users).where(eq(users.id, id));
    return true;
  }
}
