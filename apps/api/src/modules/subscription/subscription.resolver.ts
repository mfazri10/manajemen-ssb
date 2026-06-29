import { Resolver, Query, Mutation, Args, ID, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { PaketLangganan, LanggananAkademi } from './entities/subscription.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class SubscriptionResolver {
  constructor(private readonly service: SubscriptionService) {}

  @Query(() => [PaketLangganan], { name: 'paketLangganan' })
  @RequirePermissions('subscription.index')
  async getPaketLangganan(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAllPaket(slug);
  }

  @Query(() => [LanggananAkademi], { name: 'langgananAkademi' })
  @RequirePermissions('subscription.index')
  async getLanggananAkademi(
    @CurrentUser() userId: string,
    @Args('akademiId') akademiId: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findLanggananByAkademi(slug, akademiId);
  }

  @Mutation(() => PaketLangganan, { name: 'createPaketLangganan' })
  @RequirePermissions('subscription.create')
  async createPaketLangganan(
    @CurrentUser() userId: string,
    @Args('nama') nama: string,
    @Args('harga', { type: () => Float }) harga: number,
    @Args('durasiBulan', { type: () => Number }) durasiBulan: number,
    @Args('maxSiswa', { type: () => Number, nullable: true }) maxSiswa?: number,
    @Args('maxPelatih', { type: () => Number, nullable: true }) maxPelatih?: number,
    @Args('fitur', { nullable: true }) fitur?: string,
    @Args('aktif', { type: () => Boolean, nullable: true }) aktif?: boolean,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { nama, harga, durasiBulan };
    for (const [k, v] of Object.entries({ maxSiswa, maxPelatih, fitur, aktif })) {
      if (v !== undefined) data[k] = v;
    }
    return this.service.createPaket(slug, data);
  }

  @Mutation(() => PaketLangganan, { name: 'updatePaketLangganan' })
  @RequirePermissions('subscription.update')
  async updatePaketLangganan(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('nama', { nullable: true }) nama?: string,
    @Args('harga', { type: () => Float, nullable: true }) harga?: number,
    @Args('durasiBulan', { type: () => Number, nullable: true }) durasiBulan?: number,
    @Args('maxSiswa', { type: () => Number, nullable: true }) maxSiswa?: number,
    @Args('maxPelatih', { type: () => Number, nullable: true }) maxPelatih?: number,
    @Args('fitur', { nullable: true }) fitur?: string,
    @Args('aktif', { type: () => Boolean, nullable: true }) aktif?: boolean,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries({ nama, harga, durasiBulan, maxSiswa, maxPelatih, fitur, aktif })) {
      if (v !== undefined) data[k] = v;
    }
    return this.service.updatePaket(slug, id, data);
  }

  @Mutation(() => LanggananAkademi, { name: 'subscribePaket' })
  @RequirePermissions('subscription.create')
  async subscribePaket(
    @CurrentUser() userId: string,
    @Args('akademiId') akademiId: string,
    @Args('paketId', { type: () => ID }) paketId: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.subscribePaket(slug, akademiId, paketId);
  }

  @Mutation(() => LanggananAkademi, { name: 'cancelLangganan' })
  @RequirePermissions('subscription.update')
  async cancelLangganan(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.cancelLangganan(slug, id);
  }
}
