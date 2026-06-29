import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class Siswa {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  kelompokUmurId?: string;

  @Field(() => String, { nullable: true })
  nisn?: string;

  @Field(() => String, { nullable: true })
  nik?: string;

  @Field(() => String)
  namaLengkap!: string;

  @Field(() => String, { nullable: true })
  namaPanggilan?: string;

  @Field(() => String, { nullable: true })
  tempatLahir?: string;

  @Field(() => String)
  tanggalLahir!: string;

  @Field(() => String, { nullable: true })
  jenisKelamin?: string;

  @Field(() => String, { nullable: true })
  agama?: string;

  @Field(() => String, { nullable: true })
  posisiId?: string;

  @Field(() => Float, { nullable: true })
  tinggiBadan?: number;

  @Field(() => Float, { nullable: true })
  beratBadan?: number;

  @Field(() => String, { nullable: true })
  fotoUrl?: string;

  @Field(() => String, { defaultValue: 'pending' })
  status!: string;

  @Field(() => String, { nullable: true })
  klubSebelumnya?: string;

  @Field(() => String, { nullable: true })
  provinsi?: string;

  @Field(() => String, { nullable: true })
  kabupaten?: string;

  @Field(() => String, { nullable: true })
  kecamatan?: string;

  @Field(() => String, { nullable: true })
  desa?: string;

  @Field(() => String, { nullable: true })
  alamatLengkap?: string;

  @Field(() => String, { nullable: true })
  catatan?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
