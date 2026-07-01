import { Resolver, Query, Mutation, Args, ID, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GorService } from './gor.service';
import { Gor } from './entities/gor.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class GorResolver {
  constructor(private readonly gorService: GorService) {}

  @Query(() => [Gor], { name: 'gor' })
  @RequirePermissions('gor.index')
  async getAllGor(@CurrentUser() userId: string) {
    const slug = await this.gorService.resolveTenantSlug(userId);
    return this.gorService.findAll(slug);
  }

  @Query(() => Gor, { name: 'gorById' })
  @RequirePermissions('gor.index')
  async getGorById(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.gorService.resolveTenantSlug(userId);
    return this.gorService.findById(slug, id);
  }

  @Mutation(() => Gor, { name: 'createGor' })
  @RequirePermissions('gor.create')
  async createGor(
    @CurrentUser() userId: string,
    @Args('nama') nama: string,
    @Args('alamat', { nullable: true }) alamat?: string,
    @Args('kota', { nullable: true }) kota?: string,
    @Args('telepon', { nullable: true }) telepon?: string,
    @Args('deskripsi', { nullable: true }) deskripsi?: string,
    @Args('fotoUrl', { nullable: true }) fotoUrl?: string,
    @Args('jamBuka', { nullable: true }) jamBuka?: string,
    @Args('jamTutup', { nullable: true }) jamTutup?: string,
    @Args('status', { nullable: true }) status?: string,
  ) {
    const slug = await this.gorService.resolveTenantSlug(userId);
    return this.gorService.create(slug, { nama, alamat, kota, telepon, deskripsi, fotoUrl, jamBuka, jamTutup, status });
  }

  @Mutation(() => Gor, { name: 'updateGor' })
  @RequirePermissions('gor.update')
  async updateGor(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('nama', { nullable: true }) nama?: string,
    @Args('alamat', { nullable: true }) alamat?: string,
    @Args('kota', { nullable: true }) kota?: string,
    @Args('telepon', { nullable: true }) telepon?: string,
    @Args('deskripsi', { nullable: true }) deskripsi?: string,
    @Args('fotoUrl', { nullable: true }) fotoUrl?: string,
    @Args('jamBuka', { nullable: true }) jamBuka?: string,
    @Args('jamTutup', { nullable: true }) jamTutup?: string,
    @Args('status', { nullable: true }) status?: string,
  ) {
    const slug = await this.gorService.resolveTenantSlug(userId);
    return this.gorService.update(slug, id, { nama, alamat, kota, telepon, deskripsi, fotoUrl, jamBuka, jamTutup, status });
  }

  @Mutation(() => Boolean, { name: 'deleteGor' })
  @RequirePermissions('gor.delete')
  async deleteGor(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.gorService.resolveTenantSlug(userId);
    return this.gorService.remove(slug, id);
  }
}