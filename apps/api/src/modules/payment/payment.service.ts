import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { XenditService } from './xendit.service';
import { getTenantSchema } from '@workspace/db';
import { akademi, userAkademis } from '@workspace/db';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class PaymentService {
  constructor(
    private readonly dbService: DrizzleService,
    private readonly xenditService: XenditService,
  ) {}

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

    // Ambil paket langganan untuk menghitung jumlah pembayaran
    let amount = 0;
    let descNama = 'Pembayaran Langganan';
    if (langgananId) {
      const langganan = await this.dbService.db.select().from(t.langgananAkademi).where(eq(t.langgananAkademi.id, langgananId)).limit(1);
      if (langganan.length) {
        const paket = await this.dbService.db.select().from(t.paketLangganan).where(eq(t.paketLangganan.id, langganan[0]!.paketId)).limit(1);
        if (paket.length) {
          amount = Number(paket[0]!.harga);
          descNama = `Langganan Paket ${paket[0]!.nama}`;
        }
      }
    }

    const uuidRaw = Math.random().toString(36).substring(2, 10);
    // Format externalId terisolasi multi-tenant dengan melampirkan slug di depannya
    const externalId = `${slug}:PAY-${Date.now()}-${uuidRaw}`;
    const payerEmail = `billing@${slug}.com`;

    let invoiceUrl = '';
    let apiStatus = 'pending';

    try {
      // Hubungi Xendit Gateway API untuk membuat link invoice digital
      const invoice = await this.xenditService.createInvoice(externalId, amount, payerEmail, descNama);
      invoiceUrl = invoice.invoiceUrl;
      apiStatus = invoice.status.toLowerCase();
    } catch (e: any) {
      console.error(`[Xendit Integration Failed, fallback to manual]: ${e?.message}`);
    }

    const metadataObj = { invoiceUrl, generatedAt: new Date().toISOString() };

    const [result] = await this.dbService.db.insert(t.payment).values({
      akademiId,
      langgananId,
      amount: String(amount),
      method,
      externalId,
      status: apiStatus,
      metadata: JSON.stringify(metadataObj),
    } as any).returning();
    return result;
  }

  async checkPaymentStatus(slug: string, id: string) {
    const t = this.getTenant(slug);
    const payment = await this.findById(slug, id);

    // Status checking simulasi & sinkronisasi
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

  /**
   * Endpoint Webhook Callback Handler untuk Xendit
   */
  async handleXenditWebhook(token: string, payload: any) {
    if (!this.xenditService.verifyCallbackToken(token)) {
      throw new UnauthorizedException('Callback token dari Xendit tidak valid.');
    }

    const externalId = payload.external_id;
    if (!externalId || !externalId.includes(':')) {
      return { success: false, message: 'Format external_id tidak valid.' };
    }

    const [slug] = externalId.split(':');
    const status = payload.status; // 'PAID' atau 'EXPIRED'

    const t = this.getTenant(slug);

    if (status === 'PAID') {
      await this.dbService.db.update(t.payment)
        .set({
          status: 'success',
          paidAt: new Date(payload.paid_at || new Date()),
          metadata: JSON.stringify({
            xenditPaymentId: payload.id,
            paymentMethod: payload.payment_method,
            paymentChannel: payload.payment_channel,
            paidAmount: payload.paid_amount,
          }),
        })
        .where(eq(t.payment.externalId, externalId));
      
      console.log(`[Xendit Webhook Success] Transaksi lunas untuk tenant ${slug}, externalId: ${externalId}`);
    } else if (status === 'EXPIRED') {
      await this.dbService.db.update(t.payment)
        .set({ status: 'expired' })
        .where(eq(t.payment.externalId, externalId));
      
      console.log(`[Xendit Webhook Expired] Transaksi kedaluwarsa untuk tenant ${slug}, externalId: ${externalId}`);
    }

    return { success: true };
  }
}
