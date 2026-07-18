import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards, BadRequestException } from '@nestjs/common';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { Akademi } from './entities/akademi.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { akademi, userAkademis, roleUsers } from '@workspace/db';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

@Resolver()
@UseGuards(AuthGuard)
export class TenantResolver {
  constructor(
    private readonly provisioningService: TenantProvisioningService,
    private readonly dbService: DrizzleService,
  ) {}

  @Query(() => [Akademi], { name: 'myAkademis' })
  async getMyAkademis(@CurrentUser() userId: string): Promise<Akademi[]> {
    const db = this.dbService.db;
    const rows = await db
      .select({
        id: akademi.id,
        nama: akademi.nama,
        slug: akademi.slug,
        logoUrl: akademi.logoUrl,
        alamat: akademi.alamat,
        noHp: akademi.noHp,
        email: akademi.email,
        website: akademi.website,
        paket: akademi.paket,
        isActive: akademi.isActive,
        createdAt: akademi.createdAt,
        updatedAt: akademi.updatedAt,
      })
      .from(userAkademis)
      .innerJoin(akademi, eq(userAkademis.akademiId, akademi.id))
      .where(eq(userAkademis.userId, userId));

    return rows;
  }

  @Mutation(() => Akademi, { name: 'registerAkademi' })
  async registerAkademi(
    @CurrentUser() userId: string,
    @Args('nama') nama: string,
    @Args('slug') slug: string,
    @Args('alamat', { nullable: true }) alamat?: string,
    @Args('noHp', { nullable: true }) noHp?: string,
    @Args('email', { nullable: true }) email?: string,
    @Args('website', { nullable: true }) website?: string,
  ) {
    // 1. Validasi format slug
    const slugRegex = /^[a-z0-9_-]+$/;
    if (!slugRegex.test(slug)) {
      throw new BadRequestException(
        'Format slug tidak valid. Hanya diperbolehkan huruf kecil, angka, dash (-), dan underscore (_).',
      );
    }
    if (slug.length > 50) {
      throw new BadRequestException('Slug maksimal 50 karakter.');
    }

    const db = this.dbService.db;

    // 2. Cek apakah akademi dengan slug yang sama sudah terdaftar
    const [existing] = await db
      .select()
      .from(akademi)
      .where(eq(akademi.slug, slug))
      .limit(1);

    if (existing) {
      throw new BadRequestException(`Akademi dengan slug "${slug}" sudah terdaftar.`);
    }

    // 3. Masukkan data akademi baru ke public.akademi
    const newAkademiId = randomUUID();
    const [newAkademi] = await db
      .insert(akademi)
      .values({
        id: newAkademiId,
        nama,
        slug,
        alamat,
        noHp,
        email,
        website,
        paket: 'gratis',
        isActive: true,
      })
      .returning();

    // 4. Ubah default akademi user yang lama menjadi false
    await db
      .update(userAkademis)
      .set({ isDefault: false })
      .where(eq(userAkademis.userId, userId));

    // 5. Kaitkan user dengan akademi baru ini sebagai default
    await db
      .insert(userAkademis)
      .values({
        userId,
        akademiId: newAkademiId,
        isDefault: true,
      });

    // 6. Tetapkan role "admin" (roleId: 2) ke user di tabel public.role_users
    const [existingRole] = await db
      .select()
      .from(roleUsers)
      .where(and(eq(roleUsers.userId, userId), eq(roleUsers.roleId, 2)))
      .limit(1);

    if (!existingRole) {
      await db
        .insert(roleUsers)
        .values({
          userId,
          roleId: 2, // admin
        });
    }

    // 7. Trigger dynamic schema provisioning & seed data default
    try {
      await this.provisioningService.createTenant(slug);
    } catch (err: any) {
      // Rollback jika provisioning skema gagal
      await db.delete(userAkademis).where(eq(userAkademis.akademiId, newAkademiId));
      await db.delete(akademi).where(eq(akademi.id, newAkademiId));
      throw new BadRequestException(
        `Gagal membuat skema database tenant: ${err?.message || err}`,
      );
    }

    return newAkademi;
  }
}
