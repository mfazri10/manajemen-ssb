import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsArray } from 'class-validator';

@InputType()
export class UpdateUserRolesInput {
  @Field(() => String)
  @IsString()
  userId!: string;

  @Field(() => [Int])
  @IsArray()
  roleIds!: number[];
}
