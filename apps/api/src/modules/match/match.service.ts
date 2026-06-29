import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc, sql } from 'drizzle-orm';

@Injectable()
export class MatchService {
  constructor(private readonly dbService: DrizzleService) {}

  private getTenant(slug: string) { return getTenantSchema(slug); }

  async resolveTenantSlug(userId: string): Promise<string> {
    const [ua] = await this.dbService.db.select({ slug: akademi.slug }).from(userAkademis)
      .innerJoin(akademi, eq(userAkademis.akademiId, akademi.id))
      .where(and(eq(userAkademis.userId, userId), eq(userAkademis.isDefault, true))).limit(1);
    if (!ua) throw new BadRequestException('User tidak memiliki akademi.');
    return ua.slug;
  }

  // ========== MATCH ==========
  async findAllMatch(slug: string, turnamenId?: string) {
    const t = this.getTenant(slug);
    if (turnamenId) {
      return this.dbService.db.select().from(t.match).where(eq(t.match.turnamenId, turnamenId)).orderBy(t.match.tanggal);
    }
    return this.dbService.db.select().from(t.match).orderBy(desc(t.match.tanggal));
  }

  async createMatch(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [r] = await this.dbService.db.insert(t.match).values(data as any).returning();
    return r;
  }

  async updateMatch(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.match).where(eq(t.match.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Match tidak ditemukan.');
    const updateData: Record<string, unknown> = {};
    for (const k of ['turnamenId', 'babak', 'matchNo', 'tanggal', 'waktu', 'lokasi', 'timHome', 'timAway', 'skorHome', 'skorAway', 'status', 'catatan']) {
      if (data[k] !== undefined) updateData[k] = data[k];
    }
    if (!Object.keys(updateData).length) throw new BadRequestException('Tidak ada data yang diubah.');
    const [r] = await this.dbService.db.update(t.match).set(updateData).where(eq(t.match.id, id)).returning();
    return r;
  }

  async deleteMatch(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.match).where(eq(t.match.id, id));
    return true;
  }

  // ========== MATCH LINEUP ==========
  async findLineup(slug: string, matchId: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.matchLineup).where(eq(t.matchLineup.matchId, matchId));
  }

  async createLineup(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [r] = await this.dbService.db.insert(t.matchLineup).values(data as any).returning();
    return r;
  }

  async deleteLineup(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.matchLineup).where(eq(t.matchLineup.id, id));
    return true;
  }

  // ========== MATCH EVENT ==========
  async findEvents(slug: string, matchId: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.matchEvent).where(eq(t.matchEvent.matchId, matchId)).orderBy(t.matchEvent.menit);
  }

  async createEvent(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const [r] = await this.dbService.db.insert(t.matchEvent).values(data as any).returning();
    return r;
  }

  async deleteEvent(slug: string, id: string) {
    const t = this.getTenant(slug);
    await this.dbService.db.delete(t.matchEvent).where(eq(t.matchEvent.id, id));
    return true;
  }

  // ========== KLASEMEN ==========
  async getKlasemen(slug: string, turnamenId: string) {
    const t = this.getTenant(slug);
    const matches = await this.dbService.db.select().from(t.match)
      .where(and(eq(t.match.turnamenId, turnamenId), eq(t.match.status, 'selesai')));

    const standings: Record<string, { tim: string; main: number; menang: number; seri: number; kalah: number; golMasuk: number; golKemasukan: number }> = {};

    for (const m of matches) {
      const home = m.timHome || 'Home';
      const away = m.timAway || 'Away';
      if (!standings[home]) standings[home] = { tim: home, main: 0, menang: 0, seri: 0, kalah: 0, golMasuk: 0, golKemasukan: 0 };
      if (!standings[away]) standings[away] = { tim: away, main: 0, menang: 0, seri: 0, kalah: 0, golMasuk: 0, golKemasukan: 0 };

      standings[home].main++; standings[away].main++;
      standings[home].golMasuk += m.skorHome || 0; standings[home].golKemasukan += m.skorAway || 0;
      standings[away].golMasuk += m.skorAway || 0; standings[away].golKemasukan += m.skorHome || 0;

      if ((m.skorHome || 0) > (m.skorAway || 0)) { standings[home].menang++; standings[away].kalah++; }
      else if ((m.skorHome || 0) < (m.skorAway || 0)) { standings[away].menang++; standings[home].kalah++; }
      else { standings[home].seri++; standings[away].seri++; }
    }

    return Object.values(standings).map(s => ({
      ...s,
      selisihGol: s.golMasuk - s.golKemasukan,
      poin: s.menang * 3 + s.seri,
    })).sort((a, b) => b.poin - a.poin || b.selisihGol - a.selisihGol);
  }
}
