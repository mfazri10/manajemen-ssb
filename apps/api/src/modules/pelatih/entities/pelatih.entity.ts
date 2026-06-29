import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Pelatih {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => String)
  namaLengkap!: string;

  @Field(() => String, { nullable: true })
  noHp?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  tempatLahir?: string;

  @Field(() => String, { nullable: true })
  tanggalLahir?: string;

  @Field(() => String, { nullable: true })
  fotoUrl?: string;

  @Field(() => String, { defaultValue: 'aktif' })
  status!: string;

  @Field(() => String, { nullable: true })
  provinsi?: string;

  @Field(() => String, { nullable: true })
  kabupaten?: string;

  @Field(() => String, { nullable: true })
  kecamatan?: string;

  @Field(() => String, { nullable: true })
  desa?: string;

  @Field(() => String, { nullable: true })
  catatan?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class PelatihLisensi {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  pelatihId!: string;

  @Field(() => String)
  lisensi!: string;

  @Field(() => String, { nullable: true })
  lisensiLainnya?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}

@ObjectType()
export class PelatihJabatan {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  pelatihId!: string;

  @Field(() => String, { nullable: true })
  kelompokUmurId?: string;

  @Field(() => String)
  jabatan!: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}
