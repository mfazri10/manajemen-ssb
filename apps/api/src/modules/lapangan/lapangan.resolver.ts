import { Resolver, Query, Mutation, Args, ID, Float, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LapanganService } from './lapangan.service';
import { Lapangan } from './entities/lapangan.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class LapanganResolver {
  constructor(private readonly lapanganService: LapanganService) {}

  @Query(() => [Lapangan], { name: 'lapangan' })
  @RequirePermissions('lapangan.index')
  async getAllLapangan(
    @CurrentUser() userId: string,
    @Args('gorId', { type: () => ID, nullable: true }) gorId?: string,
  ) {
    const slug = await this.lapanganService.resolveTenantSlug(userId);
    return this.lapanganService.findAll(slug, gorId);
  }

  @Query(() => Lapangan, { name: 'lapanganById' })
  @RequirePermissions('lapangan.index')
  async getLapanganById(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.lapanganService.resolveTenantSlug(userId);
    return this.lapanganService.findById(slug, id);
  }

  @Mutation(() => Lapangan, { name: 'createLapangan' })
  @RequirePermissions('lapangan.create')
  async createLapangan(
    @CurrentUser() userId: string,
    @Args('gorId', { type: () => ID }) gorId: string,
    @Args('nama') nama: string,
    @Args('tipe') tipe: string,
    @Args('permukaan', { nullable: true }) permukaan?: string,
    @Args('indoor', { nullable: true }) indoor?: boolean,
    @Args('tarifPerJam', { type: () => Float, nullable: true }) tarifPerJam?: number,
    @Args('kapasitas', { type: () => Int, nullable: true }) kapasitas?: number,
    @Args('fotoUrl', { nullable: true }) fotoUrl?: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('keterangan', { nullable: true }) keterangan?: string,
  ) {
    const slug = await this.lapanganService.resolveTenantSlug(userId);
    return this.lapanganService.create(slug, { gorId, nama, tipe, permukaan, indoor, tarifPerJam, kapasitas, fotoUrl, status, keterangan });
  }

  @Mutation(() => Lapangan, { name: 'updateLapangan' })
  @RequirePermissions('lapangan.update')
  async updateLapangan(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('nama', { nullable: true }) nama?: string,
    @Args('tipe', { nullable: true }) tipe?: string,
    @Args('permukaan', { nullable: true }) permukaan?: string,
    @Args('indoor', { nullable: true }) indoor?: boolean,
    @Args('tarifPerJam', { type: () => Float, nullable: true }) tarifPerJam?: number,
    @Args('kapasitas', { type: () => Int, nullable: true }) kapasitas?: number,
    @Args('fotoUrl', { nullable: true }) fotoUrl?: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('keterangan', { nullable: true }) keterangan?: string,
  ) {
    const slug = await this.lapanganService.resolveTenantSlug(userId);
    return this.lapanganService.update(slug, id, { nama, tipe, permukaan, indoor, tarifPerJam, kapasitas, fotoUrl, status, keterangan });
  }

  @Mutation(() => Boolean, { name: 'deleteLapangan' })
  @RequirePermissions('lapangan.delete')
  async deleteLapangan(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.lapanganService.resolveTenantSlug(userId);
    return this.lapanganService.remove(slug, id);
  }
}