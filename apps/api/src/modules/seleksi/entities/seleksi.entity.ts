import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class Seleksi {
  @Field(() => ID) id!: string;
  @Field(() => String) nama!: string;
  @Field(() => String, { nullable: true }) tanggal?: string;
  @Field(() => String, { nullable: true }) lokasi?: string;
  @Field(() => String, { nullable: true }) keterangan?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}

@ObjectType()
export class SeleksiPeserta {
  @Field(() => ID) id!: string;
  @Field(() => String) seleksiId!: string;
  @Field(() => String) siswaId!: string;
  @Field(() => String, { defaultValue: 'daftar' }) status!: string;
  @Field(() => Float, { nullable: true }) nilai?: number;
  @Field(() => String, { nullable: true }) catatan?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}
