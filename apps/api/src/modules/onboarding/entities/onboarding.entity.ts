import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class OnboardingStep {
  @Field(() => String)
  step!: string;

  @Field(() => Boolean)
  completed!: boolean;
}

@ObjectType()
export class UserOnboardingSurvey {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  userId!: string;

  @Field(() => String)
  productType!: string;

  @Field(() => String, { nullable: true })
  rawAnswers?: string;

  @Field(() => Boolean)
  isCompleted!: boolean;

  @Field(() => Date, { nullable: true })
  completedAt?: Date;
}
