import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class BukuKas {
  @Field(() => ID) id!: string;
  @Field(() => String) tanggal!: string;
  @Field(() => String) tipe!: string;
  @Field(() => String, { nullable: true }) kategori?: string;
  @Field(() => Float) jumlah!: number;
  @Field(() => String, { nullable: true }) keterangan?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}

@ObjectType()
export class Tabungan {
  @Field(() => ID) id!: string;
  @Field(() => String) siswaId!: string;
  @Field(() => String) tanggal!: string;
  @Field(() => String) tipe!: string;
  @Field(() => Float) jumlah!: number;
  @Field(() => String, { nullable: true }) keterangan?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}

@ObjectType()
export class TesFisik {
  @Field(() => ID) id!: string;
  @Field(() => String) siswaId!: string;
  @Field(() => String, { nullable: true }) kelompokUmurId?: string;
  @Field(() => String) tanggal!: string;
  @Field(() => String) jenisTes!: string;
  @Field(() => Float) nilai!: number;
  @Field(() => String, { nullable: true }) satuan?: string;
  @Field(() => String, { nullable: true }) catatan?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}

@ObjectType()
export class Evaluasi {
  @Field(() => ID) id!: string;
  @Field(() => String) siswaId!: string;
  @Field(() => String, { nullable: true }) pelatihId?: string;
  @Field(() => String) semester!: string;
  @Field(() => String) tahunAjaran!: string;
  @Field(() => Number, { nullable: true }) teknik?: number;
  @Field(() => Number, { nullable: true }) fisik?: number;
  @Field(() => Number, { nullable: true }) taktik?: number;
  @Field(() => Number, { nullable: true }) mental?: number;
  @Field(() => String, { nullable: true }) catatanPelatih?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}

@ObjectType()
export class PelanggaranSiswa {
  @Field(() => ID) id!: string;
  @Field(() => String) siswaId!: string;
  @Field(() => String, { nullable: true }) masterPelanggaranId?: string;
  @Field(() => String) tanggal!: string;
  @Field(() => String, { nullable: true }) keterangan?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}
