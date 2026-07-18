import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingStep, UserOnboardingSurvey } from './entities/onboarding.entity';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard)
export class OnboardingResolver {
  constructor(private readonly service: OnboardingService) {}

  @Query(() => [OnboardingStep], { name: 'myOnboardingProgress' })
  async getMyOnboardingProgress(@CurrentUser() userId: string) {
    return this.service.getProgress(userId);
  }

  @Query(() => UserOnboardingSurvey, { name: 'myOnboardingSurvey', nullable: true })
  async getMyOnboardingSurvey(@CurrentUser() userId: string) {
    const survey = await this.service.getSurvey(userId);
    if (!survey) return null;
    const s = survey as any;
    return {
      id: String(s.id),
      userId: s.userId,
      productType: s.productType,
      rawAnswers: s.rawAnswers ? JSON.stringify(s.rawAnswers) : undefined,
      isCompleted: s.isCompleted,
      completedAt: s.completedAt || undefined,
    };
  }

  @Mutation(() => UserOnboardingSurvey, { name: 'submitOnboardingSurvey' })
  async submitOnboardingSurvey(
    @CurrentUser() userId: string,
    @Args('productType') productType: string,
    @Args('rawAnswersJson', { nullable: true }) rawAnswersJson?: string,
  ) {
    let rawAnswers: any = null;
    if (rawAnswersJson) {
      try {
        rawAnswers = JSON.parse(rawAnswersJson);
      } catch {
        rawAnswers = { answers: rawAnswersJson };
      }
    }

    const survey = await this.service.saveSurvey(userId, productType, rawAnswers);
    const s = survey as any;
    return {
      id: String(s.id),
      userId: s.userId,
      productType: s.productType,
      rawAnswers: s.rawAnswers ? JSON.stringify(s.rawAnswers) : undefined,
      isCompleted: s.isCompleted,
      completedAt: s.completedAt || undefined,
    };
  }
}
