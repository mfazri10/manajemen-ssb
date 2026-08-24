import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Payment } from './entities/payment.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class PaymentResolver {
  constructor(private readonly service: PaymentService) {}

  @Query(() => [Payment], { name: 'payments' })
  @RequirePermissions('payment.index')
  async getPayments(
    @CurrentUser() userId: string,
    @Args('akademiId', { nullable: true }) akademiId?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    // Jika klien tidak mengirim akademiId, ambil dari tenant aktif (schema publik)
    const resolvedAkademiId = akademiId || (await this.service.resolveAkademiId(slug));
    return this.service.findAll(slug, resolvedAkademiId);
  }

  @Query(() => Payment, { name: 'paymentById' })
  @RequirePermissions('payment.index')
  async getPaymentById(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.findById(slug, id);
  }

  @Mutation(() => Payment, { name: 'createPayment' })
  @RequirePermissions('payment.create')
  async createPayment(
    @CurrentUser() userId: string,
    @Args('langgananId', { type: () => ID }) langgananId: string,
    @Args('method') method: string,
    @Args('affiliateRef', { nullable: true }) affiliateRef?: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    // Resolve akademiId dari tenant aktif agar record payment terhubung ke akademi yang benar
    const akademiId = await this.service.resolveAkademiId(slug);
    return this.service.createPayment(slug, akademiId, langgananId, method, affiliateRef);
  }

  @Mutation(() => Payment, { name: 'checkPaymentStatus' })
  @RequirePermissions('payment.index')
  async checkPaymentStatus(
    @CurrentUser() userId: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.checkPaymentStatus(slug, id);
  }
}
