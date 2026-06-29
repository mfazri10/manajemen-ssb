import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class MateriKategori {
  @Field(() => ID) id!: string;
  @Field(() => String) nama!: string;
  @Field(() => Int, { defaultValue: 0 }) urutan!: number;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}

@ObjectType()
export class MateriLatihan {
  @Field(() => ID) id!: string;
  @Field(() => String, { nullable: true }) kategoriId?: string;
  @Field(() => String, { nullable: true }) kelompokUmurId?: string;
  @Field(() => String) judul!: string;
  @Field(() => String, { nullable: true }) deskripsi?: string;
  @Field(() => Int, { nullable: true }) durasiMenit?: number;
  @Field(() => String, { defaultValue: 'pemula' }) level!: string;
  @Field(() => String, { defaultValue: 'teknik' }) tipe!: string;
  @Field(() => String, { nullable: true }) instruksi?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}
