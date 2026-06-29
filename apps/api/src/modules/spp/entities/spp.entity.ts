import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class SppTagihan {
  @Field(() => ID) id!: string;
  @Field(() => String) siswaId!: string;
  @Field(() => Number) bulan!: number;
  @Field(() => Number) tahun!: number;
  @Field(() => Float) jumlah!: number;
  @Field(() => String, { defaultValue: 'belum' }) status!: string;
  @Field(() => String, { nullable: true }) jatuhTempo?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}

@ObjectType()
export class SppPembayaran {
  @Field(() => ID) id!: string;
  @Field(() => String) tagihanId!: string;
  @Field(() => String) tanggalBayar!: string;
  @Field(() => Float) jumlah!: number;
  @Field(() => String, { nullable: true }) metode?: string;
  @Field(() => String, { nullable: true }) buktiUrl?: string;
  @Field(() => String, { nullable: true }) keterangan?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}
