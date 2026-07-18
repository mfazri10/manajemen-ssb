import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Akademi {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  nama!: string;

  @Field(() => String)
  slug!: string;

  @Field(() => String, { nullable: true })
  logoUrl?: string;

  @Field(() => String, { nullable: true })
  alamat?: string;

  @Field(() => String, { nullable: true })
  noHp?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  website?: string;

  @Field(() => String)
  paket!: string;

  @Field(() => String)
  type!: string;

  @Field(() => Boolean)
  isActive!: boolean;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
