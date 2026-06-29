import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class Payment {
  @Field(() => ID) id!: string;
  @Field(() => String) akademiId!: string;
  @Field(() => String, { nullable: true }) langgananId?: string;
  @Field(() => Float) amount!: number;
  @Field(() => String) method!: string;
  @Field(() => String, { nullable: true }) externalId?: string;
  @Field(() => String, { defaultValue: 'pending' }) status!: string;
  @Field(() => Date, { nullable: true }) paidAt?: Date;
  @Field(() => String, { nullable: true }) metadata?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
  @Field(() => Date, { nullable: true }) updatedAt?: Date;
}
