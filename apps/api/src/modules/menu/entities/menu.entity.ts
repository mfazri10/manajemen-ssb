import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Menu {
  @Field(() => Int)
  id!: number;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  route?: string;

  @Field(() => String, { nullable: true })
  icon?: string;

  @Field(() => Int, { nullable: true })
  parentId?: number;

  @Field(() => Int)
  orderNo!: number;

  @Field(() => Boolean)
  isActive!: boolean;

  @Field(() => String)
  slug!: string;

  @Field(() => [Menu], { nullable: true })
  subMenus?: Menu[];

  @Field(() => Menu, { nullable: true })
  parent?: Menu;
}
