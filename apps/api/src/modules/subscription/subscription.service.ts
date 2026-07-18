import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis, subscriptions } from '@workspace/db';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class SubscriptionService {
  constructor(private readonly dbService: DrizzleService) {}

  private getTenant(slug: string) {
    return getTenantSchema(slug);
  }

  async resolveTenantSlug(userId: string): Promise<string> {
    const [ua] = await this.dbService.db
      .select({ slug: akademi.slug })
      .from(userAkademis)
      .innerJoin(akademi, eq(userAkademis.akademiId, akademi.id))
      .where(and(eq(userAkademis.userId, userId), eq(userAkademis.isDefault, true)))
      .limit(1);
    if (!ua) throw new BadRequestException('User tidak memiliki akademi.');
    return ua.slug;
  }

  // Paket Langganan
  async findAllPaket(slug: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.paketLangganan).where(eq(t.paketLangganan.aktif, true)).orderBy(desc(t.paketLangganan.createdAt));
  }

  async createPaket(slug: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const insertData: Record<string, unknown> = { nama: data.nama, harga: data.harga, durasiBulan: data.durasiBulan };
    if (data.maxSiswa !== undefined) insertData.maxSiswa = data.maxSiswa;
    if (data.maxPelatih !== undefined) insertData.maxPelatih = data.maxPelatih;
    if (data.fitur !== undefined) insertData.fitur = data.fitur;
    if (data.aktif !== undefined) insertData.aktif = data.aktif;
    const [result] = await this.dbService.db.insert(t.paketLangganan).values(insertData as any).returning();
    return result;
  }

  async updatePaket(slug: string, id: string, data: Record<string, unknown>) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.paketLangganan).where(eq(t.paketLangganan.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Paket langganan tidak ditemukan.');

    const updateData: Record<string, unknown> = {};
    for (const key of ['nama', 'harga', 'durasiBulan', 'maxSiswa', 'maxPelatih', 'fitur', 'aktif']) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }
    if (Object.keys(updateData).length === 0) throw new BadRequestException('Tidak ada data yang diubah.');
    const [result] = await this.dbService.db.update(t.paketLangganan).set(updateData).where(eq(t.paketLangganan.id, id)).returning();
    return result;
  }

  // Langganan Akademi
  async findLanggananByAkademi(slug: string, akademiId: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.langgananAkademi).where(eq(t.langgananAkademi.akademiId, akademiId)).orderBy(desc(t.langgananAkademi.createdAt));
  }

  async subscribePaket(slug: string, akademiId: string, paketId: string) {
    const t = this.getTenant(slug);
    const paket = await this.dbService.db.select().from(t.paketLangganan).where(eq(t.paketLangganan.id, paketId)).limit(1);
    if (!paket.length) throw new NotFoundException('Paket langganan tidak ditemukan.');

    const now = new Date();
    const berakhir = new Date(now);
    berakhir.setMonth(berakhir.getMonth() + paket[0]!.durasiBulan);

    const [result] = await this.dbService.db.insert(t.langgananAkademi).values({
      akademiId,
      paketId,
      tanggalMulai: now.toISOString().split('T')[0],
      tanggalBerakhir: berakhir.toISOString().split('T')[0],
      status: 'aktif',
    } as any).returning();
    return result;
  }

  async cancelLangganan(slug: string, id: string) {
    const t = this.getTenant(slug);
    const existing = await this.dbService.db.select().from(t.langgananAkademi).where(eq(t.langgananAkademi.id, id)).limit(1);
    if (!existing.length) throw new NotFoundException('Langganan tidak ditemukan.');
    const [result] = await this.dbService.db.update(t.langgananAkademi).set({ status: 'suspended' }).where(eq(t.langgananAkademi.id, id)).returning();
    return result;
  }

  async findActiveSubscription(userId: string) {
    const [ua] = await this.dbService.db
      .select({ akademiId: userAkademis.akademiId })
      .from(userAkademis)
      .where(and(eq(userAkademis.userId, userId), eq(userAkademis.isDefault, true)))
      .limit(1);

    if (!ua) return null;

    const [sub] = await this.dbService.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.akademiId, ua.akademiId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    if (!sub) return null;

    const daysRemaining = sub.expiresAt
      ? Math.max(0, Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 9999;

    return {
      id: sub.id,
      akademiId: sub.akademiId,
      plan: sub.plan,
      status: sub.status,
      startedAt: sub.startedAt,
      expiresAt: sub.expiresAt || undefined,
      daysRemaining,
      isTrial: sub.plan === 'trial',
    };
  }
}
