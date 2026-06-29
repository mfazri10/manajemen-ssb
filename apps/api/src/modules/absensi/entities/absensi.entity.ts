import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Absensi {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  jadwalId!: string;

  @Field(() => String)
  siswaId!: string;

  @Field(() => String)
  tanggal!: string;

  @Field(() => String)
  status!: string;

  @Field(() => String, { nullable: true })
  keterangan?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}
