import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class KelompokUmur {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  nama!: string;

  @Field(() => Int, { nullable: true })
  usiaMin?: number;

  @Field(() => Int, { nullable: true })
  usiaMax?: number;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}

@ObjectType()
export class MasterPosisi {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  kode!: string;

  @Field(() => String)
  nama!: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}

@ObjectType()
export class MasterPelanggaran {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  nama!: string;

  @Field(() => Int, { nullable: true })
  poin?: number;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}
