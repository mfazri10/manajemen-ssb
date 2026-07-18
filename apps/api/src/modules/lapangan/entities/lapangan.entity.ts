import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class Lapangan {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  gorId!: string;

  @Field()
  nama!: string;

  @Field()
  tipe!: string;

  @Field(() => String, { nullable: true })
  permukaan?: string;

  @Field(() => Boolean, { nullable: true })
  indoor?: boolean;

  @Field(() => Float)
  tarifPerJam!: number;

  @Field(() => Int, { nullable: true })
  kapasitas?: number;

  @Field(() => String, { nullable: true })
  fotoUrl?: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  keterangan?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}