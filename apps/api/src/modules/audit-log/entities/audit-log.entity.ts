import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class AuditLog {
  @Field(() => ID) id!: string;
  @Field(() => String) akademiId!: string;
  @Field(() => String, { nullable: true }) userId?: string;
  @Field(() => String) aksi!: string;
  @Field(() => String, { nullable: true }) entitas?: string;
  @Field(() => String, { nullable: true }) entitasId?: string;
  @Field(() => String, { nullable: true }) dataLama?: string;
  @Field(() => String, { nullable: true }) dataBaru?: string;
  @Field(() => String, { nullable: true }) ipAddress?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}
