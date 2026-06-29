import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotifikasiService } from './notifikasi.service';
import { Notifikasi } from './entities/notifikasi.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class NotifikasiResolver {
  constructor(private readonly service: NotifikasiService) {}

  @Query(() => [Notifikasi], { name: 'notifikasi' })
  @RequirePermissions('pengumuman.index')
  async getNotifikasi(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAll(slug, userId);
  }

  @Mutation(() => Notifikasi, { name: 'createNotifikasi' })
  @RequirePermissions('pengumuman.create')
  async createNotifikasi(@CurrentUser() userId: string, @Args('judul') judul: string, @Args('isi') isi: string, @Args('tipe', { nullable: true }) tipe?: string, @Args('target', { nullable: true }) target?: string, @Args('penerimaUserId', { nullable: true }) penerimaUserId?: string, @Args('sentVia', { nullable: true }) sentVia?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { judul, isi };
    for (const [k, v] of Object.entries({ tipe, target, penerimaUserId, sentVia })) { if (v !== undefined) data[k] = v; }
    return this.service.create(slug, data);
  }

  @Mutation(() => Notifikasi, { name: 'markNotifikasiRead' })
  async markRead(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.markAsRead(slug, id);
  }

  @Mutation(() => Boolean, { name: 'deleteNotifikasi' })
  @RequirePermissions('pengumuman.delete')
  async deleteNotifikasi(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.delete(slug, id);
  }

  @Mutation(() => Boolean, { name: 'sendWhatsApp' })
  async sendWhatsApp(
    @Args('phone') phone: string,
    @Args('message') message: string,
  ) {
    return this.service.sendWhatsApp(phone, message);
  }

  @Mutation(() => Boolean, { name: 'sendEmail' })
  async sendEmail(
    @Args('to') to: string,
    @Args('subject') subject: string,
    @Args('message') message: string,
  ) {
    return this.service.sendEmail(to, subject, message);
  }

  @Mutation(() => Boolean, { name: 'broadcastPengumuman' })
  @RequirePermissions('pengumuman.create')
  async broadcastPengumuman(
    @CurrentUser() userId: string,
    @Args('pengumumanId', { type: () => ID }) pengumumanId: string,
    @Args('channel') channel: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.broadcastPengumuman(slug, pengumumanId, channel);
  }
}
