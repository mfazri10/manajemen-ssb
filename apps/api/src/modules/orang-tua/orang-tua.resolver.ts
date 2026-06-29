import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrangTuaService } from './orang-tua.service';
import { OrangTua } from './entities/orang-tua.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class OrangTuaResolver {
  constructor(private readonly service: OrangTuaService) {}

  @Query(() => [OrangTua], { name: 'orangTua' })
  @RequirePermissions('orang-tua.index')
  async getAll(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAll(slug);
  }

  @Query(() => OrangTua, { name: 'orangTuaBySiswa', nullable: true })
  @RequirePermissions('orang-tua.index')
  async getBySiswaId(
    @CurrentUser() userId: string,
    @Args('siswaId', { type: () => ID }) siswaId: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findBySiswaId(slug, siswaId);
  }

  @Mutation(() => OrangTua, { name: 'createOrangTua' })
  @RequirePermissions('orang-tua.create')
  async create(
    @CurrentUser() userId: string,
    @Args('siswaId', { type: () => ID }) siswaId: string,
    @Args('namaOrangTua') namaOrangTua: string,
    @Args('hpOrangTua') hpOrangTua: string,
    @Args('hpAyah', { nullable: true }) hpAyah?: string,
    @Args('hpIbu', { nullable: true }) hpIbu?: string,
    @Args('email', { nullable: true }) email?: string,
    @Args('hubungan', { nullable: true }) hubungan?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { siswaId, namaOrangTua, hpOrangTua };
    for (const [k, v] of Object.entries({ hpAyah, hpIbu, email, hubungan })) {
      if (v !== undefined) data[k] = v;
    }
    return this.service.create(slug, data);
  }

  @Mutation(() => OrangTua, { name: 'updateOrangTua' })
  @RequirePermissions('orang-tua.update')
  async update(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('namaOrangTua', { nullable: true }) namaOrangTua?: string,
    @Args('hpOrangTua', { nullable: true }) hpOrangTua?: string,
    @Args('hpAyah', { nullable: true }) hpAyah?: string,
    @Args('hpIbu', { nullable: true }) hpIbu?: string,
    @Args('email', { nullable: true }) email?: string,
    @Args('hubungan', { nullable: true }) hubungan?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    if (namaOrangTua !== undefined) data.namaOrangTua = namaOrangTua;
    if (hpOrangTua !== undefined) data.hpOrangTua = hpOrangTua;
    if (hpAyah !== undefined) data.hpAyah = hpAyah;
    if (hpIbu !== undefined) data.hpIbu = hpIbu;
    if (email !== undefined) data.email = email;
    if (hubungan !== undefined) data.hubungan = hubungan;
    return this.service.update(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteOrangTua' })
  @RequirePermissions('orang-tua.delete')
  async delete(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.delete(slug, id);
  }
}
