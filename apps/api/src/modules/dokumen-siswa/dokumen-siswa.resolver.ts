import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DokumenSiswaService } from './dokumen-siswa.service';
import { DokumenSiswa } from './entities/dokumen-siswa.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class DokumenSiswaResolver {
  constructor(private readonly service: DokumenSiswaService) {}

  @Query(() => [DokumenSiswa], { name: 'dokumenSiswa' })
  @RequirePermissions('dokumen-siswa.index')
  async getAll(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAll(slug);
  }

  @Mutation(() => DokumenSiswa, { name: 'createDokumenSiswa' })
  @RequirePermissions('dokumen-siswa.create')
  async create(
    @CurrentUser() userId: string,
    @Args('siswaId', { type: () => ID }) siswaId: string,
    @Args('jenis') jenis: string,
    @Args('fileUrl') fileUrl: string,
    @Args('namaFile', { nullable: true }) namaFile?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { siswaId, jenis, fileUrl };
    if (namaFile !== undefined) data.namaFile = namaFile;
    return this.service.create(slug, data);
  }

  @Mutation(() => Boolean, { name: 'deleteDokumenSiswa' })
  @RequirePermissions('dokumen-siswa.delete')
  async delete(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.delete(slug, id);
  }
}
