import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Permission } from './permission.entity';

@ObjectType()
export class PermissionRole {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  permissionId!: number;

  @Field(() => Int)
  roleId!: number;

  @Field(() => Permission)
  permission!: Permission;
}

@ObjectType()
export class Role {
  @Field(() => Int)
  id!: number;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => [PermissionRole])
  permissionRoles!: PermissionRole[];

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
