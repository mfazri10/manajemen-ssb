import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class JadwalLatihan {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  kelompokUmurId?: string;

  @Field(() => String, { nullable: true })
  hari?: string;

  @Field(() => String, { nullable: true })
  waktuMulai?: string;

  @Field(() => String, { nullable: true })
  waktuSelesai?: string;

  @Field(() => String, { nullable: true })
  lokasi?: string;

  @Field(() => String, { nullable: true })
  materi?: string;

  @Field(() => String, { nullable: true })
  tanggal?: string;

  @Field(() => String, { defaultValue: 'aktif' })
  status!: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}
