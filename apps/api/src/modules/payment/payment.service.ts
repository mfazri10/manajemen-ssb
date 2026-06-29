import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class PaymentService {
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

  async findAll(slug: string, akademiId: string) {
    const t = this.getTenant(slug);
    return this.dbService.db.select().from(t.payment)
      .where(eq(t.payment.akademiId, akademiId))
      .orderBy(desc(t.payment.createdAt));
  }

  async findById(slug: string, id: string) {
    const t = this.getTenant(slug);
    const [result] = await this.dbService.db.select().from(t.payment).where(eq(t.payment.id, id)).limit(1);
    if (!result) throw new NotFoundException('Payment tidak ditemukan.');
    return result;
  }

  async createPayment(slug: string, akademiId: string, langgananId: string, method: string) {
    const t = this.getTenant(slug);

    // Look up langganan to get amount
    let amount = 0;
    if (langgananId) {
      const langganan = await this.dbService.db.select().from(t.langgananAkademi).where(eq(t.langgananAkademi.id, langgananId)).limit(1);
      if (langganan.length) {
        const paket = await this.dbService.db.select().from(t.paketLangganan).where(eq(t.paketLangganan.id, langganan[0]!.paketId)).limit(1);
        if (paket.length) amount = Number(paket[0]!.harga);
      }
    }

    const externalId = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Stub: log the external gateway call
    console.log(`[Payment Gateway] Creating payment: externalId=${externalId}, amount=${amount}, method=${method}`);

    const [result] = await this.dbService.db.insert(t.payment).values({
      akademiId,
      langgananId,
      amount: String(amount),
      method,
      externalId,
      status: 'pending',
    } as any).returning();
    return result;
  }

  async checkPaymentStatus(slug: string, id: string) {
    const t = this.getTenant(slug);
    const payment = await this.findById(slug, id);

    // Stub: simulate checking with external gateway
    console.log(`[Payment Gateway] Checking status for externalId=${payment.externalId}`);

    // For stub, randomly succeed or stay pending
    const newStatus = payment.status === 'pending' ? 'success' : payment.status;
    if (newStatus === 'success' && payment.status === 'pending') {
      const [result] = await this.dbService.db.update(t.payment)
        .set({ status: 'success', paidAt: new Date() })
        .where(eq(t.payment.id, id))
        .returning();
      return result;
    }
    return payment;
  }
}
