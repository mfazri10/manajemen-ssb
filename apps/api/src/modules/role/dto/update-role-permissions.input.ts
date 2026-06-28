import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsArray } from 'class-validator';

@InputType()
export class UpdateRolePermissionsInput {
  @Field(() => Int)
  @IsInt()
  roleId!: number;

  @Field(() => [Int])
  @IsArray()
  permissionIds!: number[];
}
