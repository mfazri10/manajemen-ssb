import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class Pengumuman {
  @Field(() => ID) id!: string;
  @Field(() => String) judul!: string;
  @Field(() => String) isi!: string;
  @Field(() => String, { defaultValue: 'semua' }) target!: string;
  @Field(() => String, { nullable: true }) kelompokUmurId?: string;
  @Field(() => String, { nullable: true }) tanggal?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}

@ObjectType()
export class Turnamen {
  @Field(() => ID) id!: string;
  @Field(() => String) nama!: string;
  @Field(() => String, { nullable: true }) tanggalMulai?: string;
  @Field(() => String, { nullable: true }) tanggalSelesai?: string;
  @Field(() => String, { nullable: true }) lokasi?: string;
  @Field(() => String, { nullable: true }) kategoriUmur?: string;
  @Field(() => String, { nullable: true }) hasil?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}

@ObjectType()
export class TurnamenPeserta {
  @Field(() => ID) id!: string;
  @Field(() => String) turnamenId!: string;
  @Field(() => String) siswaId!: string;
  @Field(() => String, { nullable: true }) posisi?: string;
  @Field(() => Int, { defaultValue: 0 }) gol!: number;
  @Field(() => Int, { defaultValue: 0 }) kartuKuning!: number;
  @Field(() => Int, { defaultValue: 0 }) kartuMerah!: number;
  @Field(() => Int, { nullable: true }) menitBermain?: number;
  @Field(() => String, { nullable: true }) catatan?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}

@ObjectType()
export class Inventaris {
  @Field(() => ID) id!: string;
  @Field(() => String) nama!: string;
  @Field(() => String, { nullable: true }) kategori?: string;
  @Field(() => Int, { defaultValue: 0 }) jumlah!: number;
  @Field(() => String, { defaultValue: 'pcs' }) satuan!: string;
  @Field(() => String, { defaultValue: 'baik' }) kondisi!: string;
  @Field(() => String, { nullable: true }) keterangan?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}

@ObjectType()
export class InventarisDistribusi {
  @Field(() => ID) id!: string;
  @Field(() => String) inventarisId!: string;
  @Field(() => String, { nullable: true }) siswaId?: string;
  @Field(() => Int, { defaultValue: 1 }) jumlah!: number;
  @Field(() => String) tanggal!: string;
  @Field(() => String, { defaultValue: 'dipinjam' }) status!: string;
  @Field(() => String, { nullable: true }) keterangan?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}

@ObjectType()
export class InventarisMutasi {
  @Field(() => ID) id!: string;
  @Field(() => String) inventarisId!: string;
  @Field(() => String) tipe!: string;
  @Field(() => Int) jumlah!: number;
  @Field(() => String) tanggal!: string;
  @Field(() => String, { nullable: true }) keterangan?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}
