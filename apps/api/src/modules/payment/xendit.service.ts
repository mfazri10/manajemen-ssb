import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class XenditService {
  private readonly logger = new Logger(XenditService.name);
  private readonly secretKey: string;
  private readonly callbackToken: string;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('XENDIT_SECRET_KEY') || 'xnd_development_dummy_key_12345';
    this.callbackToken = this.configService.get<string>('XENDIT_CALLBACK_TOKEN') || 'dummy_token_123';
  }

  /**
   * Membuat Invoice Baru di Xendit
   */
  async createInvoice(externalId: string, amount: number, payerEmail: string, description: string) {
    this.logger.log(`Creating Xendit invoice for externalId: ${externalId}, amount: ${amount}`);
    try {
      const authHeader = 'Basic ' + Buffer.from(this.secretKey + ':').toString('base64');
      const response = await fetch('https://api.xendit.co/v2/invoices', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          external_id: externalId,
          amount,
          payer_email: payerEmail,
          description,
          currency: 'IDR',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Xendit API Error: ${response.status} - ${errorText}`);
        throw new BadRequestException(`Xendit API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return {
        invoiceUrl: data.invoice_url as string,
        status: data.status as string,
        externalId: data.external_id as string,
      };
    } catch (error: any) {
      this.logger.error(`Failed to create invoice: ${error?.message}`);
      throw new BadRequestException(error?.message || 'Gagal menghubungi server Xendit.');
    }
  }

  /**
   * Memvalidasi Webhook Callback Token dari Xendit
   */
  verifyCallbackToken(token: string): boolean {
    if (!token) return false;
    return token === this.callbackToken;
  }
}
