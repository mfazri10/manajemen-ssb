import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardSummary } from './entities/dashboard.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard, PermissionsGuard)
export class DashboardResolver {
  constructor(private readonly service: DashboardService) {}

  @Query(() => DashboardSummary, { name: 'dashboardSummary' })
  async getSummary(@CurrentUser() userId: string) {
    const slug = await this.service.resolveTenantSlug(userId);
    return this.service.getSummary(slug);
  }
}
