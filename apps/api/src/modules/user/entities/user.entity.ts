import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class UserRole {
  @Field(() => Int)
  id!: number;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  label?: string;
}

@ObjectType()
export class UserRoleUser {
  @Field(() => Int)
  id!: number;

  @Field(() => String)
  userId!: string;

  @Field(() => Int)
  roleId!: number;

  @Field(() => UserRole)
  role!: UserRole;
}

@ObjectType()
export class User {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  email!: string;

  @Field(() => Boolean)
  emailVerified!: boolean;

  @Field(() => String, { nullable: true })
  image?: string;

  @Field(() => [UserRoleUser])
  roleUsers!: UserRoleUser[];

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
