import { Resolver, Query, Mutation, Args, ID, Float, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SppService } from './spp.service';
import { SppSchedulerService } from './spp-scheduler.service';
import { SppTagihan, SppPembayaran } from './entities/spp.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class SppResolver {
  constructor(
    private readonly service: SppService,
    private readonly schedulerService: SppSchedulerService
  ) {}

  @Query(() => [SppTagihan], { name: 'sppTagihan' })
  @RequirePermissions('spp.index')
  async getAllTagihan(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAllTagihan(slug);
  }

  @Query(() => [SppTagihan], { name: 'sppTagihanBySiswa' })
  @RequirePermissions('spp.index')
  async getTagihanBySiswa(@CurrentUser() userId: string, @Args('siswaId', { type: () => ID }) siswaId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findTagihanBySiswa(slug, siswaId);
  }

  @Mutation(() => SppTagihan, { name: 'createSppTagihan' })
  @RequirePermissions('spp.create')
  async createTagihan(
    @CurrentUser() userId: string,
    @Args('siswaId', { type: () => ID }) siswaId: string,
    @Args('bulan', { type: () => Number }) bulan: number,
    @Args('tahun', { type: () => Number }) tahun: number,
    @Args('jumlah', { type: () => Float }) jumlah: number,
    @Args('jatuhTempo', { nullable: true }) jatuhTempo?: string,
    @Args('status', { nullable: true }) status?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { siswaId, bulan, tahun, jumlah };
    if (jatuhTempo !== undefined) data.jatuhTempo = jatuhTempo;
    if (status !== undefined) data.status = status;
    return this.service.createTagihan(slug, data);
  }

  @Mutation(() => SppTagihan, { name: 'updateSppTagihan' })
  @RequirePermissions('spp.update')
  async updateTagihan(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('jumlah', { type: () => Float, nullable: true }) jumlah?: number,
    @Args('status', { nullable: true }) status?: string,
    @Args('jatuhTempo', { nullable: true }) jatuhTempo?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    if (jumlah !== undefined) data.jumlah = jumlah;
    if (status !== undefined) data.status = status;
    if (jatuhTempo !== undefined) data.jatuhTempo = jatuhTempo;
    return this.service.updateTagihan(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteSppTagihan' })
  @RequirePermissions('spp.delete')
  async deleteTagihan(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.deleteTagihan(slug, id);
  }

  @Query(() => [SppPembayaran], { name: 'sppPembayaran' })
  @RequirePermissions('spp.index')
  async getPembayaran(@CurrentUser() userId: string, @Args('tagihanId', { type: () => ID }) tagihanId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findPembayaranByTagihan(slug, tagihanId);
  }

  @Mutation(() => SppPembayaran, { name: 'createSppPembayaran' })
  @RequirePermissions('spp.create')
  async createPembayaran(
    @CurrentUser() userId: string,
    @Args('tagihanId', { type: () => ID }) tagihanId: string,
    @Args('tanggalBayar') tanggalBayar: string,
    @Args('jumlah', { type: () => Float }) jumlah: number,
    @Args('metode', { nullable: true }) metode?: string,
    @Args('buktiUrl', { nullable: true }) buktiUrl?: string,
    @Args('keterangan', { nullable: true }) keterangan?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { tagihanId, tanggalBayar, jumlah };
    if (metode !== undefined) data.metode = metode;
    if (buktiUrl !== undefined) data.buktiUrl = buktiUrl;
    if (keterangan !== undefined) data.keterangan = keterangan;
    return this.service.createPembayaran(slug, data);
  }

  @Mutation(() => Boolean, { name: 'deleteSppPembayaran' })
  @RequirePermissions('spp.delete')
  async deletePembayaran(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.deletePembayaran(slug, id);
  }
}
