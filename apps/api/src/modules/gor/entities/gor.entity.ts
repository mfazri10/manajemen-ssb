import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class Gor {
  @Field(() => ID)
  id: string;

  @Field()
  nama: string;

  @Field(() => String, { nullable: true })
  alamat?: string;

  @Field(() => String, { nullable: true })
  kota?: string;

  @Field(() => String, { nullable: true })
  telepon?: string;

  @Field(() => String, { nullable: true })
  deskripsi?: string;

  @Field(() => String, { nullable: true })
  fotoUrl?: string;

  @Field(() => String, { nullable: true })
  jamBuka?: string;

  @Field(() => String, { nullable: true })
  jamTutup?: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}