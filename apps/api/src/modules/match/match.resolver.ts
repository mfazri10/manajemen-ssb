import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MatchService } from './match.service';
import { Match, MatchLineup, MatchEvent, KlasemenEntry } from './entities/match.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class MatchResolver {
  constructor(private readonly service: MatchService) {}

  // ========== MATCH ==========
  @Query(() => [Match], { name: 'match' })
  @RequirePermissions('turnamen.index')
  async getMatch(@CurrentUser() userId: string, @Args('turnamenId', { type: () => ID, nullable: true }) turnamenId?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findAllMatch(slug, turnamenId || undefined);
  }

  @Mutation(() => Match, { name: 'createMatch' })
  @RequirePermissions('turnamen.create')
  async createMatch(@CurrentUser() userId: string, @Args('turnamenId', { type: () => ID }) turnamenId: string, @Args('timHome', { nullable: true }) timHome?: string, @Args('timAway', { nullable: true }) timAway?: string, @Args('tanggal', { nullable: true }) tanggal?: string, @Args('waktu', { nullable: true }) waktu?: string, @Args('lokasi', { nullable: true }) lokasi?: string, @Args('babak', { nullable: true }) babak?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { turnamenId };
    for (const [k, v] of Object.entries({ timHome, timAway, tanggal, waktu, lokasi, babak })) { if (v !== undefined) data[k] = v; }
    return this.service.createMatch(slug, data);
  }

  @Mutation(() => Match, { name: 'updateMatch' })
  @RequirePermissions('turnamen.update')
  async updateMatch(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string, @Args('skorHome', { type: () => Int, nullable: true }) skorHome?: number, @Args('skorAway', { type: () => Int, nullable: true }) skorAway?: number, @Args('status', { nullable: true }) status?: string, @Args('catatan', { nullable: true }) catatan?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries({ skorHome, skorAway, status, catatan })) { if (v !== undefined) data[k] = v; }
    return this.service.updateMatch(slug, id, data);
  }

  @Mutation(() => Boolean, { name: 'deleteMatch' })
  @RequirePermissions('turnamen.delete')
  async deleteMatch(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.deleteMatch(slug, id);
  }

  // ========== LINEUP ==========
  @Query(() => [MatchLineup], { name: 'matchLineup' })
  @RequirePermissions('turnamen.index')
  async getLineup(@CurrentUser() userId: string, @Args('matchId', { type: () => ID }) matchId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findLineup(slug, matchId);
  }

  @Mutation(() => MatchLineup, { name: 'createMatchLineup' })
  @RequirePermissions('turnamen.create')
  async createLineup(@CurrentUser() userId: string, @Args('matchId', { type: () => ID }) matchId: string, @Args('siswaId', { type: () => ID }) siswaId: string, @Args('tim', { nullable: true }) tim?: string, @Args('posisi', { nullable: true }) posisi?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { matchId, siswaId };
    for (const [k, v] of Object.entries({ tim, posisi })) { if (v !== undefined) data[k] = v; }
    return this.service.createLineup(slug, data);
  }

  @Mutation(() => Boolean, { name: 'deleteMatchLineup' })
  @RequirePermissions('turnamen.delete')
  async deleteLineup(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.deleteLineup(slug, id);
  }

  // ========== EVENTS ==========
  @Query(() => [MatchEvent], { name: 'matchEvent' })
  @RequirePermissions('turnamen.index')
  async getEvents(@CurrentUser() userId: string, @Args('matchId', { type: () => ID }) matchId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findEvents(slug, matchId);
  }

  @Mutation(() => MatchEvent, { name: 'createMatchEvent' })
  @RequirePermissions('turnamen.create')
  async createEvent(@CurrentUser() userId: string, @Args('matchId', { type: () => ID }) matchId: string, @Args('tipe') tipe: string, @Args('siswaId', { type: () => ID, nullable: true }) siswaId?: string, @Args('menit', { type: () => Int, nullable: true }) menit?: number, @Args('keterangan', { nullable: true }) keterangan?: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    const data: Record<string, unknown> = { matchId, tipe };
    for (const [k, v] of Object.entries({ siswaId, menit, keterangan })) { if (v !== undefined) data[k] = v; }
    return this.service.createEvent(slug, data);
  }

  @Mutation(() => Boolean, { name: 'deleteMatchEvent' })
  @RequirePermissions('turnamen.delete')
  async deleteEvent(@CurrentUser() userId: string, @Args('id', { type: () => ID }) id: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.deleteEvent(slug, id);
  }

  // ========== KLASEMEN ==========
  @Query(() => [KlasemenEntry], { name: 'klasemen' })
  @RequirePermissions('turnamen.index')
  async getKlasemen(@CurrentUser() userId: string, @Args('turnamenId', { type: () => ID }) turnamenId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.getKlasemen(slug, turnamenId);
  }
}
